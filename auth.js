const API = "https://backendnhatminh.onrender.com";

/* ================= AUTO LOGIN (LOGIN PAGE ONLY) ================= */
document.addEventListener("DOMContentLoaded", async () => {
  const isLoginPage = location.pathname.endsWith("login.html");
  if (!isLoginPage) return;

  // ❗ nếu đã có access_token thì không auto login nữa
  if (localStorage.getItem("access_token")) return;

  const remember = localStorage.getItem("remember_login");
  const rt = localStorage.getItem("refresh_token");

  if (!remember || !rt) return;

  try {
    const res = await fetch(API + "/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt })
    });

    if (!res.ok) return;

    const data = await res.json();
    localStorage.setItem("access_token", data.access_token);

    location.replace("main.html"); // 👈 replace để không back được
  } catch (e) {
    console.error("Auto login failed");
  }
});


/* ================= LOGIN ================= */
async function login() {
  const u = document.getElementById("username").value.trim().toLowerCase();
  const p = document.getElementById("password").value;
  const remember = document.getElementById("rememberMe").checked;

  if (!u || !p) {
    showToast("Vui lòng nhập tài khoản và mật khẩu", "error");
    return;
  }

  const res = await fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: u, password: p })
  });

  const data = await res.json();

  if (!res.ok) {
    showToast(data.message || "Sai tài khoản hoặc mật khẩu", "error");
    return;
  }

  // 🔐 lưu token
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("role", data.role);

  if (remember) {
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("remember_login", "1");
  } else {
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("remember_login");
  }

  showToast("Đăng nhập thành công", "success");
  setTimeout(() => location.replace("main.html"), 600);
}


/* ================= REFRESH TOKEN ================= */
async function refreshToken() {
  const rt = localStorage.getItem("refresh_token");
  if (!rt) return false;

  const res = await fetch(API + "/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: rt })
  });

  if (!res.ok) return false;

  const data = await res.json();
  localStorage.setItem("access_token", data.access_token);
  return true;
}


/* ================= AUTH FETCH ================= */


async function authFetch(url, options = {}) {
  apiLoadingStart();

  try {
    let token = localStorage.getItem("access_token");
    if (!token) {
      logout();
      return null;
    }

    let res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: "Bearer " + token
      }
    });

    if (res.status === 401) {
      const ok = await refreshToken();
      if (!ok) {
        logout();
        return null;
      }

      token = localStorage.getItem("access_token");

      res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: "Bearer " + token
        }
      });
    }

    return res;
  } finally {
    apiLoadingEnd();
  }
}




/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  showToast("Đã đăng xuất", "info");
  location.replace("login.html");
}


/* ================= TOAST ================= */
function isMobile() {
  return window.innerWidth <= 640;
}

function showToast(text, type = "error") {
  const colors = {
    success: "linear-gradient(to right, #22c55e, #16a34a)",
    error: "linear-gradient(to right, #ef4444, #dc2626)",
    info: "linear-gradient(to right, #3b82f6, #2563eb)"
  };

  Toastify({
    text,
    duration: 3000,
    gravity: isMobile() ? "bottom" : "top",
    position: isMobile() ? "center" : "right",
    backgroundColor: colors[type] || colors.info,
    style: {
      borderRadius: "12px",
      fontSize: "14px",
      maxWidth: "90%"
    }
  }).showToast();
}


