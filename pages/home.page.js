// =====================================================
// HOME PAGE – SPA (SAFE UX IMPROVE)
// File: Frontend/nhatminh/pages/home.page.js
// =====================================================

import { store } from "../app/store.js";

// =====================================================
// Render Home Page
// =====================================================
export function renderHome() {
  const me = store.user;

  document.getElementById("page-content").innerHTML = `
    <div class="space-y-6">

      <!-- ================= USER INFO ================= -->
      <div class="ui-card">
        <div class="ui-title mb-4">👋 Chào mừng</div>

        <div class="ui-text space-y-2">
          <div>
            <b>Tài khoản:</b>
            <span>${me.username}</span>
          </div>

          <div>
            <b>Họ tên:</b>
            <span>${me.full_name || "—"}</span>
          </div>

          <div>
            <b>Chức vụ:</b>
            <span id="home_role"></span>
          </div>
        </div>
      </div>

      <!-- ================= QUICK NOTE ================= -->
      <div class="ui-card">
        <div class="ui-title mb-2">📌 Ghi chú</div>
        <div class="ui-text">
          Đây là trang tổng quan. Các chức năng sẽ hiển thị tùy theo quyền của bạn.
        </div>
      </div>

    </div>
  `;

  applyRoleBadge(document.getElementById("home_role"), me.role);
}
