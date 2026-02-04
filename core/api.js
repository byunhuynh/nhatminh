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
// ==================================
// Fetch có auth + auto refresh
// options.silent = true → không show loading
// ==================================
async function authFetch(url, options = {}) {
  const { silent = false, ...fetchOptions } = options;

  if (!silent) {
    apiLoadingStart();
  }

  try {
    let token =
      storage.get("access_token") || sessionStorage.getItem("access_token");

    if (!token) {
      logout();
      return null;
    }

    let res = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...(fetchOptions.headers || {}),
        Authorization: "Bearer " + token,
      },
    });

    // ===============================
    // HANDLE 401
    // ===============================
    if (res.status === 401) {
      const clone = res.clone();
      const err = await clone.json().catch(() => null);

      if (err?.message === "SESSION_REVOKED") {
        showToast("⚠️ Tài khoản đã đăng nhập ở thiết bị khác", "warning");
        return null;
      }

      const refreshed = await refreshToken();

      if (refreshed === false) return null;

      if (!refreshed) {
        logout();
        return null;
      }

      token = storage.get("access_token");

      res = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...(fetchOptions.headers || {}),
          Authorization: "Bearer " + token,
        },
      });
    }

    return res;
  } finally {
    if (!silent) {
      apiLoadingEnd();
    }
  }
}
