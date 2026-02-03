import { navigate } from "../app/router.js";
import { store } from "../app/store.js";

let layoutLoaded = false;

// ==================================
// Load layout duy nhất 1 lần
// ==================================
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

  bindNav();
  updateThemeIcon();

  layoutLoaded = true;
}

// ==================================
// Bind navigation SPA
// ==================================
function bindNav() {
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.onclick = () => {
      const map = {
        home: "/",
        users: "/users",
        profile: "/profile",
      };
      navigate(map[btn.dataset.tab]);
    };
  });

  // phân quyền users tab
  if (store.user?.role === "sales") {
    document
      .querySelectorAll('[data-tab="users"]')
      .forEach((el) => el.classList.add("hidden"));
  }
}
