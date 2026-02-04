// ==================================
// Refresh access token
// ==================================
async function refreshToken() {
  // ❌ không remember → không refresh
  if (!storage.get("remember_login")) {
    return false;
  }

  const rt = storage.get("refresh_token");
  if (!rt) return false;

  const res = await fetch(API + "/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: rt }),
  });

  if (!res.ok) {
    showToast("Lỗi máy chủ", "error");
    return null;
  }

  const data = await res.json();
  storage.set("access_token", data.access_token);
  return true;
}

// ==================================
// Fetch có auth + auto refresh
// ==================================
async function authFetch(url, options = {}) {
  apiLoadingStart();

  try {
    let token =
      storage.get("access_token") || sessionStorage.getItem("access_token");

    if (!token) {
      logout();
      return null;
    }

    let res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: "Bearer " + token,
      },
    });

    // ===============================
    // 🔥 HANDLE 401
    // ===============================
    if (res.status === 401) {
      const clone = res.clone();
      const err = await clone.json().catch(() => null);

      // ❌ bị đá do login thiết bị khác
      if (err?.message === "SESSION_REVOKED") {
        showToast("⚠️ Tài khoản đã đăng nhập ở thiết bị khác", "warning");
        logout();
        return null;
      }

      // 🔄 THỬ REFRESH TOKEN
      const refreshed = await refreshToken();
      if (!refreshed) {
        logout();
        return null;
      }

      // lấy token mới (refresh chỉ dành cho remember_login)
      token = storage.get("access_token");

      // retry request
      res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: "Bearer " + token,
        },
      });
    }

    return res;
  } finally {
    apiLoadingEnd();
  }
}
