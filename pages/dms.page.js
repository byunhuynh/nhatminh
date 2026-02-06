// ==================================
// DMS PAGE – ROUTES & STORES
// ==================================
import { store } from "../app/store.js";

export async function renderDms() {
  const container = document.getElementById("page-content");
  container.innerHTML = `
    <div class="ui-page max-w-7xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold text-gradient">Quản lý Tuyến & Điểm bán</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- BÊN TRÁI: DANH SÁCH TUYẾN -->
        <div class="ui-card" id="routeSection">
          <div class="ui-title mb-4"><i class="fa-solid fa-map-location-dot mr-2"></i>Tuyến của tôi</div>
          <div id="routeList" class="space-y-2"></div>
        </div>

        <!-- BÊN PHẢI: CHI TIẾT ĐIỂM BÁN & TÁC VỤ -->
        <div class="lg:col-span-2 space-y-6">
          <div class="ui-card hidden" id="storeSection">
            <div class="ui-title mb-4" id="selectedRouteName">Chọn một tuyến để xem điểm bán</div>
            <div id="storeList" class="grid grid-cols-1 md:grid-cols-2 gap-3"></div>
          </div>
          
          <!-- FORM BÁO CÁO (CHỈ HIỆN KHI CHỌN ĐIỂM BÁN) -->
          <div class="ui-card hidden" id="reportForm">
             <div class="flex justify-between items-center mb-4">
                <div class="ui-title text-orange-500" id="selectedStoreName">Báo cáo điểm bán</div>
                <button onclick="this.closest('.ui-card').classList.add('hidden')" class="ui-hint"><i class="fa-solid fa-xmark"></i></button>
             </div>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button class="ui-btn ui-btn-primary py-6 flex-col" onclick="showOrderForm()">
                   <i class="fa-solid fa-cart-plus text-2xl"></i>
                   <span>Lên đơn hàng mới</span>
                </button>
                <button class="ui-btn ui-btn-outline py-6 flex-col" onclick="showInventoryForm()">
                   <i class="fa-solid fa-clipboard-check text-2xl"></i>
                   <span>Kiểm tồn kho trên kệ</span>
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  `;

  loadRoutes();
}

async function loadRoutes() {
  const res = await authFetch(API + "/my-routes");
  if (!res) return;
  const routes = await res.json();
  const listEl = document.getElementById("routeList");

  listEl.innerHTML = routes
    .map(
      (r) => `
    <div class="p-3 border border-main rounded-xl hover:bg-hover cursor-pointer transition-all flex justify-between items-center" 
         onclick="loadStores(${r.id}, '${r.name}')">
      <div>
        <div class="font-bold text-sm">${r.code}</div>
        <div class="ui-hint text-xs">${r.name}</div>
      </div>
      <i class="fa-solid fa-chevron-right text-[10px] opacity-30"></i>
    </div>
  `,
    )
    .join("");
}

window.loadStores = async function (routeId, routeName) {
  const res = await authFetch(API + `/stores?route_id=${routeId}`);
  if (!res) return;
  const stores = await res.json();

  const section = document.getElementById("storeSection");
  const listEl = document.getElementById("storeList");

  section.classList.remove("hidden");
  document.getElementById("selectedRouteName").innerText =
    `Điểm bán thuộc: ${routeName}`;

  listEl.innerHTML = stores
    .map(
      (s) => `
    <div class="p-4 bg-input border border-main rounded-xl hover:border-sky-500 transition-colors cursor-pointer"
         onclick="openReportForm(${s.id}, '${s.name}')">
      <div class="font-bold">${s.name}</div>
      <div class="text-xs ui-hint"><i class="fa-solid fa-location-dot mr-1"></i>${s.address || "Không có địa chỉ"}</div>
      <div class="mt-2 text-[10px] uppercase font-bold text-sky-500">Mã: ${s.code}</div>
    </div>
  `,
    )
    .join("");

  // Auto scroll tới list store trên mobile
  if (window.innerWidth < 1024) section.scrollIntoView({ behavior: "smooth" });
};

window.openReportForm = function (storeId, storeName) {
  const form = document.getElementById("reportForm");
  form.classList.remove("hidden");
  document.getElementById("selectedStoreName").innerText = storeName;
  form.dataset.storeId = storeId;
  form.scrollIntoView({ behavior: "smooth" });
};

// Logic gửi báo cáo Zero Trust
window.showOrderForm = function () {
  showToast("Tính năng Lên đơn hàng đang được kết nối với Giỏ hàng...", "info");
};

window.showInventoryForm = function () {
  showToast("Tính năng Kiểm kho đang được kết nối...", "info");
};

// ==================================
// Function bổ trợ trong dms.page.js
// ==================================
window.showOrderForm = function () {
  const form = document.getElementById("reportForm");
  const storeId = form.dataset.storeId;
  const storeName = document.getElementById("selectedStoreName").innerText;

  // Lưu tạm vào session để trang order-form đọc được
  sessionStorage.setItem("active_store_id", storeId);
  sessionStorage.setItem("active_store_name", storeName);

  // Điều hướng sang trang lên đơn
  navigate("/order-create");
};
