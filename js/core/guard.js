// js/core/guard.js
async function requireLogin() {
  if (!storage.get("access_token")) {
    location.replace("login.html");
    return false;
  }
  return true;
}

async function requireAdminPage() {
  if (!(await requireLogin())) return false;

  const res = await authFetch(API + "/me");
  if (!res) return false;

  const me = await res.json();
  if (me.role === "sales") {
    showToast("Không có quyền truy cập", "error");
    location.replace("main.html");
    return false;
  }
  return true;
}
