// =====================================================
// PRODUCT PAGE – DMS CATEGORY VIEW
// File: pages/products.page.js
// =====================================================

export async function renderProducts() {
  const container = document.getElementById("page-content");
  container.innerHTML = `
    <div class="ui-page max-w-7xl mx-auto space-y-6 animate-fade-up">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-black text-gradient">Danh mục hàng hóa</h1>
        <div id="categoryBadges" class="flex gap-2"></div>
      </div>
      
      <div id="productContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Data load here -->
      </div>
    </div>
  `;

  try {
    const res = await authFetch(API + "/product-categories");
    if (!res) return;
    const categories = await res.json();

    const containerEl = document.getElementById("productContainer");
    if (categories.length === 0) {
      containerEl.innerHTML = `<div class="ui-card col-span-full py-20 text-center ui-hint italic">Chưa có sản phẩm nào trong hệ thống</div>`;
      return;
    }

    containerEl.innerHTML = categories
      .map(
        (cat) => `
      <div class="ui-card ui-card-glow flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2 text-sky-500">
            <i class="fa-solid fa-layer-group text-xl"></i>
            <h2 class="font-bold text-lg">${cat.name}</h2>
          </div>
          <span class="ui-badge ui-badge-success">${cat.products ? cat.products.length : 0} SP</span>
        </div>
        
        <div class="space-y-3 flex-1">
          ${(cat.products || [])
            .slice(0, 5)
            .map(
              (p) => `
            <div class="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm">
              <span class="font-medium">${p.name}</span>
              <span class="text-orange-500 font-bold">${new Intl.NumberFormat("vi-VN").format(p.price)}đ</span>
            </div>
          `,
            )
            .join("")}
          ${cat.products && cat.products.length > 5 ? `<p class="text-center ui-hint text-[10px]">và ${cat.products.length - 5} sản phẩm khác...</p>` : ""}
        </div>

        <button class="ui-btn ui-btn-primary w-full mt-6" onclick="showToast('Chức năng chỉnh sửa sản phẩm đang được xây dựng', 'info')">
          Quản lý mặt hàng
        </button>
      </div>
    `,
      )
      .join("");
  } catch (err) {
    showToast("Không thể tải danh sách sản phẩm", "error");
  }
}
