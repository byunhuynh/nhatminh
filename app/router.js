// app/router.js
// ==================================
// SPA Router dùng hash (#)
// ==================================
import { renderHome, unmountHome } from "../pages/home.page.js";
import { renderUsers } from "../pages/users.page.js";
import { renderProfile } from "../pages/profile.page.js";
import { updateActiveNav } from "../layout/layout.js";
import { renderSales } from "../pages/sales.page.js";
import { renderChangePassword } from "../pages/change-password.page.js";

let currentUnmount = null;

const routes = {
  "/": {
    render: renderHome,
    unmount: unmountHome,
  },
  "/users": { render: renderUsers },
  "/profile": { render: renderProfile },
  "/sales": { render: renderSales },
  "/change-password": { render: renderChangePassword },
};

export function navigate(path) {
  location.hash = path;
}

export function renderRoute() {
  const raw = location.hash.replace("#", "");
  const path = raw || "/";
  const route = routes[path];

  if (!route) {
    navigate("/");
    return;
  }

  // ===============================
  // UNMOUNT PAGE CŨ (SPA SAFE)
  // ===============================
  if (typeof currentUnmount === "function") {
    currentUnmount();
    currentUnmount = null;
  }

  route.render();
  currentUnmount = route.unmount || null;

  updateActiveNav(path);

  requestAnimationFrame(() => {
    window.__applyScrollRebound?.();
    window.applyHeaderOffset?.();
  });
}

window.addEventListener("hashchange", renderRoute);
