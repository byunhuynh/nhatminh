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

  root.innerHTML = await res.text();

  applyHeaderOffset();
  window.addEventListener("resize", applyHeaderOffset);

  enableNavDragScroll();
  const navMenu = document.getElementById("nav-menu");
  if (navMenu) {
    updateNavFade();
    navMenu.addEventListener("scroll", updateNavFade, { passive: true });
    window.addEventListener("resize", updateNavFade);
  }
  bindTemplateNav();
  // 🔥 BẮT BUỘC: sync icon dark/light sau khi render layout
  bindRightSidenavAutoClose(); // ✅ THÊM DÒNG NÀY
  if (window.updateThemeIcon) {
    window.updateThemeIcon();
  }
  layoutLoaded = true;
}

// ==================================
// Bind navigation SPA
// ==================================
function bindTemplateNav() {
  document.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", (e) => {
      const tab = link.dataset.tab;
      if (!tab) return;

      e.preventDefault();

      const map = {
        home: "/",
        users: "/users",
        profile: "/profile",
        sales: "/sales", // ✅ NEW
      };

      navigate(map[tab]);
    });
  });

  // Role permission: sales không thấy users
  if (store.user?.role === "sales") {
    document
      .querySelectorAll('[data-tab="users"]')
      .forEach((el) => el.parentElement.classList.add("hidden"));
  }
}
// ==================================
// Update active state for navbar (Top + Bottom)
// Single active class: .is-active
// ==================================
// ==================================
// Update active state for navbar
// Auto scroll active tab into view
// ==================================
export function updateActiveNav(path) {
  const routeMap = {
    "/": "home",
    "/users": "users",
    "/profile": "profile",
    "/sales": "sales",
  };

  const tab = routeMap[path];
  if (!tab) return;

  document
    .querySelectorAll("[data-tab]")
    .forEach((el) => el.classList.remove("is-active"));

  const actives = document.querySelectorAll(`[data-tab="${tab}"]`);

  actives.forEach((el) => {
    el.classList.add("is-active");

    // 🔥 auto scroll tab into view
    el.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  });
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
window.openNavRight = function () {
  document.getElementById("rightSidenav")?.classList.add("open");
  document.getElementById("rightSidenavOverlay")?.classList.add("show");

  // khóa scroll nền
  document.body.style.overflow = "hidden";
};

window.closeNavRight = function () {
  document.getElementById("rightSidenav")?.classList.remove("open");
  document.getElementById("rightSidenavOverlay")?.classList.remove("show");

  document.body.style.overflow = "";
};
// ==================================
// Fill user info in right sidenav
// ==================================
function fillSidenavUserInfo() {
  if (!store.user) return;

  const { full_name, username, role } = store.user;

  const nameEl = document.getElementById("sidenavFullName");
  const userEl = document.getElementById("sidenavUsername");
  const roleEl = document.getElementById("sidenavRole");

  if (nameEl) nameEl.textContent = full_name || username;
  if (userEl) userEl.textContent = username;
  if (roleEl) roleEl.textContent = roleToLabel(role);
}

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
  const menu = document.getElementById("nav-menu");
  if (!menu) return;

  let isDown = false;
  let startX = 0;
  let scrollStart = 0;

  menu.addEventListener("mousedown", (e) => {
    // chỉ desktop
    if (e.button !== 0) return;

    isDown = true;
    startX = e.pageX;
    scrollStart = menu.scrollLeft;
    menu.classList.add("dragging");
  });

  document.addEventListener("mouseup", () => {
    isDown = false;
    menu.classList.remove("dragging");
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();

    const dx = e.pageX - startX;
    menu.scrollLeft = scrollStart - dx;
  });
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
// MOBILE KEYBOARD SAFE VIEWPORT FIX
// Giữ header + bottom nav không bị mất khi keyboard open
// ==================================
(function bindMobileKeyboardFix() {
  if (!window.visualViewport) return;

  const header = document.getElementById("header");
  const bottomNav = document.querySelector(".nav__menu"); // bottom nav mobile

  function update() {
    const vv = window.visualViewport;

    // chiều cao bị keyboard chiếm
    const keyboardHeight = window.innerHeight - (vv.height + vv.offsetTop);

    const offset = Math.max(0, keyboardHeight);

    // đẩy header xuống nếu cần
    if (header) {
      header.style.transform =
        offset > 0 ? `translateY(${vv.offsetTop}px)` : "";
    }

    // kéo bottom nav lên trên keyboard
    if (bottomNav) {
      bottomNav.style.transform = offset > 0 ? `translateY(-${offset}px)` : "";
    }
  }

  visualViewport.addEventListener("resize", update);
  visualViewport.addEventListener("scroll", update);
})();
