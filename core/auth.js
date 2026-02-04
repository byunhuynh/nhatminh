// ==================================
// Logout (KEEP THEME)
// ==================================

function logout() {
  window.stopSessionHeartbeat?.();

  storage.remove("access_token");
  storage.remove("refresh_token");
  storage.remove("remember_login");
  sessionStorage.removeItem("access_token");

  localStorage.setItem("logout_notice", "1");
  location.replace("./login.html");
}

// 🔥 expose global
window.logout = logout;
