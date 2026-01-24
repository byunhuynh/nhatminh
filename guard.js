async function requireLogin() {
  if (!localStorage.getItem("access_token")) {
    location.replace("login.html");
    return false;
  }
  return true;
}

async function requireAdminPage() {
  if (!requireLogin()) {
    location.replace("login.html");
    return false;
  }

  const res = await authFetch(API + "/me");
  if (!res) return false;

  const user = await res.json();
  if (user.role == "sales") {
    showToast("Không có quyền truy cập", "error");
    location.replace("main.html");
    return false;
  }

  return true;
}
