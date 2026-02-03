// app/router.js
// ==================================
// SPA Router dùng hash (#)
// ==================================
import { renderHome } from "../pages/home.page.js";
import { renderUsers } from "../pages/users.page.js";
import { renderProfile } from "../pages/profile.page.js";
import { updateActiveNav } from "../layout/layout.js";
import { renderSales } from "../pages/sales.page.js";

const routes = {
  "/": renderHome,
  "/users": renderUsers,
  "/profile": renderProfile,
  "/sales": renderSales,
};

export function navigate(path) {
  location.hash = path;
}
export function renderRoute() {
  const raw = location.hash.replace("#", "");
  const path = raw || "/";
  const fn = routes[path];

  if (!fn) {
    navigate("/");
    return;
  }

  fn();
  updateActiveNav(path);

  // ==================================
  // Apply scroll rebound after render
  // ==================================
  requestAnimationFrame(() => {
    window.__applyScrollRebound?.();
  });
}

window.addEventListener("hashchange", renderRoute);
