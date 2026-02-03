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
export function updateActiveNav(path) {
  const routeMap = {
    "/": "home",
    "/users": "users",
    "/profile": "profile",
    "/sales": "sales", // ✅ NEW
  };

  const tab = routeMap[path];
  if (!tab) return;

  // ===============================
  // RESET ALL
  // ===============================
  document
    .querySelectorAll("[data-tab]")
    .forEach((el) => el.classList.remove("is-active"));

  // ===============================
  // SET ACTIVE
  // ===============================
  document
    .querySelectorAll(`[data-tab="${tab}"]`)
    .forEach((el) => el.classList.add("is-active"));
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
