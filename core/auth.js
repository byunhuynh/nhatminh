// ==================================
// Logout
// ==================================
function logout() {
  storage.clear();

  // đánh dấu vừa logout
  localStorage.setItem("logout_notice", "1");

  location.replace("/login.html");
}
