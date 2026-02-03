// js/core/auth.js
async function login() {
  const u = username.value.trim().toLowerCase();
  const p = password.value;
  const remember = rememberMe?.checked;

  if (!u || !p) {
    showToast("Vui lòng nhập tài khoản và mật khẩu", "error");
    return;
  }

  const res = await fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: u, password: p }),
  });

  const data = await res.json();
  if (!res.ok) {
    showToast(data.message || "Đăng nhập thất bại", "error");
    return;
  }

  storage.set("access_token", data.access_token);
  storage.set("role", data.role);

  if (remember) {
    storage.set("refresh_token", data.refresh_token);
    storage.set("remember_login", "1");
    startAutoRefresh(); // ✅ THÊM
  } else {
    storage.remove("refresh_token");
    storage.remove("remember_login");
  }

  showToast("Đăng nhập thành công", "success");
  setTimeout(() => location.replace("main.html"), 500);
}

function logout() {
  storage.clear();
  showToast("Đã đăng xuất", "info");
  location.replace("login.html");
}

// ==================================
// AUTO REFRESH ACCESS TOKEN
// ==================================
let __REFRESH_TIMER__ = null;

function startAutoRefresh() {
  if (!storage.get("refresh_token")) return;

  stopAutoRefresh();

  // refresh trước khi access token hết hạn (ví dụ: 14 phút)
  __REFRESH_TIMER__ = setInterval(
    async () => {
      const ok = await refreshToken();
      if (!ok) {
        stopAutoRefresh();
        logout();
      }
    },
    14 * 60 * 1000,
  ); // 14 phút
}

function stopAutoRefresh() {
  if (__REFRESH_TIMER__) {
    clearInterval(__REFRESH_TIMER__);
    __REFRESH_TIMER__ = null;
  }
}
