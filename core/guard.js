// ==================================
// Guard theo role
// ==================================
function requireRoleAboveSales(user) {
  if (user.role === "sales") {
    showToast("Bạn không có quyền truy cập", "error");
    navigate("/");
    return false;
  }
  return true;
}
