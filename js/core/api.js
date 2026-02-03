// js/core/api.js
async function refreshToken() {
  const rt = storage.get("refresh_token");
  if (!rt) return false;

  const res = await fetch(API + "/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: rt }),
  });

  if (!res.ok) return false;

  const data = await res.json();
  storage.set("access_token", data.access_token);
  return true;
}

async function authFetch(url, options = {}) {
  apiLoadingStart();

  try {
    let token = storage.get("access_token");

    // ❌ không có token → logout
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

    if (res.status === 401) {
      const ok = await refreshToken();
      if (!ok) {
        logout(); // ⬅️ BẮT BUỘC
        return null;
      }

      token = storage.get("access_token");
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
