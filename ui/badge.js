// js/ui/badge.js
const ROLE_LABELS = {
  sales: "Nhân viên kinh doanh",
  supervisor: "Giám sát kinh doanh",
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
