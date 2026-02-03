// js/core/guard.js
async function requireLogin() {
  const token = storage.get("access_token");
  if (!token) {
    location.replace("login.html");
    return false;
  }

  const res = await authFetch(API + "/me");
  if (!res) {
    // authFetch đã logout rồi
    return false;
  }

  return true;
}

async function requireNotLowestRole() {
  if (!(await requireLogin())) return false;

  const res = await authFetch(API + "/me");
  if (!res) return false;

  const me = await res.json();

  // ❌ role thấp nhất
  if (me.role === "sales") {
    showToast("Bạn không có quyền truy cập chức năng này", "error");
    location.replace("main.html");
    return false;
  }

  return true;
}
