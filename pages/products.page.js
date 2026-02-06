// =====================================================
// PRODUCT PAGE – DMS CATEGORY VIEW
// =====================================================
export async function renderProducts() {
  const container = document.getElementById("page-content");
  container.innerHTML = `
    <div class="ui-page max-w-7xl mx-auto space-y-6 animate-fade-up">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-black text-gradient">Danh mục hàng hóa</h1>
        <span class="ui-hint" id="totalCats">0 phân loại</span>
      </div>
      
      <div id="productContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="col-span-full py-20 text-center"><i class="fa-solid fa-spinner fa-spin text-3xl text-sky-500"></i></div>
      </div>
    </div>
  `;

  try {
    const res = await authFetch(API + "/product-categories");
    if (!res || !res.ok) return;
    const categories = await res.json();

    document.getElementById("totalCats").innerText =
      `${categories.length} phân loại`;
    const containerEl = document.getElementById("productContainer");

    if (categories.length === 0) {
      containerEl.innerHTML = `<div class="ui-card col-span-full py-20 text-center ui-hint italic">Chưa có sản phẩm nào</div>`;
      return;
    }

    containerEl.innerHTML = categories
      .map(
        (cat) => `
      <div class="ui-card ui-card-glow flex flex-col h-full">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2 text-sky-500">
            <i class="fa-solid fa-layer-group text-xl"></i>
            <h2 class="font-bold text-lg">${cat.name}</h2>
          </div>
        </div>
        
        <div class="space-y-2 flex-1">
          <!-- Lưu ý: Backend cần trả về list products trong mỗi category -->
          <div class="text-xs ui-hint italic mb-2">${cat.description || "Sản phẩm thuộc nhóm " + cat.name}</div>
          <button class="ui-btn ui-btn-outline w-full text-xs" onclick="showToast('Tính năng xem chi tiết đang phát triển', 'info')">
             Xem danh sách mặt hàng
          </button>
        </div>
      </div>
    `,
      )
      .join("");
  } catch (err) {
    showToast("Lỗi kết nối máy chủ sản phẩm", "error");
  }
}
