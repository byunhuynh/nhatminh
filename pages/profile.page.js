// =====================================================
// PROFILE PAGE – SPA (SAFE UX IMPROVE)
// File: Frontend/nhatminh/pages/profile.page.js
// =====================================================

import { store } from "../app/store.js";
import { navigate } from "../app/router.js";

// =====================================================
// Render Profile Page
// =====================================================
export function renderProfile() {
  const me = store.user;

  document.getElementById("page-content").innerHTML = `
    <div class="ui-card max-w-xl mx-auto">
      <div class="ui-title mb-4">👤 Hồ sơ cá nhân</div>

      <div class="ui-text space-y-3">
        <div>
          <b>Tài khoản:</b>
          <span>${me.username}</span>
        </div>

        <div>
          <b>Họ tên:</b>
          <span>${me.full_name || "—"}</span>
        </div>

        <div>
          <b>Email:</b>
          <span>${me.email || "—"}</span>
        </div>

        <div>
          <b>Số điện thoại:</b>
          <span>${me.phone || "—"}</span>
        </div>

        <div>
          <b>Chức vụ:</b>
          <span id="profile_role"></span>
        </div>
      </div>

      <div class="mt-6">
        <button
          id="logoutBtn"
          class="ui-btn ui-btn-primary w-full"
        >
          🚪 Đăng xuất
        </button>
      </div>
    </div>
  `;

  applyRoleBadge(document.getElementById("profile_role"), me.role);

  // ===============================
  // Logout
  // ===============================
  document.getElementById("logoutBtn").onclick = () => {
    window.logout();
  };
}
// =====================================================
