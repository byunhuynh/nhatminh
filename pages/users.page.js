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

      <!-- ================= THÔNG TIN CÁ NHÂN ================= -->
      <div class="ui-card ui-card-glow">
        <div class="ui-title mb-4 flex items-center gap-2">
          <i class="fa-solid fa-id-card"></i>
          <span>Thông tin cá nhân</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- HỌ TÊN -->
          <div>
            <label>Họ tên *</label>
            <div class="ui-input-icon">
              <i class="fa-solid fa-user"></i>
              <input
                id="full_name"
                class="ui-input"
                autocapitalize="words"
                placeholder="vd: Nguyễn Văn A"
              />
            </div>
          </div>
         
          <div class="ui-field relative">
            <label>Giới tính *</label>
            <div class="ui-input-icon">
              <i class="fa-solid fa-venus-mars"></i>
              <input id="gender_input" class="ui-input" placeholder="Chọn giới tính" readonly />
              <i class="fa-solid fa-caret-down ui-dropdown-indicator"></i>
            </div>
            <div id="gender_dropdown" class="ui-search-dropdown"></div>
          </div>

          <!-- NGÀY SINH -->
          <div>
            <label>Ngày sinh</label>
            <div class="ui-input-icon">
              <i class="fa-regular fa-calendar"></i>
              <input
                id="dob"
                type="text"
                class="ui-input cursor-pointer"
                placeholder="DD/MM/YYYY"
                autocomplete="off"
              />
            </div>
          </div>
          
          <div>
            <label>Số CCCD *</label>
            <div class="ui-input-icon">
              <i class="fa-solid fa-id-card-clip"></i>
              <input id="identity_card" class="ui-input" placeholder="Nhập 12 số CCCD" maxlength="12" />
            </div>
          </div>

          <!-- ĐIỆN THOẠI -->
          <div>
            <label>Số điện thoại</label>
            <div class="ui-input-icon">
              <i class="fa-solid fa-phone"></i>
              <input
                id="phone"
                class="ui-input"
                placeholder="vd: 0901234567"
              />
            </div>
            <div id="phoneHint" class="ui-hint mt-1"></div>
          </div>

          <!-- EMAIL -->
          <div>
            <label>Email</label>
            <div class="ui-input-icon">
              <i class="fa-solid fa-envelope"></i>
              <input
                id="email"
                type="email"
                class="ui-input"
                placeholder="vd: nguyenvana@example.com"
              />
            </div>
            <div id="emailHint" class="ui-hint mt-1"></div>
          </div>
          <!-- ================= ĐỊA CHỈ ================= -->
          <div class="md:col-span-2">
            <label class="mb-2 block">Địa chỉ</label>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">

              <!-- ============ TỈNH / THÀNH ============ -->
              <div class="ui-field relative">
                <div class="ui-input-icon">
                  <i class="fa-solid fa-map-location-dot"></i> <!-- Icon trái -->
                  <input id="province_input" class="ui-input" placeholder="Tỉnh / Thành" autocomplete="off" />
                  <i class="fa-solid fa-caret-down ui-dropdown-indicator"></i> <!-- 🔥 Icon phải mới -->
                </div>
                <div id="province_dropdown" class="ui-search-dropdown"></div>
              </div>

              <!-- ============ QUẬN / HUYỆN ============ -->
              <div class="ui-field relative">
                <div class="ui-input-icon">
                  <i class="fa-solid fa-map"></i>
                  <input id="district_input" class="ui-input" placeholder="Quận / Huyện" autocomplete="off" disabled />
                  <i class="fa-solid fa-caret-down ui-dropdown-indicator"></i> <!-- 🔥 Icon phải mới -->
                </div>
                <div id="district_dropdown" class="ui-search-dropdown"></div>
              </div>

              <!-- ============ PHƯỜNG / XÃ ============ -->
              <div class="ui-field relative">
                <div class="ui-input-icon">
                  <i class="fa-solid fa-location-dot"></i>
                  <input id="ward_input" class="ui-input" placeholder="Phường / Xã" autocomplete="off" disabled />
                  <i class="fa-solid fa-caret-down ui-dropdown-indicator"></i> <!-- 🔥 Icon phải mới -->
                </div>
                <div id="ward_dropdown" class="ui-search-dropdown"></div>
              </div>

            </div>

            <!-- ============ ĐỊA CHỈ CHI TIẾT ============ -->
            <div class="ui-field mt-4">
              <div class="ui-input-icon">
                <i class="fa-solid fa-house"></i>
                <input
                  id="address_detail"
                  class="ui-input"
                  placeholder="Số nhà, tên đường..."
                />
              </div>
            </div>
          </div>



        </div>
      </div>

      <!-- ================= TÀI KHOẢN ================= -->
      <div class="ui-card ui-card-glow">
        <div class="ui-title mb-4 flex items-center gap-2">
          <i class="fa-solid fa-user-lock"></i>
          <span>Thông tin tài khoản</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- USERNAME -->
          <div>
            <label>Username *</label>

            <div class="ui-input-icon ui-input-password">
              <!-- icon trái -->
              <i class="fa-solid fa-at"></i>

              <input
                id="username"
                class="ui-input"
                placeholder="vd: a.nv001"
              />

              <!-- icon phải: regenerate -->
              <button
                id="regenUsernameBtn"
                type="button"
                class="ui-password-toggle"
                title="Tạo lại username"
              >
                <i class="fa-solid fa-rotate"></i>
              </button>
            </div>

            <div id="usernameHint" class="ui-hint mt-1"></div>
          </div>


          <!-- PASSWORD -->
          <div>
            <label>Mật khẩu *</label>
            <div class="ui-input-icon ui-input-password">
              <i class="fa-solid fa-lock"></i>
              <input
                id="password"
                type="password"
                class="ui-input"
                placeholder="Ít nhất 8 ký tự"
              />
            </div>
          </div>

          <!-- PASSWORD STRENGTH -->
          <div id="passwordStrength" class="hidden md:col-span-2 mt-2">
            <div class="flex gap-1">
              <div class="h-2 flex-1 rounded bg-slate-200" data-bar></div>
              <div class="h-2 flex-1 rounded bg-slate-200" data-bar></div>
              <div class="h-2 flex-1 rounded bg-slate-200" data-bar></div>
              <div class="h-2 flex-1 rounded bg-slate-200" data-bar></div>
              <div class="h-2 flex-1 rounded bg-slate-200" data-bar></div>
            </div>
            <div class="mt-2 text-sm">
              Level:
              <span id="passwordLevel" class="font-semibold">Empty</span>
            </div>
            <ul class="mt-3 space-y-1 text-sm">
              <li data-rule="length">❌ Ít nhất 8 ký tự</li>
              <li data-rule="lower">❌ Có chữ thường</li>
              <li data-rule="upper">❌ Có chữ hoa</li>
              <li data-rule="number">❌ Có số</li>
              <li data-rule="special">❌ Có ký tự đặc biệt</li>
            </ul>
          </div>

          <!-- CONFIRM PASSWORD -->
          <div>
            <label>Nhập lại mật khẩu *</label>
            <div class="ui-input-icon">
              <i class="fa-solid fa-shield-keyhole"></i>
              <input
                id="password_confirm"
                type="password"
                class="ui-input"
                placeholder="Nhập lại mật khẩu"
              />
            </div>
            <div id="passwordConfirmHint" class="ui-hint mt-1"></div>
          </div>

          
          <div class="ui-field relative">
            <label>Vai trò *</label>
            <div class="ui-input-icon">
              <i class="fa-solid fa-user-tag"></i>
              <input id="role_input" class="ui-input" placeholder="Chọn vai trò" readonly />
              <i class="fa-solid fa-caret-down ui-dropdown-indicator"></i>
            </div>
            <div id="role_dropdown" class="ui-search-dropdown"></div>
          </div>

          <!-- MANAGER -->
          <div id="managerWrapper" class="ui-field relative hidden">
            <label>Quản lý trực tiếp</label>
            <div class="ui-input-icon">
              <i class="fa-solid fa-user-tie"></i>
              <input id="manager_input" class="ui-input" placeholder="Chọn quản lý" readonly />
              <i class="fa-solid fa-caret-down ui-dropdown-indicator"></i>
            </div>
            <div id="manager_dropdown" class="ui-search-dropdown"></div>
          </div>

        </div>

        <div class="mt-6">
          <button
            id="submitBtn"
            class="ui-btn ui-btn-primary w-full flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-user-plus"></i>
            <span>Tạo tài khoản</span>
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
  const myRole = currentUser.role;
  const allRoles = [
    { name: "Giám đốc kinh doanh", value: "director" },
    { name: "Giám sát kinh doanh", value: "supervisor" },
    { name: "Nhân viên kinh doanh", value: "sales" },
  ];

  if (myRole === "admin") return allRoles;
  if (myRole === "director")
    return allRoles.filter((r) => r.value !== "director");
  if (myRole === "supervisor")
    return allRoles.filter((r) => r.value === "sales");
  return [];
}

// 3. Khởi tạo các dropdown trong bindEvents()
function bindCustomSelects() {
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

function bindEvents() {
  const fullName = document.getElementById("full_name");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const passwordConfirm = document.getElementById("password_confirm");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const submitBtn = document.getElementById("submitBtn");

  document.getElementById("role").addEventListener("change", onRoleChange);
  document.getElementById("identity_card").addEventListener("input", (e) => {
    const value = e.target.value;
    const hint = e.target.parentElement.nextElementSibling; // nếu bạn có hint
    if (!/^\d{12}$/.test(value)) {
      showError(e.target, null, "CCCD phải đúng 12 chữ số");
    } else {
      showOk(e.target, null);
    }
  });

  // 1. Khai báo dữ liệu mẫu
  const GENDER_DATA = [
    { name: "Nam", value: "male" },
    { name: "Nữ", value: "female" },
  ];

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

// 4. Logic xử lý Manager (thay thế onRoleChange cũ)
async function handleRoleChangeLogic(targetRole) {
  const wrapper = document.getElementById("managerWrapper");
  const mInput = document.getElementById("manager_input");
  const mDropdown = document.getElementById("manager_dropdown");
  const myRole = currentUser.role;

  mInput.value = "";
  delete mInput.dataset.value;

  // Nếu tạo Supervisor/Sales và mình là cấp trên trực tiếp (theo AI.md)
  if (
    (myRole === "director" && targetRole === "supervisor") ||
    (myRole === "supervisor" && targetRole === "sales")
  ) {
    wrapper.classList.add("hidden");
    mInput.value = currentUser.full_name;
    mInput.dataset.value = currentUser.id;
    return;
  }

  // Nếu cần chọn Manager (Admin tạo, hoặc Director tạo Sales)
  const res = await authFetch(API + `/users/managers?role=${targetRole}`);
  if (!res || !res.ok) return;

  const managers = await res.json();
  if (managers.length > 0) {
    wrapper.classList.remove("hidden");
    setupSearchDropdown({
      inputEl: mInput,
      dropdownEl: mDropdown,
      data: managers.map((m) => ({
        name: `${m.full_name} (${roleToLabel(m.role)})`,
        value: m.id,
      })),
      onSelect: (item) => {
        mInput.dataset.value = item.value;
        updateSubmitState();
      },
    });
  }
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
function isFormFilled() {
  const requiredIds = [
    "full_name",
    "username",
    "password",
    "password_confirm",
    "role",
    "manager_id",
  ];

  return requiredIds.every((id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    return el.value && el.value.trim() !== "";
  });
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
