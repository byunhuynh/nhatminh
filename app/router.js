// ==================================
// SPA Router – DMS UPDATED
// ==================================
import { renderHome, unmountHome } from "../pages/home.page.js";
import { renderUsers } from "../pages/users.page.js";
import { renderProfile } from "../pages/profile.page.js";
import { renderProducts } from "../pages/products.page.js";
import { renderDms } from "../pages/dms.page.js";
import { renderSales } from "../pages/sales.page.js";
import { renderOrderForm } from "../pages/order-form.page.js";
import { updateActiveNav } from "../layout/layout.js";

let currentUnmount = null;

const routes = {
  "/": { render: renderHome, unmount: unmountHome },
  "/users": { render: renderUsers },
  "/profile": { render: renderProfile },
  "/products": { render: renderProducts },
  "/dms": { render: renderDms },
  "/sales-report": { render: renderSales }, // ✅ Đã sửa dấu comment
  "/order-create": { render: renderOrderForm }, // ✅ Đã sửa dấu comment
};

export function navigate(path) {
  location.hash = path;
}

export function renderRoute() {
  const raw = location.hash.replace("#", "");
  const path = raw || "/";
  const route = routes[path];

  if (!route) {
    console.warn("Route not found:", path);
    navigate("/");
    return;
  }

  // UNMOUNT PAGE CŨ
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
