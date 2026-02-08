//pages\users.page.js
// =====================================================
// USERS PAGE – SPA VERSION (SAFE UX IMPROVE)
// File: Frontend/nhatminh/pages/users.page.js
// =====================================================

// =====================================================
// REALTIME VALIDATION STATE
// =====================================================
let usernameTimer = null;

import { store } from "../app/store.js";
import { navigate } from "../app/router.js";
import {
  showError,
  showOk,
  clearHint,
  scrollToField,
} from "../ui/form-feedback.js";
import {
  bindPasswordStrength,
  isStrongPassword,
} from "../ui/password-strength.js";

import { ROLE_ORDER } from "../app/constants/roles.js";
// =====================================================
// STATE
// =====================================================
let currentUser = null;
let managersCache = [];
let lastCheckedUsername = null;

// =====================================================
// ADDRESS CACHE (PROVINCE API)
// =====================================================
let provinceCache = [];
let districtCache = {};
let wardCache = {};

// =====================================================
// Toggle regenerate username loading / hover icon
// =====================================================
let __usernameGenerating = false;

function setUsernameGenerating(isLoading) {
  const btn = document.getElementById("regenUsernameBtn");
  if (!btn) return;

  __usernameGenerating = isLoading;
  btn.disabled = isLoading;

  btn.innerHTML = isLoading
    ? `<i class="fa-solid fa-arrows-rotate fa-spin"></i>`
    : `<i class="fa-solid fa-rotate"></i>`;
}

// =====================================================
// Bind hover effect for regenerate username icon
// =====================================================
function bindUsernameRegenHover() {
  const btn = document.getElementById("regenUsernameBtn");
  if (!btn) return;

  btn.addEventListener("mouseenter", () => {
    if (__usernameGenerating) return;

    btn.innerHTML = `<i class="fa-solid fa-arrows-rotate fa-spin"></i>`;
  });

  btn.addEventListener("mouseleave", () => {
    if (__usernameGenerating) return;

    btn.innerHTML = `<i class="fa-solid fa-rotate"></i>`;
  });
}
// =====================================================
// Danh sách tỉnh thành (theo API tác giả)
// =====================================================
async function loadProvinces() {
  if (provinceCache.length) return provinceCache;

  const res = await fetch(API_PROVINCE + "/api/v1/p/");
  if (!res.ok) return [];

  provinceCache = await res.json();
  return provinceCache;
}
// =====================================================
// Danh sách quận / huyện theo tỉnh
// =====================================================
async function loadDistricts(provinceCode) {
  if (districtCache[provinceCode]) {
    return districtCache[provinceCode];
  }

  const res = await fetch(API_PROVINCE + `/api/v1/p/${provinceCode}?depth=2`);
  if (!res.ok) return [];

  const data = await res.json();
  districtCache[provinceCode] = data.districts || [];
  return districtCache[provinceCode];
}
// =====================================================
// Danh sách phường / xã theo huyện
// =====================================================
async function loadWards(districtCode) {
  if (wardCache[districtCode]) {
    return wardCache[districtCode];
  }

  const res = await fetch(API_PROVINCE + `/api/v1/d/${districtCode}?depth=2`);
  if (!res.ok) return [];

  const data = await res.json();
  wardCache[districtCode] = data.wards || [];
  return wardCache[districtCode];
}

// =====================================================
// RENDER ENTRY (SPA)
// =====================================================
export function renderUsers() {
  if (!store.user) {
    console.warn("[renderUsers] store.user chưa sẵn sàng");
    return;
  }

  currentUser = store.user;

  // ===============================
  // GUARD ROLE
  // ===============================
  if (currentUser.role === "sales") {
    showToast("Bạn không có quyền truy cập chức năng này", "error");
    navigate("/");
    return;
  }

  document.getElementById("page-content").innerHTML =
    `<div id="usersPage"></div>`;

  renderPage();
  bindUsernameRegenHover();
  initDobPicker();
  bindCustomSelects();
  bindEvents();
}

// =====================================================
// RENDER PAGE
// =====================================================
// =====================================================
// RENDER PAGE
// =====================================================
function renderPage() {
  const page = document.getElementById("usersPage");

  page.innerHTML = `
   <div class="ui-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div class="ui-grid-auto">

    <!-- ================= THÔNG TIN CHUNG CỦA TUYẾN ================= -->
    <div class="ui-card ui-card-glow">
      <div class="ui-title mb-4 flex items-center gap-2">
        <i class="fa-solid fa-route"></i>
        <span>Thông tin tuyến bán hàng</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- TÊN TUYẾN -->
        <div>
          <label>Tên tuyến *</label>
          <div class="ui-input-icon">
            <i class="fa-solid fa-signature"></i>
            <input id="route_name" class="ui-input" placeholder="vd: Tuyến Quận 1 - Thứ 2" />
          </div>
        </div>

        <!-- MÃ TUYẾN -->
        <div>
          <label>Mã tuyến *</label>
          <div class="ui-input-icon">
            <i class="fa-solid fa-barcode"></i>
            <input id="route_code" class="ui-input" placeholder="vd: T2-Q1-001" />
          </div>
        </div>

        <!-- NHÂN VIÊN PHỤ TRÁCH -->
        <div class="ui-field relative">
          <label>Nhân viên bán hàng (Sales) *</label>
          <div class="ui-input-icon">
            <i class="fa-solid fa-user-tie"></i>
            <input id="sales_rep_input" class="ui-input" placeholder="Chọn nhân viên" readonly />
            <i class="fa-solid fa-caret-down ui-dropdown-indicator"></i>
          </div>
          <div id="sales_rep_dropdown" class="ui-search-dropdown"></div>
        </div>

        <!-- TẦN SUẤT -->
        <div class="ui-field relative">
          <label>Tần suất ghé thăm *</label>
          <div class="ui-input-icon">
            <i class="fa-solid fa-clock-rotate-left"></i>
            <input id="frequency_input" class="ui-input" placeholder="Chọn tần suất (F1, F2...)" readonly />
            <i class="fa-solid fa-caret-down ui-dropdown-indicator"></i>
          </div>
          <div id="frequency_dropdown" class="ui-search-dropdown"></div>
        </div>

      </div>
    </div>

    <!-- ================= LỊCH TRÌNH TRONG TUẦN ================= -->
    <div class="ui-card ui-card-glow">
      <div class="ui-title mb-4 flex items-center gap-2">
        <i class="fa-solid fa-calendar-week"></i>
        <span>Lịch trình ghé thăm</span>
      </div>

      <p class="text-sm text-slate-500 mb-4">Chọn các ngày trong tuần thực hiện tuyến này:</p>

      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        <!-- Thứ 2 -->
        <label class="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
          <input type="checkbox" name="route_days" value="Mon" class="mb-2 w-4 h-4 text-blue-600" />
          <span class="text-sm font-medium">Thứ 2</span>
        </label>
        <!-- Thứ 3 -->
        <label class="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
          <input type="checkbox" name="route_days" value="Tue" class="mb-2 w-4 h-4 text-blue-600" />
          <span class="text-sm font-medium">Thứ 3</span>
        </label>
        <!-- Thứ 4 -->
        <label class="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
          <input type="checkbox" name="route_days" value="Wed" class="mb-2 w-4 h-4 text-blue-600" />
          <span class="text-sm font-medium">Thứ 4</span>
        </label>
        <!-- Thứ 5 -->
        <label class="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
          <input type="checkbox" name="route_days" value="Thu" class="mb-2 w-4 h-4 text-blue-600" />
          <span class="text-sm font-medium">Thứ 5</span>
        </label>
        <!-- Thứ 6 -->
        <label class="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
          <input type="checkbox" name="route_days" value="Fri" class="mb-2 w-4 h-4 text-blue-600" />
          <span class="text-sm font-medium">Thứ 6</span>
        </label>
        <!-- Thứ 7 -->
        <label class="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
          <input type="checkbox" name="route_days" value="Sat" class="mb-2 w-4 h-4 text-blue-600" />
          <span class="text-sm font-medium">Thứ 7</span>
        </label>
        <!-- CN -->
        <label class="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
          <input type="checkbox" name="route_days" value="Sun" class="mb-2 w-4 h-4 text-blue-600" />
          <span class="text-sm font-medium">Chủ Nhật</span>
        </label>
      </div>
    </div>

    <!-- ================= KHU VỰC VÀ GHI CHÚ ================= -->
    <div class="ui-card ui-card-glow">
      <div class="ui-title mb-4 flex items-center gap-2">
        <i class="fa-solid fa-map-location-dot"></i>
        <span>Phạm vi áp dụng</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- KHU VỰC (Dropdown giống Tỉnh/Thành) -->
        <div class="ui-field relative">
          <label>Khu vực / Địa bàn</label>
          <div class="ui-input-icon">
            <i class="fa-solid fa-map"></i>
            <input id="area_input" class="ui-input" placeholder="Chọn khu vực áp dụng" readonly />
            <i class="fa-solid fa-caret-down ui-dropdown-indicator"></i>
          </div>
          <div id="area_dropdown" class="ui-search-dropdown"></div>
        </div>

        <!-- MÔ TẢ -->
        <div>
          <label>Ghi chú tuyến</label>
          <div class="ui-input-icon">
            <i class="fa-solid fa-comment-dots"></i>
            <input id="description" class="ui-input" placeholder="Lộ trình chi tiết hoặc lưu ý..." />
          </div>
        </div>
      </div>

      <!-- NÚT TẠO -->
      <div class="mt-8">
        <button id="submitBtn" class="ui-btn ui-btn-primary w-full flex items-center justify-center gap-2">
          <i class="fa-solid fa-plus-circle"></i>
          <span>Tạo tuyến bán hàng</span>
        </button>
      </div>
    </div>

  </div>
</div>
`;
}

// =====================================================
// ROLE OPTIONS (ĐÚNG BACKEND)
// =====================================================
function renderRoleOptions() {
  const role = currentUser.role;
  const opt = (v) => `<option value="${v}">${ROLE_LABELS[v]}</option>`;

  if (role === "admin")
    return `<option value="">-- chọn --</option>
            ${opt("director")}${opt("supervisor")}${opt("sales")}`;

  if (role === "director")
    return `<option value="">-- chọn --</option>
            ${opt("supervisor")}${opt("sales")}`;

  if (role === "supervisor")
    return `<option value="">-- chọn --</option>${opt("sales")}`;

  return "";
}

// =====================================================
// EVENTS
// =====================================================
// =====================================================
// EVENTS
// =====================================================

// 2. Hàm lấy danh sách Role hợp lệ (Dựa trên quy tắc AI.md)

function getAvailableRoles() {
  if (!currentUser || !currentUser.role) {
    console.warn("[getAvailableRoles] currentUser chưa sẵn sàng");
    return []; // KHÔNG đoán, KHÔNG crash
  }

  const myRole = currentUser.role;
  const allRoles = [
    { name: "Giám đốc kinh doanh", value: "director" },
    { name: "Giám đốc kinh doanh khu vực", value: "regional_director" },
    { name: "Giám sát kinh doanh", value: "supervisor" },
    { name: "Nhân viên kinh doanh", value: "sales" },
  ];

  if (myRole === "admin") return allRoles;

  // Rule: Chỉ tạo được cấp thấp hơn mình
  const myIdx = ROLE_ORDER.indexOf(myRole);
  return allRoles.filter((r) => ROLE_ORDER.indexOf(r.value) < myIdx);
}

// 1. Khai báo dữ liệu mẫu
const GENDER_DATA = [
  { name: "Nam", value: "male" },
  { name: "Nữ", value: "female" },
];

// 3. Khởi tạo các dropdown trong bindEvents()
function bindCustomSelects() {
  if (!currentUser) {
    console.warn("[bindCustomSelects] currentUser chưa sẵn sàng");
    return;
  }

  // --- Dropdown Giới tính ---
  setupSearchDropdown({
    inputEl: document.getElementById("gender_input"),
    dropdownEl: document.getElementById("gender_dropdown"),
    data: GENDER_DATA,
    onSelect: (item) => {
      document.getElementById("gender_input").dataset.value = item.value;
      updateSubmitState(); // Kiểm tra nút tạo tài khoản
    },
  });

  // --- Dropdown Vai trò ---
  setupSearchDropdown({
    inputEl: document.getElementById("role_input"),
    dropdownEl: document.getElementById("role_dropdown"),
    data: getAvailableRoles(),
    onSelect: (item) => {
      const input = document.getElementById("role_input");
      input.dataset.value = item.value;

      // Gọi logic xử lý Manager khi role thay đổi
      handleRoleChangeLogic(item.value);
      updateSubmitState();
    },
  });
}

// 3. Khởi tạo các dropdown trong bindEvents()
function reset_manager_dropdown() {
  if (!currentUser) {
    console.warn("[bindCustomSelects] currentUser chưa sẵn sàng");
    return;
  }

  // --- Dropdown Giới tính ---
  setupSearchDropdown({
    inputEl: document.getElementById("gender_input"),
    dropdownEl: document.getElementById("gender_dropdown"),
    data: GENDER_DATA,
    onSelect: (item) => {
      document.getElementById("gender_input").dataset.value = item.value;
      updateSubmitState(); // Kiểm tra nút tạo tài khoản
    },
  });
}

function bindEvents() {
  const fullName = document.getElementById("full_name");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const passwordConfirm = document.getElementById("password_confirm");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const submitBtn = document.getElementById("submitBtn");

  document.getElementById("identity_card").addEventListener("input", (e) => {
    const value = e.target.value;
    const hint = e.target.parentElement.nextElementSibling; // nếu bạn có hint
    if (!/^\d{12}$/.test(value)) {
      showError(e.target, null, "CCCD phải đúng 12 chữ số");
    } else {
      showOk(e.target, null);
    }
  });

  // ===============================
  // FULL NAME – auto capitalize
  // ===============================

  // ===============================
  // MANUAL REGENERATE USERNAME BUTTON
  // ===============================
  const regenBtn = document.getElementById("regenUsernameBtn");

  regenBtn.addEventListener("click", async () => {
    if (!fullName.value.trim()) {
      scrollToField(fullName, null, "Vui lòng nhập họ tên trước");
      return;
    }

    // reset flag để cho phép auto
    usernameManuallyEdited = false;

    const baseUsername = generateUsernameFromFullName(fullName.value);
    if (!baseUsername) return;

    setUsernameGenerating(true);

    username.value = "⏳ đang tạo username...";
    username.disabled = true;

    const finalUsername = await resolveUsernameAvailable(baseUsername);

    username.disabled = false;
    setUsernameGenerating(false);

    if (finalUsername) {
      username.value = finalUsername;
      showOk(username, document.getElementById("usernameHint"));
    }

    if (finalUsername) {
      username.value = finalUsername;
      showOk(username, document.getElementById("usernameHint"));
    }
  });

  // ===============================
  // FULL NAME → REGENERATE USERNAME
  // ===============================
  fullName.addEventListener("blur", async () => {
    // ❌ KHÔNG showError khi trống
    if (!fullName.value.trim()) {
      clearHint(fullName);
      return;
    }

    fullName.value = formatFullName(fullName.value);

    if (usernameManuallyEdited) return;

    const baseUsername = generateUsernameFromFullName(fullName.value);
    if (!baseUsername) return;
    setUsernameGenerating(true);

    username.value = "⏳ đang tạo username...";
    username.disabled = true;

    const finalUsername = await resolveUsernameAvailable(baseUsername);

    username.disabled = false;
    setUsernameGenerating(false);

    if (finalUsername) {
      username.value = finalUsername;
      showOk(username, document.getElementById("usernameHint"));
    }

    if (finalUsername) {
      username.value = finalUsername;
      showOk(username, document.getElementById("usernameHint"));
    }
  });

  // nếu user xóa trắng username → cho phép auto lại
  username.addEventListener("blur", () => {
    if (!username.value.trim()) {
      usernameManuallyEdited = false;
    }
  });

  // ===============================
  // USERNAME MANUAL EDIT FLAG
  // ===============================
  let usernameManuallyEdited = false;

  username.addEventListener("input", () => {
    usernameManuallyEdited = true;
  });

  // ===============================
  // USERNAME – VALIDATE + CHECK (ON BLUR)
  // ===============================
  username.addEventListener("blur", async () => {
    const value = username.value.trim().toLowerCase();
    const hint = document.getElementById("usernameHint");

    if (!value) {
      clearHint(username, hint);
      return;
    }

    // ===== BASIC VALIDATION (NO API)
    const basicError = validateUsernameBasic(value);
    if (basicError) {
      showError(username, hint, basicError);
      return;
    }

    // ===== BACKEND CHECK
    const res = await authFetch(
      API + "/users/check-username?username=" + encodeURIComponent(value),
    );
    if (!res) return;

    const data = await res.json();

    if (data.exists) {
      showError(username, hint, "Username đã tồn tại");
    } else {
      showOk(username, hint);
    }
  });

  // ===============================
  // EMAIL
  // ===============================
  email.addEventListener("input", () => {
    const hint = document.getElementById("emailHint");
    if (!email.value) return clearHint(email, hint);

    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
    ok ? showOk(email, hint) : showError(email, hint, "Email không hợp lệ");
  });

  // ===============================
  // PHONE
  // ===============================
  phone.addEventListener("input", () => {
    const hint = document.getElementById("phoneHint");
    if (!phone.value) return clearHint(phone, hint);

    const ok = /^(0|\+84)[0-9]{9}$/.test(phone.value);
    ok ? showOk(phone, hint) : showError(phone, hint, "SĐT không hợp lệ");
  });

  // ===============================
  // PASSWORD STRENGTH – ONLY SHOW ON FOCUS
  // ===============================
  const strengthBox = document.getElementById("passwordStrength");

  password.addEventListener("focus", () => {
    strengthBox?.classList.remove("hidden");
  });

  password.addEventListener("blur", () => {
    strengthBox?.classList.add("hidden");
  });

  // ===============================
  // PASSWORD STRENGTH
  // ===============================
  password.addEventListener("input", () => {
    updatePasswordStrength(password.value);

    const hint = document.getElementById("passwordConfirmHint");
    const ok = isStrongPassword(password.value);
    ok ? clearHint(password) : showError(password, hint, "Mật khẩu yếu");
  });

  // ===============================
  // PASSWORD CONFIRM
  // ===============================
  passwordConfirm.addEventListener("input", () => {
    const hint = document.getElementById("passwordConfirmHint");
    passwordConfirm.value === password.value
      ? showOk(passwordConfirm, hint)
      : showError(passwordConfirm, hint, "Mật khẩu không khớp");
  });
  // ===============================
  // WATCH REQUIRED INPUTS
  // ===============================
  ["full_name", "username", "password", "password_confirm", "role"].forEach(
    (id) => {
      const el = document.getElementById(id);
      el?.addEventListener("input", updateSubmitState);
      el?.addEventListener("change", updateSubmitState);
    },
  );

  updateSubmitState();
  bindAddressEvents();

  submitBtn.addEventListener("click", submitForm);
}

import { setupSearchDropdown } from "../ui/address-dropdown.js";
async function bindAddressEvents() {
  const provinceInput = document.getElementById("province_input");
  const provinceDropdown = document.getElementById("province_dropdown");

  const districtInput = document.getElementById("district_input");
  const districtDropdown = document.getElementById("district_dropdown");

  const wardInput = document.getElementById("ward_input");
  const wardDropdown = document.getElementById("ward_dropdown");

  // ===== LOAD PROVINCES =====
  const provinces = await loadProvinces();

  setupSearchDropdown({
    inputEl: provinceInput,
    dropdownEl: provinceDropdown,
    data: provinces,

    async onSelect(province) {
      // reset downstream
      districtInput.value = "";
      wardInput.value = "";
      districtInput.disabled = true;
      wardInput.disabled = true;

      // load districts
      const districts = await loadDistricts(province.code);

      districtInput.disabled = false;

      setupSearchDropdown({
        inputEl: districtInput,
        dropdownEl: districtDropdown,
        data: districts,

        async onSelect(district) {
          wardInput.value = "";
          wardInput.disabled = true;

          const wards = await loadWards(district.code);

          wardInput.disabled = false;

          setupSearchDropdown({
            inputEl: wardInput,
            dropdownEl: wardDropdown,
            data: wards,

            onSelect() {
              // chọn xong phường → không cần làm gì thêm
            },
          });
        },
      });
    },
  });
}

// =====================================================
// PASSWORD STRENGTH UI (SYNC BACKEND RULE)
// =====================================================
function updatePasswordStrength(pw) {
  const bars = document.querySelectorAll("[data-bar]");
  const levelText = document.getElementById("passwordLevel");

  if (!bars.length || !levelText) return;

  const rules = {
    length: pw.length >= 8,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    number: /\d/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };

  // update rule text
  Object.entries(rules).forEach(([key, ok]) => {
    const li = document.querySelector(`[data-rule="${key}"]`);
    if (!li) return;
    li.textContent = (ok ? "✔️ " : "❌ ") + li.textContent.slice(2);
    li.classList.toggle("text-green-500", ok);
    li.classList.toggle("text-red-500", !ok);
  });

  const score = Object.values(rules).filter(Boolean).length;

  const levels = [
    "Empty",
    "Weak",
    "Medium",
    "Strong",
    "Very Strong",
    "Super Strong",
  ];

  levelText.textContent = levels[score];
  levelText.className =
    "font-semibold " +
    (score >= 4
      ? "text-green-500"
      : score >= 2
        ? "text-yellow-500"
        : "text-red-500");

  // update bars
  bars.forEach((bar, i) => {
    bar.className =
      "h-2 flex-1 rounded " +
      (i < score
        ? score >= 4
          ? "bg-green-500"
          : score >= 2
            ? "bg-yellow-400"
            : "bg-red-400"
        : "bg-slate-200");
  });
}

// =====================================================
// ROLE CHANGE → MANAGER
// =====================================================

// =====================================================
// ROLE CHANGE → MANAGER (FIX STALE DROPDOWN)
// =====================================================

async function handleRoleChangeLogic(targetRole) {
  const wrapper = document.getElementById("managerWrapper");
  const mInput = document.getElementById("manager_input");
  const mDropdown = document.getElementById("manager_dropdown");

  // 1. Lưu lại ID manager hiện tại trước khi reset để so sánh
  const previousManagerId = mInput.dataset.value || null;

  // 2. Reset UI về trạng thái mặc định (Tạm ẩn và xóa text)
  wrapper.classList.add("hidden");
  mInput.value = "";
  mDropdown.innerHTML = "";
  // Lưu ý: Không delete dataset.value ngay ở đây, hãy để logic bên dưới quyết định

  // Nếu không chọn role, thoát luôn
  if (!targetRole) {
    delete mInput.dataset.value;
    updateSubmitState();
    return;
  }

  try {
    // 3. Fetch danh sách manager mới dựa trên role đã chọn
    const res = await authFetch(API + `/users/managers?role=${targetRole}`);
    if (!res || !res.ok) {
      delete mInput.dataset.value;
      updateSubmitState();
      return;
    }

    const managers = await res.json();

    // 4. Nếu KHÔNG có manager nào (VD: Admin tạo Director thì có thể không cần manager)
    if (!managers || managers.length === 0) {
      delete mInput.dataset.value;
      updateSubmitState();
      return; // wrapper vẫn đang hidden
    }

    // 5. Kiểm tra xem manager cũ có còn nằm trong danh sách mới không
    const stillValid = managers.find(
      (m) => String(m.id) === String(previousManagerId),
    );

    if (stillValid) {
      // Nếu vẫn hợp lệ -> Giữ nguyên, hiển thị lại wrapper
      mInput.value = stillValid.full_name;
      mInput.dataset.value = stillValid.id;
      wrapper.classList.remove("hidden");
    } else if (managers.length === 1) {
      // Nếu chỉ có 1 manager duy nhất -> Tự động chọn luôn
      mInput.value = managers[0].full_name;
      mInput.dataset.value = managers[0].id;
      wrapper.classList.remove("hidden"); // Hiện ra để user biết ai là manager
    } else {
      // Nếu có nhiều manager -> Xóa chọn cũ, hiện dropdown cho user chọn lại
      delete mInput.dataset.value;
      wrapper.classList.remove("hidden");
    }

    // 6. Cập nhật dữ liệu cho Dropdown (Dù là chọn hay chưa chọn cũng nạp data)
    setupSearchDropdown({
      inputEl: mInput,
      dropdownEl: mDropdown,
      data: managers.map((m) => ({
        name: `${m.full_name} (${roleToLabel(m.role)})`,
        value: m.id,
      })),
      onSelect(item) {
        mInput.dataset.value = item.value;
        updateSubmitState();
      },
    });
  } catch (err) {
    console.error("Lỗi khi tải danh sách quản lý:", err);
    delete mInput.dataset.value;
  }

  updateSubmitState();
}

// =====================================================
// CHECK USERNAME
// =====================================================
async function checkUsername() {
  const input = document.getElementById("username");
  const hint = document.getElementById("usernameHint");
  const value = input.value.trim().toLowerCase();

  if (!value) {
    lastCheckedUsername = null;
    return clearHint(input, hint);
  }

  if (value === lastCheckedUsername) return;
  lastCheckedUsername = value;

  const res = await authFetch(
    API + "/users/check-username?username=" + encodeURIComponent(value),
  );
  if (!res) return;

  const data = await res.json();
  data.exists
    ? showError(input, hint, "❌ Username đã tồn tại")
    : showOk(input, hint);
}

// =====================================================
// VALIDATE USERNAME BASIC – STRICT RULE
// =====================================================
function validateUsernameBasic(username) {
  // không khoảng trắng
  if (/\s/.test(username)) {
    return "Username không được chứa khoảng trắng";
  }

  // không tiếng Việt có dấu
  if (/[^\x00-\x7F]/.test(username)) {
    return "Username không được chứa ký tự tiếng Việt có dấu";
  }

  // chỉ cho phép a-z, 0-9, dấu chấm
  if (!/^[a-z0-9.]+$/.test(username)) {
    return "Username chỉ được chứa chữ thường, số và dấu chấm";
  }

  // tối thiểu 5 ký tự
  if (username.length < 5) {
    return "Username tối thiểu 5 ký tự";
  }

  return null;
}

// =====================================================
// SUBMIT
// =====================================================
async function submitForm() {
  const data = {
    username: document.getElementById("username").value.trim(),
    password: password.value,
    full_name: document.getElementById("full_name").value,
    gender: document.getElementById("gender_input").dataset.value, // Lấy từ dataset
    identity_card: document.getElementById("identity_card").value.trim(),
    phone: phone.value,
    email: email.value,
    role: document.getElementById("role_input").dataset.value, // Lấy từ dataset
    manager_id: document.getElementById("manager_input").dataset.value || null,
  };

  // ===============================
  // FRONTEND VALIDATION → SCROLL
  // ===============================
  if (!data.full_name) {
    scrollToField(full_name, null, "Họ tên là bắt buộc");
    return;
  }

  if (!data.username) {
    scrollToField(
      username,
      document.getElementById("usernameHint"),
      "Username là bắt buộc",
    );
    return;
  }

  if (!data.password) {
    scrollToField(
      password,
      document.getElementById("passwordConfirmHint"),
      "Mật khẩu là bắt buộc",
    );
    return;
  }

  if (password_confirm.value !== password.value) {
    scrollToField(
      password_confirm,
      document.getElementById("passwordConfirmHint"),
      "Mật khẩu nhập lại không khớp",
    );
    return;
  }

  // chuẩn hóa họ tên
  data.full_name = formatFullName(data.full_name);

  const province = document.getElementById("province");
  const district = document.getElementById("district");
  const ward = document.getElementById("ward");
  const addressDetail = document.getElementById("address_detail");

  data.address = [
    addressDetail?.value,
    ward?.selectedOptions[0]?.text,
    district?.selectedOptions[0]?.text,
    province?.selectedOptions[0]?.text,
  ]
    .filter(Boolean)
    .join(", ");

  // ===============================
  // CALL BACKEND
  // ===============================
  const res = await authFetch(API + "/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();

    const handled = handleBackendError(err);

    if (!handled) {
      showToast(err.message || "Dữ liệu không hợp lệ", "error");
    }
    return;
  }

  showToast("🎉 Tạo tài khoản thành công", "success");
  renderUsers();
}

// =====================================================
// UTIL
// =====================================================
// =====================================================
// FORMAT FULL NAME – capitalize each word
// =====================================================
function formatFullName(value) {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// =====================================================
// TOGGLE SUBMIT BUTTON (ERROR OR EMPTY)
// =====================================================
function updateSubmitState() {
  const submitBtn = document.getElementById("submitBtn");
  if (!submitBtn) return;

  const hasError = document.querySelector('[data-error="1"]');
  const filled = isFormFilled();

  const disabled = !!hasError || !filled;

  submitBtn.disabled = disabled;
  submitBtn.classList.toggle("opacity-50", disabled);
  submitBtn.classList.toggle("cursor-not-allowed", disabled);
}
// =====================================================
// UI FEEDBACK
// =====================================================

// =====================================================
// CHECK REQUIRED FIELDS FILLED
// =====================================================
// =====================================================
// CHECK REQUIRED FIELDS FILLED (FIXED)
// =====================================================
function isFormFilled() {
  const fullName = document.getElementById("full_name");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const passwordConfirm = document.getElementById("password_confirm");

  const roleInput = document.getElementById("role_input");
  const managerInput = document.getElementById("manager_input");
  const managerWrapper = document.getElementById("managerWrapper");

  // field cơ bản
  if (
    !fullName?.value.trim() ||
    !username?.value.trim() ||
    !password?.value ||
    !passwordConfirm?.value
  ) {
    return false;
  }

  // role dùng dropdown → check dataset
  if (!roleInput?.dataset.value) {
    return false;
  }

  // manager chỉ bắt buộc khi wrapper đang hiển thị
  if (
    !managerWrapper.classList.contains("hidden") &&
    !managerInput?.dataset.value
  ) {
    return false;
  }

  return true;
}

// =====================================================
// HANDLE BACKEND ERROR → FIELD
// =====================================================
function handleBackendError(err) {
  const map = {
    WEAK_PASSWORD: () =>
      scrollToField(
        password,
        document.getElementById("passwordConfirmHint"),
        "Mật khẩu không đủ mạnh",
      ),

    USERNAME_EXISTS: () =>
      scrollToField(
        username,
        document.getElementById("usernameHint"),
        "Username đã tồn tại",
      ),
  };

  // theo error code
  if (err.error && map[err.error]) {
    map[err.error]();
    return true;
  }

  // fallback theo message
  if (err.message) {
    if (err.message.toLowerCase().includes("username")) {
      scrollToField(
        username,
        document.getElementById("usernameHint"),
        err.message,
      );
      return true;
    }

    if (err.message.toLowerCase().includes("mật khẩu")) {
      scrollToField(
        password,
        document.getElementById("passwordConfirmHint"),
        err.message,
      );
      return true;
    }
  }

  return false;
}
// =====================================================
// REMOVE VIETNAMESE TONES (sync backend)
// =====================================================
function removeVietnameseTones(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

// =====================================================
// GENERATE USERNAME FROM FULL NAME (SAFE FOR 1 WORD)
// =====================================================
function generateUsernameFromFullName(fullName) {
  const clean = removeVietnameseTones(fullName)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (!clean) return "";

  const parts = clean.split(" ");

  // chỉ 1 từ → dùng luôn
  if (parts.length === 1) {
    return parts[0];
  }

  // >= 2 từ
  const lastName = parts[parts.length - 1];
  const initials = parts
    .slice(0, -1)
    .map((p) => p[0])
    .join("");

  return `${lastName}.${initials}`;
}

// =====================================================
// RESOLVE USERNAME AVAILABLE (MIN LENGTH SAFE)
// =====================================================
async function resolveUsernameAvailable(baseUsername) {
  let username = baseUsername;
  let index = 1;

  // ===== ensure min length = 5
  if (username.length < 5) {
    username = `${baseUsername}${String(index).padStart(2, "0")}`;
    index++;
  }

  while (true) {
    const res = await authFetch(
      API + "/users/check-username?username=" + encodeURIComponent(username),
    );

    if (!res) return "";

    const data = await res.json();
    if (!data.exists) return username;

    username = `${baseUsername}${String(index).padStart(2, "0")}`;
    index++;
  }
}

// ==================================
// INIT FLATPICKR – DOB (CLEAN VERSION)
// Không can thiệp hiển thị tháng
// ==================================
function initDobPicker() {
  const input = document.getElementById("dob");
  if (!input || !window.flatpickr) return;

  // destroy instance cũ (SPA-safe)
  if (input._flatpickr) {
    input._flatpickr.destroy();
  }

  flatpickr(input, {
    dateFormat: "d/m/Y",

    // cho phép nhập tay năm
    allowInput: true,

    // tránh native picker mobile
    disableMobile: true,

    // tiếng Việt
    locale: flatpickr.l10ns.vn,

    // giữ dropdown tháng mặc định
    monthSelectorType: "dropdown",

    maxDate: "today",

    // ===============================
    // OPEN – sync dark mode
    // ===============================
    onOpen: (_, __, instance) => {
      const cal = instance.calendarContainer;
      if (!cal) return;

      document.documentElement.classList.contains("dark")
        ? cal.classList.add("dark")
        : cal.classList.remove("dark");
    },

    // ===============================
    // CLOSE – validate ngày & năm
    // ===============================
    onClose: (_, dateStr) => {
      if (!dateStr) return;

      // validate format
      const ok = /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr);
      if (!ok) {
        showToast("Ngày sinh phải theo định dạng DD/MM/YYYY", "warning");
        input.value = "";
        return;
      }

      // validate year
      const year = parseInt(dateStr.split("/")[2], 10);
      const now = new Date().getFullYear();

      if (year < 1900 || year > now) {
        showToast("Năm sinh không hợp lệ", "warning");
        input.value = "";
      }
    },
  });
}

// ==================================
// SEARCHABLE DROPDOWN CORE
// ==================================
function initSearchDropdown({ inputId, dropdownId, data }) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);

  input.addEventListener("input", () => {
    const keyword = input.value.toLowerCase().trim();
    dropdown.innerHTML = "";

    if (!keyword) {
      dropdown.classList.add("hidden");
      return;
    }

    const results = data.filter((item) =>
      item.name.toLowerCase().includes(keyword),
    );

    results.forEach((item) => {
      const div = document.createElement("div");
      div.className = "ui-dropdown-item";
      div.textContent = item.name;
      div.onclick = () => {
        input.value = item.name;
        dropdown.classList.add("hidden");
      };
      dropdown.appendChild(div);
    });

    dropdown.classList.toggle("hidden", results.length === 0);
  });

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target)) dropdown.classList.add("hidden");
  });
}
