// =====================================================
// PROFILE PAGE
// File: frontend/js/pages/profile.page.js
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  bootstrapPage({
    activeTab: "profile",
    html: `
      <div class="ui-card p-5 max-w-xl mx-auto">
        <h2 class="text-lg font-semibold mb-4">👤 Hồ sơ cá nhân</h2>
        <div class="space-y-2 text-sm">
          <div><b>Tài khoản:</b> <span id="p_username"></span></div>
          <div><b>Họ tên:</b> <span id="p_fullname"></span></div>
          <div><b>Email:</b> <span id="p_email"></span></div>
          <div><b>Chức vụ:</b> <span id="p_role"></span></div>
        </div>
        <button onclick="logout()" class="ui-btn ui-btn-danger mt-5">
          🚪 Đăng xuất
        </button>
      </div>
    `,
    onReady(me) {
      p_username.textContent = me.username;
      p_fullname.textContent = me.full_name || "—";
      p_email.textContent = me.email || "—";
      applyRoleBadge(p_role, me.role);
    },
  });
});
