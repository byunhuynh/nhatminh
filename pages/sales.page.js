// =====================================================
// SALES PAGE – SPA
// =====================================================

import { store } from "../app/store.js";

// =====================================================
// Render Sales Page
// =====================================================
export function renderSales() {
  const container = document.getElementById("page-content");
  if (!container) return;

  const me = store.user;

  container.innerHTML = `
    <div class="ui-card">
      <div class="ui-title mb-4">🛒 Bán hàng</div>

      <div class="ui-text">
        Chức năng bán hàng sẽ được triển khai tại đây.
      </div>

      <div class="ui-hint mt-3">
        Tài khoản hiện tại: <b>${me.username}</b>
      </div>
    </div>
  `;
}
