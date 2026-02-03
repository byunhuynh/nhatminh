// =====================================================
// HOME PAGE
// File: frontend/js/pages/home.page.js
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  bootstrapPage({
    activeTab: "home",
    html: `
      <div class="ui-card p-5">
        <h2 class="text-lg font-semibold mb-3">👤 Thông tin người dùng</h2>
        <div class="space-y-1 text-sm">
          <div><b>Tài khoản:</b> <span id="me_username"></span></div>
          <div><b>Chức vụ:</b> <span id="me_role"></span></div>
        </div>
      </div>
    `,
    onReady(me) {
      me_username.textContent = me.username;
      applyRoleBadge(me_role, me.role);
    },
  });
});
