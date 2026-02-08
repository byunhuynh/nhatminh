// =====================================================
// DMS PAGE – PROFESSIONAL WITH DYNAMIC PROVINCE API
// =====================================================

// =====================================================
// DMS PAGE – FULLY SYNCED UI WITH USERS PAGE
// =====================================================

import { store } from "../app/store.js";
import { navigate } from "../app/router.js";
import { setupSearchDropdown } from "../ui/address-dropdown.js";

let currentRouteId = null;
let provinceCache = [];

const isManager = () =>
  ["admin", "director", "regional_director", "supervisor"].includes(
    store.user.role,
  );

async function getProvinces() {
  if (provinceCache.length > 0) return provinceCache;
  try {
    const res = await fetch(API_PROVINCE + "/api/v1/p/");
    if (!res.ok) return [];
    provinceCache = await res.json();
    return provinceCache;
  } catch (e) {
    return [];
  }
}

export async function renderDms() {
  const container = document.getElementById("page-content");
  const me = store.user;

  container.innerHTML = `
    <div class="ui-page max-w-7xl mx-auto space-y-6 animate-fade-up">
      
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gradient">Hệ thống DMS</h1>
          <p class="ui-text text-sm">Quản lý tuyến đường và mạng lưới điểm bán hàng</p>
        </div>
        <div class="flex gap-2">
          ${
            isManager()
              ? `
            <button onclick="showCreateRouteModal()" class="ui-btn ui-btn-outline border-sky-500/50 text-sky-400 text-xs">
              <i class="fa-solid fa-map-location-dot mr-1"></i> Tạo tuyến mới
            </button>
          `
              : ""
          }
        </div>
      </div>

      <!-- QUICK STATS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="ui-card flex items-center gap-4 py-4">
          <div class="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500"><i class="fa-solid fa-route"></i></div>
          <div><p class="ui-hint text-[10px] uppercase font-bold">Tuyến đang quản lý</p><h3 class="text-xl font-bold" id="stat-routes">0</h3></div>
        </div>
        <div class="ui-card flex items-center gap-4 py-4">
          <div class="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500"><i class="fa-solid fa-shop"></i></div>
          <div><p class="ui-hint text-[10px] uppercase font-bold">Tổng số điểm bán</p><h3 class="text-xl font-bold" id="stat-stores">0</h3></div>
        </div>
        <div class="ui-card flex items-center gap-4 py-4">
          <div class="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500"><i class="fa-solid fa-calendar-check"></i></div>
          <div><p class="ui-hint text-[10px] uppercase font-bold">Viếng thăm hôm nay</p><h3 class="text-xl font-bold">--</h3></div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- DANH SÁCH TUYẾN -->
        <div class="lg:col-span-1">
          <div class="ui-card ui-card-glow min-h-[500px]">
            <div class="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <h2 class="ui-title text-sm"><i class="fa-solid fa-list-check mr-2 text-sky-500"></i>Danh sách tuyến</h2>
            </div>
            <div id="routeList" class="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
               <div class="p-8 text-center opacity-30 text-sm italic">Đang tải...</div>
            </div>
          </div>
        </div>

        <!-- CHI TIẾT ĐIỂM BÁN -->
        <div class="lg:col-span-2 space-y-4">
          <div class="ui-card ui-card-glow hidden min-h-[400px]" id="storeSection">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <div class="text-[10px] text-sky-400 font-bold uppercase tracking-widest mb-1" id="selectedRouteCode"></div>
                    <h2 class="text-xl font-bold" id="selectedRouteName">Chi tiết tuyến</h2>
                </div>
                <button onclick="showCreateStoreModal()" class="ui-btn ui-btn-primary text-xs shadow-lg shadow-sky-500/20">
                    <i class="fa-solid fa-plus-circle mr-1"></i> Thêm điểm bán
                </button>
            </div>
            <div id="storeList" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
          </div>

          <!-- ACTION CARD -->
          <div class="ui-card border-t-2 border-orange-500 hidden animate-fade-in" id="storeActionCard">
             <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-2">
                   <div class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                   <div class="font-bold text-orange-400" id="activeStoreName"></div>
                </div>
                <button onclick="document.getElementById('storeActionCard').classList.add('hidden')" class="opacity-50 hover:opacity-100"><i class="fa-solid fa-xmark"></i></button>
             </div>
             <div class="grid grid-cols-2 gap-4">
                <button class="ui-btn ui-btn-outline flex flex-col py-6 gap-2 group" onclick="goToOrder()">
                    <i class="fa-solid fa-cart-plus text-xl text-orange-500 group-hover:scale-110 transition-transform"></i>
                    <span class="text-[10px] font-bold uppercase tracking-wider">Lên đơn hàng</span>
                </button>
                <button class="ui-btn ui-btn-outline flex flex-col py-6 gap-2 group" onclick="goToInventory()">
                    <i class="fa-solid fa-boxes-stacked text-xl text-sky-500 group-hover:scale-110 transition-transform"></i>
                    <span class="text-[10px] font-bold uppercase tracking-wider">Kiểm tồn kho</span>
                </button>
             </div>
          </div>

          <div id="dms-empty-state" class="ui-card flex flex-col items-center justify-center py-20 text-center opacity-30">
              <i class="fa-solid fa-map-location-dot text-6xl mb-4"></i>
              <p>Chọn một tuyến đường để quản lý điểm bán</p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL TẠO TUYẾN -->
    <div id="routeModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4">
        <div class="ui-card w-full max-w-md animate-zoom-in border-t-4 border-sky-500">
            <h3 class="text-lg font-bold text-sky-400 uppercase tracking-tight mb-6">Tạo Tuyến Mới</h3>
            <div class="space-y-4">
                <div class="ui-field">
                  <label>Mã tuyến *</label>
                  <input type="text" id="newRouteCode" placeholder="VD: HCM_Q1_T2" class="ui-input uppercase font-mono">
                </div>
                <div class="ui-field">
                  <label>Tên tuyến *</label>
                  <input type="text" id="newRouteName" placeholder="VD: Tuyến Quận 1" class="ui-input">
                </div>
                
                <!-- DROPDOWN TỈNH THÀNH (STYLE USERS) -->
                <div class="ui-field relative">
                  <label>Khu vực/Tỉnh thành *</label>
                  <div class="ui-input-icon">
                    <i class="fa-solid fa-map-location-dot"></i>
                    <input id="route_province_input" class="ui-input" placeholder="Chọn tỉnh/thành..." readonly />
                    <i class="fa-solid fa-caret-down ui-dropdown-indicator"></i>
                  </div>
                  <div id="route_province_dropdown" class="ui-search-dropdown"></div>
                </div>

                <!-- DROPDOWN NHÂN VIÊN PHỤ TRÁCH (STYLE USERS) -->
                ${
                  isManager()
                    ? `
                <div class="ui-field relative">
                  <label>Nhân viên phụ trách *</label>
                  <div class="ui-input-icon">
                    <i class="fa-solid fa-user-tie"></i>
                    <input id="route_assignee_input" class="ui-input" placeholder="Chọn nhân viên..." readonly />
                    <i class="fa-solid fa-caret-down ui-dropdown-indicator"></i>
                  </div>
                  <div id="route_assignee_dropdown" class="ui-search-dropdown"></div>
                </div>
                `
                    : ""
                }

                <div class="flex gap-2 mt-6">
                    <button onclick="closeModal('routeModal')" class="ui-btn flex-1">Hủy</button>
                    <button onclick="submitRoute()" class="ui-btn ui-btn-primary flex-[2]">Lưu Tuyến</button>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL TẠO ĐIỂM BÁN -->
    <div id="storeModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4">
        <div class="ui-card w-full max-w-md animate-zoom-in border-t-4 border-orange-500">
            <h3 class="text-lg font-bold text-orange-400 uppercase tracking-tight mb-6">Thêm Điểm Bán Mới</h3>
            <div class="space-y-4">
                <div class="ui-field"><label>Mã cửa hàng</label><input type="text" id="newStoreCode" class="ui-input uppercase"></div>
                <div class="ui-field"><label>Tên cửa hàng *</label><input type="text" id="newStoreName" class="ui-input"></div>
                <div class="ui-field"><label>Địa chỉ *</label><input type="text" id="newStoreAddress" class="ui-input"></div>
                <div class="ui-field"><label>Số điện thoại</label><input type="text" id="newStorePhone" class="ui-input"></div>
                <div class="flex gap-2 mt-6">
                    <button onclick="closeModal('storeModal')" class="ui-btn flex-1">Hủy</button>
                    <button onclick="submitStore()" class="ui-btn ui-btn-primary flex-[2] !bg-orange-600">Lưu Điểm Bán</button>
                </div>
            </div>
        </div>
    </div>
  `;

  loadRoutes();
  initCustomDropdowns();
}

// ==================================
// LOGIC XỬ LÝ
// ==================================

// ==================================
// KHỞI TẠO CÁC DROPDOWN TỰ CHẾ
// ==================================
async function initCustomDropdowns() {
  // 1. Tỉnh thành
  const provinces = await getProvinces();
  setupSearchDropdown({
    inputEl: document.getElementById("route_province_input"),
    dropdownEl: document.getElementById("route_province_dropdown"),
    data: provinces.map((p) => ({ name: p.name, value: p.code })),
    onSelect: (item) => {
      document.getElementById("route_province_input").dataset.value =
        item.value;
    },
  });

  // 2. Nhân viên (Chỉ khi là manager)
  if (isManager()) {
    const res = await authFetch(API + "/users/managers?role=sales");
    if (res) {
      const staff = await res.json();
      const inputEl = document.getElementById("route_assignee_input");

      // Mặc định chọn chính mình
      inputEl.value = `${store.user.full_name} (Chính tôi)`;
      inputEl.dataset.value = store.user.id;

      setupSearchDropdown({
        inputEl: inputEl,
        dropdownEl: document.getElementById("route_assignee_dropdown"),
        data: staff.map((s) => ({
          name: `${s.full_name} (${s.role})`,
          value: s.id,
        })),
        onSelect: (item) => {
          inputEl.dataset.value = item.value;
        },
      });
    }
  }
}

// Khởi tạo Searchable Dropdown cho Tỉnh thành trong Modal
async function initProvinceSearch() {
  const provinces = await getProvinces();
  const inputEl = document.getElementById("route_province_input");
  const dropdownEl = document.getElementById("route_province_dropdown");

  if (!inputEl || !dropdownEl) return;

  setupSearchDropdown({
    inputEl,
    dropdownEl,
    data: provinces.map((p) => ({ name: p.name, value: p.code })), // Map code làm ID
    onSelect: (item) => {
      inputEl.dataset.value = item.value; // Lưu code vào dataset để gửi backend
    },
  });
}

async function loadRoutes() {
  const res = await authFetch(API + "/my-routes");
  if (!res) return;
  const routes = await res.json();
  const listEl = document.getElementById("routeList");

  document.getElementById("stat-routes").innerText = routes.length;

  if (routes.length === 0) {
    listEl.innerHTML = `<div class="p-8 text-center opacity-30 italic text-sm">Chưa có tuyến đường nào được gán</div>`;
    return;
  }

  listEl.innerHTML = routes
    .map(
      (r) => `
    <div class="p-4 border border-white/5 rounded-xl hover:bg-sky-500/5 hover:border-sky-500/30 cursor-pointer transition-all group relative overflow-hidden" 
         onclick="viewRouteDetails(${r.id}, '${r.name}', '${r.code}')">
      <div class="flex justify-between items-center relative z-10">
        <div>
          <div class="font-bold text-sm group-hover:text-sky-400 transition-colors">${r.name}</div>
          <div class="text-[10px] opacity-40 font-mono mt-1">${r.code}</div>
        </div>
        <i class="fa-solid fa-chevron-right text-[10px] opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
      </div>
      <div class="absolute inset-y-0 left-0 w-1 bg-sky-500 scale-y-0 group-hover:scale-y-100 transition-transform"></div>
    </div>
  `,
    )
    .join("");
}

window.viewRouteDetails = async function (routeId, name, code) {
  currentRouteId = routeId;
  document.getElementById("dms-empty-state").classList.add("hidden");
  document.getElementById("storeActionCard").classList.add("hidden");

  const section = document.getElementById("storeSection");
  const listEl = document.getElementById("storeList");
  section.classList.remove("hidden");
  listEl.innerHTML = `<div class="col-span-full py-20 text-center animate-pulse opacity-50 text-sm">Đang tải danh sách điểm bán...</div>`;

  const res = await authFetch(API + `/stores?route_id=${routeId}`);
  if (!res) return;
  const stores = await res.json();

  document.getElementById("selectedRouteName").innerText = name;
  document.getElementById("selectedRouteCode").innerText = `Mã tuyến: ${code}`;
  document.getElementById("stat-stores").innerText = stores.length;

  if (stores.length === 0) {
    listEl.innerHTML = `<div class="col-span-full p-12 text-center border-2 border-dashed border-white/5 rounded-2xl opacity-30 text-sm italic">Tuyến này chưa có điểm bán nào</div>`;
  } else {
    listEl.innerHTML = stores
      .map(
        (s) => `
      <div class="ui-card bg-white/[0.02] hover:bg-white/[0.05] border-white/5 hover:border-orange-500/40 transition-all cursor-pointer group p-4"
           onclick="selectStore(${s.id}, '${s.name}')">
        <div class="flex justify-between items-start mb-2">
          <div class="font-bold text-sm group-hover:text-orange-400 transition-colors">${s.name}</div>
          <span class="text-[9px] bg-sky-500/10 px-2 py-0.5 rounded text-sky-400 font-mono">${s.code}</span>
        </div>
        <div class="text-[11px] opacity-50 flex items-start gap-2">
          <i class="fa-solid fa-location-dot mt-0.5 text-orange-500"></i>
          <span class="line-clamp-2">${s.address || "N/A"}</span>
        </div>
      </div>
    `,
      )
      .join("");
  }
};

window.selectStore = function (id, name) {
  const card = document.getElementById("storeActionCard");
  card.classList.remove("hidden");
  document.getElementById("activeStoreName").innerText = name;
  card.dataset.storeId = id;
  card.dataset.storeName = name;
  card.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

// Gọi API lấy cấp dưới để gán tuyến
async function loadSubordinates() {
  const res = await authFetch(API + "/users/managers?role=sales");
  if (!res) return;
  const staff = await res.json();
  const select = document.getElementById("newRouteAssignee");
  if (!select) return;
  staff.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = `${s.full_name} (${s.role})`;
    select.appendChild(opt);
  });
}

// Modal & Submit Handlers
window.showCreateRouteModal = () =>
  document.getElementById("routeModal").classList.remove("hidden");
window.showCreateStoreModal = () =>
  document.getElementById("storeModal").classList.remove("hidden");
window.closeModal = (id) => document.getElementById(id).classList.add("hidden");

window.submitRoute = async function () {
  const provinceInput = document.getElementById("route_province_input");
  const assigneeInput = document.getElementById("route_assignee_input");

  const data = {
    route_code: document.getElementById("newRouteCode").value.trim(),
    route_name: document.getElementById("newRouteName").value.trim(),
    province_id: parseInt(provinceInput.dataset.value),
    // Nếu là manager thì lấy từ dropdown, nếu không thì lấy ID chính mình
    user_id: isManager()
      ? parseInt(assigneeInput.dataset.value)
      : store.user.id,
  };

  if (!data.route_code || !data.route_name || !data.province_id) {
    return showToast("Vui lòng điền đầy đủ thông tin bắt buộc", "error");
  }

  const res = await authFetch(API + "/routes", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (res && res.ok) {
    showToast("Tạo tuyến thành công", "success");
    closeModal("routeModal");
    loadRoutes();
  } else {
    const err = await res.json();
    showToast(err.message || "Lỗi tạo tuyến", "error");
  }
};

window.submitStore = async function () {
  const data = {
    store_code: document.getElementById("newStoreCode").value.trim(),
    name: document.getElementById("newStoreName").value.trim(),
    address: document.getElementById("newStoreAddress").value.trim(),
    phone: document.getElementById("newStorePhone").value.trim(),
    route_id: currentRouteId,
  };

  if (!data.name || !data.address)
    return showToast("Tên và địa chỉ là bắt buộc", "error");

  const res = await authFetch(API + "/stores", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (res && res.ok) {
    showToast("Thêm điểm bán thành công", "success");
    closeModal("storeModal");
    viewRouteDetails(
      currentRouteId,
      document.getElementById("selectedRouteName").innerText,
      "",
    );
  } else {
    const err = await res.json();
    showToast(err.message || "Lỗi thêm điểm bán", "error");
  }
};

// Chuyển hướng
window.goToOrder = () => {
  const card = document.getElementById("storeActionCard");
  sessionStorage.setItem("active_store_id", card.dataset.storeId);
  sessionStorage.setItem("active_store_name", card.dataset.storeName);
  navigate("/order-create");
};
window.goToInventory = () => {
  const card = document.getElementById("storeActionCard");
  sessionStorage.setItem("active_store_id", card.dataset.storeId);
  sessionStorage.setItem("active_store_name", card.dataset.storeName);
  navigate("/inventory-check");
};
