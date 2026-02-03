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

  bindTemplateNav();
  // 🔥 BẮT BUỘC: sync icon dark/light sau khi render layout
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
// Active tab theo route (TEMPLATE STYLE)
// ==================================
export function updateActiveNav(path) {
  document
    .querySelectorAll(".nav-item")
    .forEach((el) => el.classList.remove("nav-active"));

  const mobile = document.querySelector(`.nav-item[data-tab="${tab}"]`);
  if (mobile) mobile.classList.add("nav-active");

  const map = {
    "/": "home",
    "/users": "users",
    "/profile": "profile",
  };

  const tab = map[path];
  if (!tab) return;

  const el = document.querySelector(`[data-tab="${tab}"]`);
  if (el) el.classList.add("active-link");
}

// ==================================
// Advanced Theme Toggle Animation
// ==================================
document.addEventListener("click", (e) => {
  const btn = e.target.closest("#themeToggle");
  if (!btn) return;

  const isDark = document.documentElement.classList.contains("dark");

  // clear state cũ
  btn.classList.remove("rotate-cw", "rotate-ccw", "ripple");

  // force reflow để animation luôn chạy lại
  void btn.offsetWidth;

  // hướng xoay
  btn.classList.add(isDark ? "rotate-ccw" : "rotate-cw");

  // ripple
  btn.classList.add("ripple");

  // cleanup
  setTimeout(() => {
    btn.classList.remove("rotate-cw", "rotate-ccw", "ripple");
  }, 600);
});
