//layout\layout.js

import { navigate } from "../app/router.js";
import { store } from "../app/store.js";

let layoutLoaded = false;

// ==================================
// Load layout duy nhất 1 lần (SPA SAFE)
// ==================================
export async function loadLayoutOnce() {
  if (layoutLoaded) return;

  const root = document.getElementById("root");
  if (!root) return;

  const res = await fetch("./layout/layout.html");
  if (!res.ok) {
    console.error("Không load được layout.html");
    return;
  }

  // 1️⃣ Inject layout
  root.innerHTML = await res.text();

  // 2️⃣ Render menu (Header + Bottom)
  renderMenu(document.getElementById("headerMenu"), "header");
  renderMenu(document.getElementById("bottomMenu"), "bottom");

  // 3️⃣ Bind các trình theo dõi thay đổi kích thước
  bindHeaderMenuObserver();
  bindActiveNavResize();

  // 4️⃣ Các xử lý layout
  applyHeaderOffset();
  window.addEventListener("resize", applyHeaderOffset);

  // 🔥 KÍCH HOẠT KÉO CHUỘT (DESKTOP)
  enableNavDragScroll();

  const navMenu = document.querySelector(".nav__menu--header .nav__menu");
  if (navMenu) {
    updateNavFade();
    navMenu.addEventListener("scroll", updateNavFade, { passive: true });
    window.addEventListener("resize", updateNavFade);

    // Lưu ý: Không cần thêm listener updateActiveNav khi scroll ở đây
    // vì dùng offsetLeft giúp Line tự trôi theo cha.
  }

  bindTemplateNav();
  bindMobileViewportFix();

  // 5️⃣ Sync theme + sidenav
  bindRightSidenavAutoClose();
  if (window.updateThemeIcon) {
    window.updateThemeIcon();
  }

  // 6️⃣ SYNC ACTIVE NAV LẦN ĐẦU
  const currentPath = window.location.hash?.replace("#", "") || "/";
  const matchedItem = MENU_ITEMS.find((item) => item.path === currentPath);
  if (matchedItem) {
    updateActiveNav(matchedItem.path);
  }

  // 7️⃣ Đảm bảo vị trí Line chuẩn xác sau khi Layout ổn định
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (__currentActivePath) updateActiveNav(__currentActivePath);
    });
  });

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      if (__currentActivePath) updateActiveNav(__currentActivePath);
    });
  }

  layoutLoaded = true;
}
// ==================================
// Recalculate active nav line on resize
// ==================================

// ==================================
// Render menu items
// ==================================
// ==================================
// Render menu items
// ==================================
function renderMenu(listEl, type = "header") {
  if (!listEl) return;

  listEl.innerHTML = MENU_ITEMS.map((item) => {
    if (type === "bottom") {
      return `
        <li class="nav__item">
          <a href="${item.href}" data-tab="${item.key}" class="nav__link">
            <i class="fa-solid ${item.icon} nav__icon"></i>
            <span class="nav__name">${item.label}</span>
          </a>
        </li>
      `;
    }

    return `
      <li class="nav__item">
        <a href="${item.href}" data-tab="${item.key}" class="nav__link">
          <span class="nav__name">${item.label}</span>
        </a>
      </li>
    `;
  }).join("");

  // 🔥 THÊM underline 1 lần duy nhất
  if (type === "header") {
    const menuWrap = listEl.closest(".nav__menu");
    if (menuWrap && !menuWrap.querySelector("#navActiveLine")) {
      if (type === "header" && !listEl.querySelector("#navActiveLine")) {
        listEl.insertAdjacentHTML(
          "beforeend",
          `<div class="nav__active-line" id="navActiveLine"></div>`,
        );
      }
    }
  }
}

// ==================================
// Update active state for navbar (Top + Bottom)
// Single active class: .is-active
// ==================================
import { MENU_ITEMS } from "../assets/js/menu.config.js";

// ==================================
// Update active nav based on MENU_ITEMS
// ==================================

// ==================================
// Update active nav + move active line (HEADER)
// ==================================

let __currentActivePath = null;
// ==================================
// Update active nav + move active line (HEADER)
// Bổ sung: Tự động cuộn tab active ra vùng hiển thị
// ==================================
export function updateActiveNav(path) {
  const matchedItem = MENU_ITEMS.find((item) => item.path === path);
  if (!matchedItem) return;

  __currentActivePath = path;

  // Sync class active
  document
    .querySelectorAll(".nav__link[data-tab]")
    .forEach((el) => el.classList.remove("is-active"));

  const activeLink = document.querySelector(
    `.nav__menu--header .nav__link[data-tab="${matchedItem.key}"]`,
  );

  const line = document.getElementById("navActiveLine");
  if (!activeLink || !line) {
    if (line) line.style.opacity = 0;
    return;
  }

  activeLink.classList.add("is-active");

  const paddingX = 8;
  const parentLi = activeLink.parentElement;

  // 1️⃣ Cập nhật vị trí Line (Tọa độ Local)
  const left = parentLi.offsetLeft + paddingX;
  const width = parentLi.offsetWidth - paddingX * 2;

  line.style.transform = `translateX(${left}px)`;
  line.style.width = `${width}px`;
  line.style.opacity = 1;

  // 2️⃣ TỰ ĐỘNG CUỘN MENU (Mới bổ sung)
  scrollActiveToCenter(parentLi);
}

// ==================================
// Cuộn tab được chọn vào giữa vùng nhìn thấy
// ==================================
function scrollActiveToCenter(activeItem) {
  const menu = document.querySelector(".nav__menu--header .nav__menu");
  if (!menu || !activeItem) return;

  // Tính toán vị trí tâm của menu
  const menuWidth = menu.clientWidth;
  const itemWidth = activeItem.offsetWidth;
  const itemLeft = activeItem.offsetLeft;

  // Vị trí cuộn mục tiêu = vị trí mục đó - (nửa chiều rộng menu) + (nửa chiều rộng mục đó)
  // Điều này đưa mục active vào chính giữa menu.
  const targetScroll = itemLeft - menuWidth / 2 + itemWidth / 2;

  menu.scrollTo({
    left: targetScroll,
    behavior: "smooth",
  });
}
// ==================================
// Handle breakpoint switch (MOBILE <-> DESKTOP)
// ==================================
const desktopMQ = window.matchMedia("(min-width: 769px)");

desktopMQ.addEventListener("change", (e) => {
  if (!__currentActivePath) return;

  // Chỉ xử lý khi CHUYỂN SANG DESKTOP
  if (e.matches) {
    // chờ layout + font + clamp ổn định
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateActiveNav(__currentActivePath);
      });
    });
  }
});
// ==================================
// Recalculate active nav line on resize (REALTIME & STABLE)
// ==================================
function bindActiveNavResize() {
  let t = null;

  window.addEventListener("resize", () => {
    if (!__currentActivePath) return;

    const line = document.getElementById("navActiveLine");
    if (line) line.classList.add("no-transition");

    cancelAnimationFrame(t);
    t = requestAnimationFrame(() => {
      updateActiveNav(__currentActivePath);

      clearTimeout(line?._t);
      line._t = setTimeout(() => {
        line.classList.remove("no-transition");
      }, 80);
    });
  });
}

// ==================================
// Observe header menu size change (REALTIME)
// ==================================
function bindHeaderMenuObserver() {
  const menu = document.querySelector(".nav__menu--header");
  if (!menu || !window.ResizeObserver) return;

  const ro = new ResizeObserver(() => {
    if (!__currentActivePath) return;

    requestAnimationFrame(() => {
      updateActiveNav(__currentActivePath);
    });
  });

  ro.observe(menu);
}

// ==================================
// Bind click cho nav template
// Lấy route từ MENU_ITEMS (single source of truth)
// ==================================
export function bindTemplateNav() {
  document.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", (e) => {
      const tab = link.dataset.tab;
      if (!tab) return;

      e.preventDefault();

      // Tìm menu item theo key
      const matchedItem = MENU_ITEMS.find((item) => item.key === tab);
      if (!matchedItem) return;

      navigate(matchedItem.path);
    });
  });

  // ==================================
  // Role permission: sales không thấy users
  // ==================================
  if (store.user?.role === "sales") {
    document
      .querySelectorAll('[data-tab="users"]')
      .forEach((el) => el.parentElement.classList.add("hidden"));
  }
}

// ==================================
// Scroll Rebound for Short Content
// Fixed header-safe version
// ==================================
function applyScrollRebound() {
  const container = document.getElementById("page-content");
  if (!container) return;

  let timer = null;

  container.addEventListener(
    "scroll",
    () => {
      clearTimeout(timer);

      timer = setTimeout(() => {
        const contentHeight = container.scrollHeight;
        const viewHeight = container.clientHeight;

        // chỉ xử lý trang ngắn
        if (contentHeight <= viewHeight) {
          if (container.scrollTop !== 0) {
            container.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }
        }
      }, 120);
    },
    { passive: true },
  );
}

window.__applyScrollRebound = applyScrollRebound;

// ==================================
// RIGHT SIDENAV CONTROL
// ==================================

// ==================================
// Mở Right Sidenav + đổi icon sang X
// ==================================
window.openNavRight = function () {
  document.getElementById("rightSidenav")?.classList.add("open");
  document.getElementById("rightSidenavOverlay")?.classList.add("show");

  document.body.style.overflow = "hidden";

  const btn = document.getElementById("btnRightNav");
  const icon = btn?.querySelector("i");

  if (icon) {
    icon.classList.remove("fa-bars"); // ✅ ĐÚNG
    icon.classList.add("fa-xmark"); // hoặc fa-x
  }
};

// ==================================
// Đóng Right Sidenav + trả icon về bars
// ==================================
window.closeNavRight = function () {
  document.getElementById("rightSidenav")?.classList.remove("open");
  document.getElementById("rightSidenavOverlay")?.classList.remove("show");

  document.body.style.overflow = "";

  const btn = document.getElementById("btnRightNav");
  const icon = btn?.querySelector("i");

  if (icon) {
    icon.classList.remove("fa-xmark");
    icon.classList.add("fa-bars");
  }
};

// ==================================
// Toggle Right Sidenav + Icon (bars <-> x)
// ==================================
window.toggleNavRight = function () {
  const sidenav = document.getElementById("rightSidenav");
  const overlay = document.getElementById("rightSidenavOverlay");
  const btn = document.getElementById("btnRightNav");
  const icon = btn?.querySelector("i");

  if (!sidenav || !icon) return;

  const isOpen = sidenav.classList.toggle("open");
  overlay?.classList.toggle("show", isOpen);

  // khóa / mở scroll nền
  document.body.style.overflow = isOpen ? "hidden" : "";

  // đổi icon
  icon.classList.toggle("fa-bars", !isOpen);
  icon.classList.toggle("fa-xmark", isOpen);
};

// gọi sau khi đã set user
// ==================================
// Fill user info in right sidenav
// ==================================
window.fillSidenavUserInfo = function () {
  if (!store.user) return;

  const { full_name, username, role } = store.user;

  document.getElementById("sidenavFullName").textContent =
    full_name || username;

  document.getElementById("sidenavUsername").textContent = username;

  document.getElementById("sidenavRole").textContent = roleToLabel(role);
};

// ==================================
// Auto close right sidenav when click link
// ==================================
function bindRightSidenavAutoClose() {
  const sidenav = document.getElementById("rightSidenav");
  if (!sidenav) return;

  sidenav.addEventListener("click", (e) => {
    const link = e.target.closest("a[href^='#/']");
    if (!link) return;

    // đóng menu sau khi click link
    window.closeNavRight?.();
  });
}

// ==================================
// Update navbar fade indicators (STABLE)
// ==================================
function updateNavFade() {
  const menu = document.getElementById("nav-menu");
  const wrap = document.querySelector(".nav__menu-wrap");

  if (!menu || !wrap) return;

  const { scrollLeft, scrollWidth, clientWidth } = menu;

  wrap.classList.toggle("has-left", scrollLeft > 4);
  wrap.classList.toggle(
    "has-right",
    scrollLeft + clientWidth < scrollWidth - 4,
  );
}

// ==================================
// Drag to scroll navbar (desktop)
// ==================================

function enableNavDragScroll() {
  const menu = document.querySelector(".nav__menu--header .nav__menu");
  if (!menu) return;

  let isDown = false;
  let startX;
  let scrollLeft;
  let moveDistance = 0; // Tính khoảng cách đã kéo

  menu.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return; // Chỉ nhận chuột trái
    isDown = true;
    moveDistance = 0; // Reset khi click xuống
    menu.classList.add("dragging");

    startX = e.pageX - menu.offsetLeft;
    scrollLeft = menu.scrollLeft;

    // Tắt smooth để kéo dính theo chuột
    menu.style.scrollBehavior = "auto";
  });

  // Sự kiện MouseUp trên toàn tài liệu để đảm bảo nhả chuột ra là dừng
  window.addEventListener("mouseup", () => {
    if (!isDown) return;
    isDown = false;
    menu.classList.remove("dragging");
    menu.style.scrollBehavior = "smooth";
  });

  menu.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();

    const x = e.pageX - menu.offsetLeft;
    const walk = x - startX;
    moveDistance += Math.abs(walk); // Cộng dồn khoảng cách di chuyển
    menu.scrollLeft = scrollLeft - walk;
  });

  // 🔥 CHẶN CLICK KHI ĐANG DRAG
  // Nếu di chuyển > 5px thì chặn sự kiện click vào link
  menu.addEventListener(
    "click",
    (e) => {
      if (moveDistance > 5) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true,
  ); // Dùng true để bắt ở Capture phase
}

// ==================================
// Apply header offset for fixed header
// ==================================
function applyHeaderOffset() {
  const header = document.getElementById("header");
  const main = document.getElementById("page-content");
  if (!header || !main) return;

  const h = header.getBoundingClientRect().height;
  main.style.paddingTop = h + 16 + "px"; // +16px cho thoáng
}

// ==================================
// Giữ header & bottom nav khi keyboard mở (mobile)
// ==================================
export function bindMobileViewportFix() {
  if (!window.visualViewport) return;

  const header = document.querySelector(".header");
  const bottomNav = document.querySelector(".nav__menu");

  const update = () => {
    const offset = window.innerHeight - window.visualViewport.height;

    if (header) header.style.transform = `translateY(0)`;
    if (bottomNav) {
      bottomNav.style.transform = `translateY(-${offset}px)`;
    }
  };

  window.visualViewport.addEventListener("resize", update);
  window.visualViewport.addEventListener("scroll", update);
}
