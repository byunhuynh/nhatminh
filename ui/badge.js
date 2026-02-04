// ==================================
// Role badge mapping & render helper
// (GLOBAL SCRIPT – NOT ES MODULE)
// ==================================

const ROLE_LABELS = {
  sales: "Nhân viên kinh doanh",
  supervisor: "Giám sát kinh doanh",
  director: "Giám đốc kinh doanh",
  admin: "Quản trị hệ thống",
};

// ==================================
// Convert role code → human label
// ==================================
function roleToLabel(role) {
  return ROLE_LABELS[role] || role;
}

// ==================================
// Apply role badge to element
// ==================================
function applyRoleBadge(el, role) {
  if (!el) return;

  el.textContent = roleToLabel(role);
  el.className =
    "ui-badge " + (role === "admin" ? "ui-badge-danger" : "ui-badge-success");
}

// ==================================
// Expose GLOBAL (BẮT BUỘC)
// ==================================
window.ROLE_LABELS = ROLE_LABELS;
window.roleToLabel = roleToLabel;
window.applyRoleBadge = applyRoleBadge;
