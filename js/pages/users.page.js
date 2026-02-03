// =====================================================
// USERS PAGE – CREATE USER (FIXED)
// File: frontend/js/pages/users.page.js
// =====================================================

// =====================================================
// STATE
// =====================================================
let currentUser = null;
let managersCache = [];
let lastCheckedUsername = null; // ⬅️ thêm
// =====================================================
// BOOTSTRAP
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  bootstrapPage({
    activeTab: "users",
    requireRoleAboveSales: true,
    html: `<div id="usersPage"></div>`,
    onReady(me) {
      currentUser = me;
      renderPage();
      bindEvents();
    },
  });
});

// =====================================================
// RENDER
// =====================================================
// =====================================================
// RENDER PAGE – CLEAN UI VERSION
// =====================================================
// =====================================================
// RENDER PAGE – CLEAN UI VERSION
// =====================================================
function renderPage() {
  const page = document.getElementById("usersPage");

  page.innerHTML = `
    <div class="space-y-6">

      <!-- ================= THÔNG TIN CÁ NHÂN ================= -->
      <div class="ui-card p-5">
        <h2 class="text-lg font-semibold mb-4">🧾 Thông tin cá nhân</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label>Họ tên *</label>
            <input id="full_name" class="ui-input" />
          </div>

          <div>
            <label>Ngày sinh</label>
            <input id="dob" type="date" class="ui-input" />
          </div>

          <div>
            <label>Số điện thoại</label>
            <input id="phone" class="ui-input" placeholder="Ví dụ: 0901234567" />
            <p id="phoneHint" class="text-xs mt-1"></p>
          </div>

          <div>
            <label>Email</label>
            <input id="email" type="email" class="ui-input" placeholder="Ví dụ: ten@email.com" />
            <p id="emailHint" class="text-xs mt-1"></p>
          </div>

          <div class="md:col-span-2">
            <label>Tỉnh / Thành phố</label>
            <select id="province" class="ui-select">
              <option value="">-- chọn tỉnh / thành --</option>
            </select>
          </div>

          <div>
            <label>Quận / Huyện</label>
            <select id="district" class="ui-select" disabled>
              <option value="">-- chọn quận / huyện --</option>
            </select>
          </div>

          <div>
            <label>Phường / Xã</label>
            <select id="ward" class="ui-select" disabled>
              <option value="">-- chọn phường / xã --</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label>Địa chỉ chi tiết</label>
            <input id="address_detail" class="ui-input" placeholder="Số nhà, tên đường..." />
          </div>
        </div>
      </div>

      <!-- ================= THÔNG TIN TÀI KHOẢN ================= -->
      <div class="ui-card p-5">
        <h2 class="text-lg font-semibold mb-4">🔐 Thông tin tài khoản</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

          <!-- USERNAME -->
          <div>
            <label>Username *</label>
            <input id="username" class="ui-input" />
            <p id="usernameHint" class="text-xs mt-1"></p>
          </div>

          <!-- PASSWORD -->
          <div class="relative">
            <label>Mật khẩu *</label>
            <input
              id="password"
              type="password"
              class="ui-input"
              placeholder="Nhập mật khẩu mạnh"
            />

            <!-- PASSWORD STRENGTH POPOVER -->
            <div
              id="passwordPopover"
              class="hidden absolute left-0 top-full mt-2 w-full
                     bg-[var(--bg-card)] text-[var(--text-soft)]
                     border border-[var(--border-main)]
                     rounded-lg shadow-lg p-4 z-50"
            >
              <div class="flex gap-1 mb-3">
                <div class="h-2 flex-1 rounded bg-gray-200" data-bar></div>
                <div class="h-2 flex-1 rounded bg-gray-200" data-bar></div>
                <div class="h-2 flex-1 rounded bg-gray-200" data-bar></div>
                <div class="h-2 flex-1 rounded bg-gray-200" data-bar></div>
                <div class="h-2 flex-1 rounded bg-gray-200" data-bar></div>
              </div>

              <ul class="space-y-1 text-xs">
                <li data-rule="length">• Tối thiểu 8 ký tự</li>
                <li data-rule="lower">• Chữ thường</li>
                <li data-rule="upper">• Chữ hoa</li>
                <li data-rule="number">• Số</li>
                <li data-rule="special">• Ký tự đặc biệt</li>
              </ul>
            </div>
          </div>

          <!-- PASSWORD CONFIRM -->
          <div>
            <label>Nhập lại mật khẩu *</label>
            <input id="password_confirm" type="password" class="ui-input" />
            <p id="passwordConfirmHint" class="text-xs mt-1"></p>
          </div>

          <!-- ROLE -->
          <div>
            <label>Vai trò *</label>
            <select id="role" class="ui-select">
              ${renderRoleOptions()}
            </select>
          </div>

          <!-- MANAGER -->
          <div id="managerWrapper" class="hidden">
            <label>Quản lý trực tiếp</label>
            <select id="manager_id" class="ui-select"></select>
          </div>
        </div>

        <div class="mt-6">
          <button id="submitBtn" class="ui-btn ui-btn-primary w-full">
            ➕ Tạo tài khoản
          </button>
        </div>
      </div>
    </div>
  `;
}

// =====================================================
// VALIDATION HELPERS
// =====================================================
function isValidPhone(phone) {
  return /^0\d{9}$/.test(phone);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// =====================================================
// NORMALIZE USERNAME (MIN LENGTH = 6)
// =====================================================
function normalizeUsername(value) {
  let username = value.toLowerCase();

  if (username.length >= 6) return username;

  // thêm hậu tố 001, 002...
  const suffix = "001";
  return (username + suffix).slice(0, 50); // an toàn độ dài
}

// =====================================================
// CHECK USERNAME EXISTENCE (ONLY WHEN CHANGED)
// =====================================================
async function checkUsername() {
  const input = document.getElementById("username");
  const hint = document.getElementById("usernameHint");

  let value = input.value.trim().toLowerCase();

  if (!value) {
    clearHint(input, hint);
    lastCheckedUsername = null;
    return;
  }

  // ⬇️ chuẩn hoá độ dài
  const normalized = normalizeUsername(value);

  if (normalized !== value) {
    input.value = normalized;
    value = normalized;
  }

  // ⛔ không đổi → không check lại
  if (value === lastCheckedUsername) return;

  lastCheckedUsername = value;

  try {
    const res = await authFetch(
      API + "/users/check-username?username=" + encodeURIComponent(value),
    );
    if (!res) return;

    const data = await res.json();

    if (data.exists) {
      showError(input, hint, "❌ Username đã tồn tại");
    } else {
      showOk(input, hint);
    }
  } catch (err) {
    console.error(err);
    showError(input, hint, "❌ Không kiểm tra được username");
  }
}

// =====================================================
// PASSWORD STRENGTH
// =====================================================
function evaluatePassword(password) {
  return {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function passwordScore(result) {
  return Object.values(result).filter(Boolean).length;
}

function getPasswordBarColor(score) {
  if (score <= 1) return "bg-red-500";
  if (score <= 3) return "bg-yellow-400";
  return "bg-green-500";
}

// =====================================================
// ROLE OPTIONS
// =====================================================
function renderRoleOptions() {
  const role = currentUser.role;
  const opt = (v) => `<option value="${v}">${ROLE_LABELS[v]}</option>`;

  if (role === "admin")
    return `<option value="">-- chọn --</option>${opt("director")}${opt(
      "supervisor",
    )}${opt("sales")}`;

  if (role === "director")
    return `<option value="">-- chọn --</option>${opt("supervisor")}${opt(
      "sales",
    )}`;

  if (role === "supervisor")
    return `<option value="">-- chọn --</option>${opt("sales")}`;

  return "";
}

// =====================================================
// EVENTS
// =====================================================
function bindEvents() {
  const fullName = document.getElementById("full_name");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const confirm = document.getElementById("password_confirm");
  const popover = document.getElementById("passwordPopover");
  const submitBtn = document.getElementById("submitBtn");

  // role
  document.getElementById("role").addEventListener("change", onRoleChange);

  // username
  username.addEventListener("blur", checkUsername);

  // fullname → generate username
  fullName.addEventListener("blur", async () => {
    if (!fullName.value.trim()) return;
    fullName.value = formatFullName(fullName.value);

    const res = await authFetch(API + "/users/generate-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName.value }),
    });
    if (!res) return;

    const data = await res.json();
    username.value = data.username;
    checkUsername();
  });
  username.addEventListener("input", () => {
    lastCheckedUsername = null;
    clearHint(username, document.getElementById("usernameHint"));
  });

  // password popover
  password.addEventListener("focus", () => popover.classList.remove("hidden"));
  password.addEventListener("blur", () => popover.classList.add("hidden"));

  password.addEventListener("input", () => {
    const bars = popover.querySelectorAll("[data-bar]");
    const rules = popover.querySelectorAll("[data-rule]");
    const result = evaluatePassword(password.value);
    const score = passwordScore(result);
    const color = getPasswordBarColor(score);

    bars.forEach((b, i) => {
      b.className = "h-2 flex-1 rounded " + (i < score ? color : "bg-gray-200");
    });

    rules.forEach((li) =>
      li.classList.toggle("text-green-600", result[li.dataset.rule]),
    );
  });

  // ================= ADDRESS EVENTS =================
  loadProvinces();

  province.addEventListener("change", (e) => {
    loadDistricts(e.target.value);
  });

  district.addEventListener("change", (e) => {
    loadWards(e.target.value);
  });

  bindRealtimeValidation();
  bindPasswordConfirm();

  submitBtn.addEventListener("click", submitForm);
}
// =====================================================
// ROLE CHANGE → LOAD MANAGER (THEO ĐÚNG LOGIC BACKEND)
// =====================================================
async function onRoleChange(e) {
  const role = e.target.value;
  const wrapper = document.getElementById("managerWrapper");
  const select = document.getElementById("manager_id");

  // reset
  select.innerHTML = "";
  managersCache = [];

  // role không cần manager
  if (!role || role === "director") {
    wrapper.classList.add("hidden");
    return;
  }

  // supervisor tạo sales → manager mặc định = chính mình
  if (currentUser.role === "supervisor" && role === "sales") {
    wrapper.classList.add("hidden");
    select.innerHTML = `<option value="${currentUser.id}" selected></option>`; // =====================================================
    // CHECK USERNAME EXISTENCE
    // =====================================================
    async function checkUsername() {
      const input = document.getElementById("username");
      const hint = document.getElementById("usernameHint");

      const value = input.value.trim().toLowerCase();

      if (!value) {
        clearHint(input, hint);
        return;
      }

      try {
        const res = await authFetch(
          API + "/users/check-username?username=" + encodeURIComponent(value),
        );
        if (!res) return;

        const data = await res.json();

        if (data.exists) {
          showError(input, hint, "❌ Username đã tồn tại");
        } else {
          showOk(input, hint);
        }
      } catch (err) {
        console.error(err);
        showError(input, hint, "❌ Không kiểm tra được username");
      }
    }

    return;
  }

  try {
    const res = await authFetch(API + `/users/managers?role=${role}`);
    if (!res || !res.ok) {
      wrapper.classList.add("hidden");
      return;
    }

    const data = await res.json();

    // đảm bảo là array
    if (!Array.isArray(data)) {
      wrapper.classList.add("hidden");
      return;
    }

    managersCache = data;

    // 0 hoặc 1 manager → auto set
    if (managersCache.length <= 1) {
      wrapper.classList.add("hidden");
      if (managersCache[0]) {
        select.innerHTML = `
          <option value="${managersCache[0].id}" selected></option>
        `;
      }
      return;
    }

    // nhiều hơn 1 → cho chọn
    wrapper.classList.remove("hidden");
    select.innerHTML = `
      <option value="">-- chọn quản lý --</option>
      ${managersCache
        .map(
          (m) => `
            <option value="${m.id}">
              ${m.full_name} (${roleToLabel(m.role)})
            </option>
          `,
        )
        .join("")}
    `;
  } catch (err) {
    console.error(err);
    showToast("Không tải được danh sách quản lý", "error");
  }
}

// =====================================================
// REALTIME VALIDATION
// =====================================================
function bindRealtimeValidation() {
  const phone = document.getElementById("phone");
  const phoneHint = document.getElementById("phoneHint");
  const email = document.getElementById("email");
  const emailHint = document.getElementById("emailHint");

  phone.addEventListener("input", () => {
    if (!phone.value) return clearHint(phone, phoneHint);
    if (!isValidPhone(phone.value))
      return showError(phone, phoneHint, "❌ Số điện thoại không hợp lệ");
    showOk(phone, phoneHint);
  });

  email.addEventListener("input", () => {
    if (!email.value) return clearHint(email, emailHint);
    if (!isValidEmail(email.value))
      return showError(email, emailHint, "❌ Email không hợp lệ");
    showOk(email, emailHint);
  });
}

// =====================================================
// PASSWORD CONFIRM
// =====================================================
function bindPasswordConfirm() {
  const pwd = document.getElementById("password");
  const cf = document.getElementById("password_confirm");
  const hint = document.getElementById("passwordConfirmHint");

  cf.addEventListener("input", () => {
    if (!cf.value) return clearHint(cf, hint);
    if (cf.value !== pwd.value)
      return showError(cf, hint, "❌ Mật khẩu không khớp");
    showOk(cf, hint);
  });
}

// =====================================================
// SUBMIT
// =====================================================
function focusError(id) {
  document.getElementById(id)?.focus();
}

async function submitForm() {
  const data = {
    username: username.value.trim(),
    password: password.value,
    full_name: full_name.value,
    phone: phone.value,
    email: email.value,
    role: role.value,
    manager_id: manager_id?.value || null,
  };

  if (!data.full_name) return error("Họ tên là bắt buộc", "full_name");
  if (!data.username) return error("Username là bắt buộc", "username");
  if (!data.password) return error("Mật khẩu là bắt buộc", "password");
  if (passwordScore(evaluatePassword(data.password)) < 4)
    return error("Mật khẩu chưa đủ mạnh", "password");

  if (password_confirm.value !== password.value)
    return error("Mật khẩu nhập lại không khớp", "password_confirm");

  const res = await authFetch(API + "/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    showToast(err.message, "error");
    return;
  }

  showToast("🎉 Tạo tài khoản thành công", "success");
  resetForm();
}

// =====================================================
// UI HELPERS
// =====================================================
function showError(input, hint, msg) {
  input.classList.add("error");
  hint.textContent = msg;
  hint.className = "text-xs mt-1 text-red-500";
  input.focus();
}

function showOk(input, hint) {
  input.classList.remove("error");
  hint.textContent = "✅ Hợp lệ";
  hint.className = "text-xs mt-1 text-green-600";
  setTimeout(() => (hint.textContent = ""), 3000);
}

function clearHint(input, hint) {
  input.classList.remove("error");
  hint.textContent = "";
}

function error(msg, id) {
  showToast(msg, "error");
  focusError(id);
}

// =====================================================
// RESET
// =====================================================
function resetForm() {
  document
    .querySelectorAll("#usersPage input")
    .forEach((i) => ((i.value = ""), i.classList.remove("error")));
  document
    .querySelectorAll("#usersPage p")
    .forEach((p) => (p.textContent = ""));
  role.value = "";
  managerWrapper.classList.add("hidden");
  passwordPopover.classList.add("hidden");
}

// =====================================================
// LOAD PROVINCES API (VN)
// =====================================================
async function loadProvinces() {
  const provinceSelect = document.getElementById("province");

  const res = await fetch(`${API_PROVINCE}/p`);
  const data = await res.json();

  provinceSelect.innerHTML += data
    .map((p) => `<option value="${p.code}">${p.name}</option>`)
    .join("");
}

async function loadDistricts(provinceCode) {
  const district = document.getElementById("district");
  const ward = document.getElementById("ward");

  district.disabled = true;
  ward.disabled = true;
  district.innerHTML = `<option value="">-- chọn quận / huyện --</option>`;
  ward.innerHTML = `<option value="">-- chọn phường / xã --</option>`;

  if (!provinceCode) return;

  const res = await fetch(`${API_PROVINCE}/p/${provinceCode}?depth=2`);
  const data = await res.json();

  district.innerHTML += data.districts
    .map((d) => `<option value="${d.code}">${d.name}</option>`)
    .join("");

  district.disabled = false;
}

async function loadWards(districtCode) {
  const ward = document.getElementById("ward");
  ward.disabled = true;
  ward.innerHTML = `<option value="">-- chọn phường / xã --</option>`;

  if (!districtCode) return;

  const res = await fetch(`${API_PROVINCE}/d/${districtCode}?depth=2`);
  const data = await res.json();

  ward.innerHTML += data.wards
    .map((w) => `<option value="${w.code}">${w.name}</option>`)
    .join("");

  ward.disabled = false;
}

// =====================================================
// UTIL
// =====================================================
function formatFullName(value) {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
