// app/router.js
// ==================================
// SPA Router dùng hash (#)
// ==================================
import { renderHome } from "../pages/home.page.js";
import { renderUsers } from "../pages/users.page.js";
import { renderProfile } from "../pages/profile.page.js";

const routes = {
  "/": renderHome,
  "/users": renderUsers,
  "/profile": renderProfile,
};

export function navigate(path) {
  location.hash = path;
}

export function renderRoute() {
  const path = location.hash.replace("#", "") || "/";
  const fn = routes[path] || renderHome;
  fn();
}

window.addEventListener("hashchange", renderRoute);
