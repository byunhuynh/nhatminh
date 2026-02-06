// ==================================
// Role badge mapping & render helper
// ==================================
const ROLE_LABELS = {
  sales: "Nhân viên kinh doanh",
  supervisor: "Giám sát kinh doanh",
  regional_director: "Giám đốc khu vực", // 🔥 Thêm dòng này
  director: "Giám đốc kinh doanh",
  admin: "Quản trị hệ thống",
};

function roleToLabel(role) {
  return ROLE_LABELS[role] || role;
}

function applyRoleBadge(el, role) {
  if (!el) return;
  el.textContent = roleToLabel(role);
  el.className =
    "ui-badge " + (role === "admin" ? "ui-badge-danger" : "ui-badge-success");
}

window.ROLE_LABELS = ROLE_LABELS;
window.roleToLabel = roleToLabel;
window.applyRoleBadge = applyRoleBadge;
