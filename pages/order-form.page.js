// =====================================================
// ORDER FORM PAGE – DMS SALES FLOW
// File: pages/order-form.page.js
// =====================================================

import { navigate } from "../app/router.js";

let currentCart = [];
let allProducts = [];

// ==================================
// Render chính của trang đơn hàng
// ==================================
export async function renderOrderForm() {
  const container = document.getElementById("page-content");

  // Lấy Store info từ URL hoặc State (Ví dụ dùng session tạm)
  const storeId = sessionStorage.getItem("active_store_id");
  const storeName = sessionStorage.getItem("active_store_name");

  if (!storeId) {
    showToast("Vui lòng chọn điểm bán trước", "warning");
    navigate("/dms");
    return;
  }

  container.innerHTML = `
    <div class="ui-page max-w-7xl mx-auto space-y-6 pb-32">
      <!-- HEADER -->
      <div class="flex items-center gap-4">
        <button onclick="window.history.back()" class="ui-btn ui-btn-outline px-3 py-2">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <h1 class="text-xl font-black text-gradient">Lên đơn hàng mới</h1>
          <p class="ui-hint text-xs"><i class="fa-solid fa-shop mr-1"></i>${storeName}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- BÊN TRÁI: DANH SÁCH SẢN PHẨM -->
        <div class="lg:col-span-2 space-y-4">
          <div class="ui-card">
            <div class="ui-input-icon mb-4">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="productSearch" class="ui-input" placeholder="Tìm tên hoặc mã sản phẩm...">
            </div>
            <div id="productGrid" class="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[60vh]">
               <!-- Sản phẩm load ở đây -->
               <div class="p-8 text-center ui-hint">Đang tải danh sách mặt hàng...</div>
            </div>
          </div>
        </div>

        <!-- BÊN PHẢI: GIỎ HÀNG -->
        <div class="lg:col-span-1">
          <div class="ui-card sticky top-20 border-sky-500/30" id="cartSection">
            <div class="ui-title mb-4 flex justify-between">
              <span>Đã chọn</span>
              <span class="text-sky-500" id="cartCount">0</span>
            </div>
            <div id="cartItems" class="space-y-3 mb-6 min-h-[100px]">
               <div class="text-center py-10 opacity-30 italic text-sm">Chưa có sản phẩm nào</div>
            </div>
            <div class="border-t border-dashed border-main pt-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="ui-hint">Tổng số lượng:</span>
                <span id="totalQty" class="font-bold">0</span>
              </div>
              <div class="flex justify-between ui-title text-orange-500">
                <span>Tạm tính:</span>
                <span id="totalAmount">0đ</span>
              </div>
            </div>
            <button id="btnSubmitOrder" class="ui-btn ui-btn-primary w-full mt-6 py-4" disabled onclick="handleOrderSubmit()">
              <i class="fa-solid fa-paper-plane mr-2"></i>Gửi đơn hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  await loadProducts();
  bindSearchEvent();
}

// ==================================
// Load sản phẩm từ Backend
// ==================================
async function loadProducts() {
  const res = await authFetch(API + "/reports/sales-by-subordinates"); // Chú ý: Backend cần API get_all_products riêng nếu báo cáo quá nặng
  // Giả sử API trả về list sản phẩm
  const data = await res.json();
  allProducts = data; // Ở dự án thực tế, nên dùng endpoint /products
  renderProductGrid(allProducts);
}

// ==================================
// Hiển thị danh sách sản phẩm lên Grid
// ==================================
function renderProductGrid(products) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = products
    .map(
      (p) => `
    <div class="p-3 border border-main rounded-xl flex gap-3 hover:border-sky-400 transition-all">
      <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-sky-500">
        <i class="fa-solid fa-box text-2xl"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-bold text-sm truncate">${p.product_name}</div>
        <div class="text-[10px] ui-hint mb-2">Giá: ${formatMoney(p.amount / p.qty)} / ${p.unit || "Cái"}</div>
        <button class="ui-btn ui-btn-outline px-2 py-1 text-[10px] h-auto" 
                onclick="addToCart(${p.product_id}, '${p.product_name}', ${p.amount / p.qty})">
          <i class="fa-solid fa-plus mr-1"></i>Chọn
        </button>
      </div>
    </div>
  `,
    )
    .join("");
}

// ==================================
// Logic thêm sản phẩm vào giỏ
// ==================================
window.addToCart = function (id, name, price) {
  const existing = currentCart.find((item) => item.product_id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    currentCart.push({ product_id: id, name, price, quantity: 1 });
  }
  updateCartUI();
};

// ==================================
// Cập nhật giao diện giỏ hàng & tính toán
// ==================================
function updateCartUI() {
  const container = document.getElementById("cartItems");
  const btn = document.getElementById("btnSubmitOrder");

  if (currentCart.length === 0) {
    container.innerHTML = `<div class="text-center py-10 opacity-30 italic text-sm">Chưa có sản phẩm nào</div>`;
    btn.disabled = true;
    return;
  }

  btn.disabled = false;
  let totalAmt = 0;
  let totalQty = 0;

  container.innerHTML = currentCart
    .map((item, idx) => {
      const subtotal = item.price * item.quantity;
      totalAmt += subtotal;
      totalQty += item.quantity;
      return `
      <div class="flex justify-between items-start p-2 bg-input rounded-lg animate-fade-soft">
        <div class="min-w-0 flex-1">
          <div class="text-xs font-bold truncate">${item.name}</div>
          <div class="text-[10px] text-orange-500">${formatMoney(subtotal)}</div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="changeQty(${item.product_id}, -1)" class="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 text-xs">-</button>
          <span class="text-xs font-bold w-4 text-center">${item.quantity}</span>
          <button onclick="changeQty(${item.product_id}, 1)" class="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 text-xs">+</button>
        </div>
      </div>
    `;
    })
    .join("");

  document.getElementById("totalAmount").innerText = formatMoney(totalAmt);
  document.getElementById("totalQty").innerText = totalQty;
  document.getElementById("cartCount").innerText = currentCart.length;
}

window.changeQty = function (id, delta) {
  const item = currentCart.find((i) => i.product_id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    currentCart = currentCart.filter((i) => i.product_id !== id);
  }
  updateCartUI();
};

// ==================================
// Gửi đơn hàng lên Server (Zero Trust)
// ==================================
window.handleOrderSubmit = async function () {
  const storeId = sessionStorage.getItem("active_store_id");

  // Chuẩn bị data: Chỉ gửi ID và Qty.
  // Không cần gửi Price vì Backend sẽ tự lấy từ DB của nó (Bảo mật).
  const payload = {
    store_id: parseInt(storeId),
    items: currentCart.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
      price: i.price, // Vẫn gửi để backend đối chiếu nếu muốn, nhưng backend re-calculate là chính
    })),
    total_amount: currentCart.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };

  const res = await authFetch(API + "/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res && res.ok) {
    showToast("🎉 Gửi đơn hàng thành công!", "success");
    currentCart = [];
    navigate("/dms");
  }
};

// ==================================
// Utils
// ==================================
function formatMoney(num) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
}

function bindSearchEvent() {
  document.getElementById("productSearch")?.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = allProducts.filter((p) =>
      p.product_name.toLowerCase().includes(val),
    );
    renderProductGrid(filtered);
  });
}
