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
  renderMenu(document.getElementById("headerMenu"), "header");
  renderMenu(document.getElementById("bottomMenu"), "bottom");
  bindTemplateNav();
  bindMobileViewportFix();

  // 🔥 BẮT BUỘC: sync icon dark/light sau khi render layout
  bindRightSidenavAutoClose(); // ✅ THÊM DÒNG NÀY
  if (window.updateThemeIcon) {
    window.updateThemeIcon();
  }
  layoutLoaded = true;
}

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
          ${item.label}
        </a>
      </li>
    `;
  }).join("");
}

// ==================================
// Update active state for navbar (Top + Bottom)
// Single active class: .is-active
// ==================================
import { MENU_ITEMS } from "/assets/js/menu.config.js";

export function updateActiveNav(path) {
  const matchedItem = MENU_ITEMS.find((item) => item.path === path);
  if (!matchedItem) return;

  const tab = matchedItem.key;

  document
    .querySelectorAll("[data-tab]")
    .forEach((el) => el.classList.remove("is-active"));

  document.querySelectorAll(`[data-tab="${tab}"]`).forEach((el) => {
    el.classList.add("is-active");

    // auto scroll tab into view (chỉ khi cần)
    el.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  });
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
