// ==================================
// Logout (KEEP THEME)
// ==================================
function logout() {
  // ❌ KHÔNG clear toàn bộ localStorage

  // ✅ chỉ xoá auth-related keys
  storage.remove("access_token");
  storage.remove("refresh_token");
  storage.remove("remember_username");

  // đánh dấu vừa logout (để show toast)
  localStorage.setItem("logout_notice", "1");

  location.replace("./login.html");
}
