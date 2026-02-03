// =====================================================
// BOOTSTRAP PAGE – DÙNG CHUNG CHO ALL PAGE
// File: frontend/js/core/bootstrap.js
// =====================================================

/**
 * bootstrapPage
 * @param {Object} options
 * @param {string} options.activeTab  - tab đang active (home | profile | users)
 * @param {string} options.html       - HTML render vào page-content
 * @param {Function} options.onReady  - callback sau khi load layout + lấy user
 * @param {boolean} options.requireRoleAboveSales - chặn role sales
 */
async function bootstrapPage({
  activeTab,
  html,
  onReady,
  requireRoleAboveSales = false,
}) {
  // ===============================
  // 1️⃣ Kiểm tra đăng nhập
  // ===============================
  const token = storage.get("access_token");
  if (!token) {
    location.replace("login.html");
    return;
  }

  // ===============================
  // 2️⃣ Load layout
  // ===============================
  await loadLayout(activeTab, html);

  // ===============================
  // 3️⃣ Lấy thông tin user
  // ===============================
  const res = await authFetch(API + "/me");

  if (!res) {
    showToast("Phiên đăng nhập đã hết hạn", "error");
    return;
  }

  const me = await res.json();

  // ===============================
  // 4️⃣ Chặn role thấp nhất (nếu có)
  // ===============================
  if (requireRoleAboveSales && me.role === "sales") {
    showToast("Bạn không có quyền truy cập chức năng này", "error");
    location.replace("main.html");
    return;
  }

  // ===============================
  // 5️⃣ Gọi page logic
  // ===============================
  if (typeof onReady === "function") {
    onReady(me);
  }
}
