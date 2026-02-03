// js/layout/layout.js
let __LAYOUT_CACHE__ = null;

async function loadLayout(activeTab, pageHTML) {
  if (!__LAYOUT_CACHE__) {
    const res = await fetch("layout.html");
    if (!res.ok) throw new Error("Không load được layout");
    __LAYOUT_CACHE__ = await res.text();
  }

  document.getElementById("root").innerHTML = __LAYOUT_CACHE__;
  document.getElementById("page-content").innerHTML = pageHTML;

  await bindNav(activeTab);
  updateThemeIcon();
}

/* ================= NAV + ROLE ================= */

async function bindNav(activeTab) {
  const map = {
    home: "main.html",
    users: "users.html",
    profile: "profile.html",
  };

  // gắn click + active
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    const tab = btn.dataset.tab;
    btn.onclick = () => (location.href = map[tab]);

    if (tab === activeTab) {
      btn.classList.add("text-blue-600", "font-semibold");
    }
  });

  // 👉 PHÂN QUYỀN HIỂN THỊ TAB USERS
  await applyUsersTabPermission();
}

async function applyUsersTabPermission() {
  const res = await authFetch(API + "/me");
  if (!res) return;

  const me = await res.json();

  const usersTabs = document.querySelectorAll('[data-tab="users"]');

  // ❌ role thấp nhất → ẩn
  if (me.role === "sales") {
    usersTabs.forEach((el) => el.classList.add("hidden"));
  }
  // ✅ role cao hơn → hiện
  else {
    usersTabs.forEach((el) => el.classList.remove("hidden"));
  }
}
