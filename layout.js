// layout.js

// 🔥 CACHE LAYOUT TRONG MEMORY
let __LAYOUT_CACHE__ = null;

/* LOAD LAYOUT (CÓ CACHE) */
async function loadLayout(activeTab, pageHTML) {
  

 
    if (!__LAYOUT_CACHE__) {
      const res = await fetch("./layout.html");
      if (!res.ok) throw new Error("Không load được layout");
      __LAYOUT_CACHE__ = await res.text();
    }

    document.getElementById("root").innerHTML = __LAYOUT_CACHE__;
    document.getElementById("page-content").innerHTML = pageHTML;

    await requireLogin();
    await bindUserInfo();
    bindNav(activeTab);

    updateThemeIcon(); // sync icon luôn
  
}


/* NAV */
function bindNav(activeTab) {
  const map = {
    home: "main.html",
    users: "users.html",
    profile: "profile.html"
  };

  document.querySelectorAll("[data-tab]").forEach(btn => {
    const tab = btn.dataset.tab;
    btn.onclick = () => {
                          location.href = map[tab] || "main.html";
                        };


    if (tab === activeTab) {
      btn.classList.add("text-blue-600", "font-semibold");
    }
  });
}

/* USER INFO + ROLE */
async function bindUserInfo() {
  const res = await authFetch(API + "/me");
  if (!res) return;

  const me = await res.json();

  if (window.me_username) me_username.textContent = me.username;
  if (window.me_fullname) me_fullname.textContent = me.full_name || "-";
  if (window.me_role) me_role.textContent = me.role;

  if (me.role !== "sales") {
    document.querySelectorAll(".admin-only")
      .forEach(el => el.classList.remove("hidden"));
  }
}
