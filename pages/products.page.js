// =====================================================
// PRODUCT PAGE – DMS CATEGORY VIEW
// =====================================================
export async function renderProducts() {
  const container = document.getElementById("page-content");
  container.innerHTML = `
    <div class="ui-page max-w-7xl mx-auto space-y-6 animate-fade-up">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-black text-gradient">Danh mục hàng hóa</h1>
        <span class="ui-hint" id="prodCount">0 phân loại</span>
      </div>
      <div id="productGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="col-span-full text-center py-20"><i class="fa-solid fa-spinner fa-spin text-3xl text-sky-500"></i></div>
      </div>
    </div>
  `;

  const res = await authFetch(API + "/product-categories");
  if (!res) return;
  const categories = await res.json();

  document.getElementById("prodCount").innerText =
    `${categories.length} phân loại`;
  const grid = document.getElementById("productGrid");

  if (categories.length === 0) {
    grid.innerHTML = `<div class="col-span-full py-20 text-center ui-hint italic">Chưa có dữ liệu sản phẩm</div>`;
    return;
  }

  grid.innerHTML = categories
    .map(
      (cat) => `
    <div class="ui-card ui-card-glow flex flex-col">
      <div class="flex items-center gap-2 text-sky-500 mb-4">
        <i class="fa-solid fa-layer-group text-xl"></i>
        <h2 class="font-bold text-lg">${cat.name}</h2>
      </div>
      <div class="space-y-2 flex-1">
        ${
          (cat.products || []) // ✅ Thêm fallback mảng rỗng nếu chưa có SP
            .map(
              (p) => `
      <div class="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm">
        <span>${p.name}</span>
        <span class="font-bold text-orange-500">${new Intl.NumberFormat("vi-VN").format(p.price)}đ</span>
      </div>
    `,
            )
            .join("") ||
          '<p class="ui-hint italic text-xs text-center py-2">Chưa có mặt hàng</p>'
        }
      </div>
    </div>
  `,
    )
    .join("");
}
