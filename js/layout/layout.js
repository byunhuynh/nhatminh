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

  bindNav(activeTab);
  updateThemeIcon();
}

function bindNav(activeTab) {
  const map = {
    home: "main.html",
    users: "users.html",
    profile: "profile.html",
  };

  document.querySelectorAll("[data-tab]").forEach((btn) => {
    const tab = btn.dataset.tab;
    btn.onclick = () => (location.href = map[tab]);

    if (tab === activeTab) {
      btn.classList.add("text-blue-600", "font-semibold");
    }
  });
}
