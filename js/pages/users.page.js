// =====================================================
// USERS PAGE – CREATE USER (FIXED)
// File: frontend/js/pages/users.page.js
// =====================================================
// =====================================================
// STATE
// =====================================================

let currentUser = null;
let managersCache = [];

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
// INIT
// =====================================================
async function initUsersPage() {
  try {
    const res = await authFetch(API + "/me");
    if (!res) return;
    currentUser = await res.json();

    renderPage();
    bindEvents();
  } catch (err) {
    console.error(err);
    showToast("Không thể tải trang tạo nhân viên", "error");
  }
}

// =====================================================
// RENDER
// =====================================================
// =====================================================
// RENDER
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
            <label>Họ tên</label>
            <input id="full_name" class="ui-input" />
          </div>

          <div>
            <label>Số điện thoại</label>
            <input id="phone" class="ui-input" />
          </div>

          <div class="md:col-span-2">
            <label>Email</label>
            <input id="email" type="email" class="ui-input" />
          </div>
        </div>
      </div>

      <!-- ================= THÔNG TIN TÀI KHOẢN ================= -->
      <div class="ui-card p-5">
        <h2 class="text-lg font-semibold mb-4">🔐 Thông tin tài khoản</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label>Username *</label>
            <input id="username" class="ui-input" />
            <p id="usernameHint" class="text-xs mt-1"></p>
          </div>

          <div class="relative">
            <label>Mật khẩu *</label>
            <input
              id="password"
              type="password"
              class="ui-input"
              placeholder="Nhập mật khẩu mạnh"
            />

            <!-- POPOVER -->
            <div
              id="passwordPopover"
              class="mt-2 w-full bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    rounded-lg shadow p-4"
            >
              <!-- INDICATOR -->
              <div class="flex gap-1 mb-3">
                <div class="h-2 flex-1 rounded bg-gray-200" data-bar></div>
                <div class="h-2 flex-1 rounded bg-gray-200" data-bar></div>
                <div class="h-2 flex-1 rounded bg-gray-200" data-bar></div>
                <div class="h-2 flex-1 rounded bg-gray-200" data-bar></div>
                <div class="h-2 flex-1 rounded bg-gray-200" data-bar></div>
              </div>

              <h4 class="text-sm font-semibold mb-2">Mật khẩu phải có:</h4>

              <ul class="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li data-rule="length">• Tối thiểu 8 ký tự</li>
                <li data-rule="lower">• Chữ thường (a-z)</li>
                <li data-rule="upper">• Chữ hoa (A-Z)</li>
                <li data-rule="number">• Số (0-9)</li>
                <li data-rule="special">• Ký tự đặc biệt (!@#$…)</li>
              </ul>
            </div>
          </div>


          <div>
            <label>Vai trò *</label>
            <select id="role" class="ui-select">
              ${renderRoleOptions()}
            </select>
          </div>

          <div id="managerWrapper" class="hidden">
            <label>Quản lý trực tiếp</label>
            <select id="manager_id" class="ui-select"></select>
          </div>
        </div>

        <div class="mt-5">
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
  // VN: 0 + 9 số
  return /^0\d{9}$/.test(phone);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// =====================================================
// PASSWORD STRENGTH UI (POPOVER STYLE)
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

// =====================================================
// ROLE OPTIONS (THEO QUYỀN – MAP QUA ROLE_LABELS)
// =====================================================
function renderRoleOptions() {
  const role = currentUser.role;

  // helper render option theo ROLE_LABELS
  const opt = (value) =>
    `<option value="${value}">${ROLE_LABELS[value]}</option>`;

  // admin → tạo được director, supervisor, sales
  if (role === "admin") {
    return `
      <option value="">-- chọn --</option>
      ${opt("director")}
      ${opt("supervisor")}
      ${opt("sales")}
    `;
  }

  // director → tạo được supervisor, sales
  if (role === "director") {
    return `
      <option value="">-- chọn --</option>
      ${opt("supervisor")}
      ${opt("sales")}
    `;
  }

  // supervisor → chỉ tạo được sales
  if (role === "supervisor") {
    return `
      <option value="">-- chọn --</option>
      ${opt("sales")}
    `;
  }

  // role thấp nhất → không có option
  return "";
}

// =====================================================
// PASSWORD BAR COLOR
// =====================================================
function getPasswordBarColor(score) {
  if (score <= 1) return "bg-red-500";
  if (score <= 3) return "bg-yellow-400";
  return "bg-green-500";
}

// =====================================================
// EVENTS
// =====================================================

function bindEvents() {
  const fullNameInput = document.getElementById("full_name");
  const usernameInput = document.getElementById("username");
  const roleSelect = document.getElementById("role");
  const submitBtn = document.getElementById("submitBtn");

  // ===============================
  // 1️⃣ Thay đổi role → load manager
  // ===============================
  roleSelect.addEventListener("change", onRoleChange);

  // ===============================
  // 2️⃣ Blur username → check trùng
  // ===============================
  usernameInput.addEventListener("blur", checkUsername);

  // ==================================================
  // 3️⃣ Blur HỌ TÊN
  // - Chuẩn hoá viết hoa
  // - Gọi backend generate username
  // - Auto fill username
  // ==================================================
  fullNameInput.addEventListener("blur", async (e) => {
    let value = e.target.value.trim();
    if (!value) return;

    // ✨ chuẩn hoá họ tên (viết hoa)
    const formattedName = formatFullName(value);
    e.target.value = formattedName;

    try {
      // 🔥 generate username từ backend
      const res = await authFetch(API + "/users/generate-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: formattedName }),
      });

      if (!res) return;

      const data = await res.json();

      // auto set username
      usernameInput.value = data.username;

      // check trùng lại lần nữa (an toàn)
      await checkUsername();
    } catch (err) {
      console.error(err);
      showToast("Không thể tạo username tự động", "error");
    }
  });

  const passwordInput = document.getElementById("password");
  const popover = document.getElementById("passwordPopover");
  const bars = popover.querySelectorAll("[data-bar]");
  const rules = popover.querySelectorAll("[data-rule]");

  passwordInput.addEventListener("input", () => {
    const value = passwordInput.value;
    const result = evaluatePassword(value);
    const score = passwordScore(result);
    const colorClass = getPasswordBarColor(score);

    // update bars
    bars.forEach((bar, i) => {
      bar.className =
        "h-2 flex-1 rounded " + (i < score ? colorClass : "bg-gray-200");
    });

    // update rule text
    rules.forEach((li) => {
      const rule = li.dataset.rule;
      if (result[rule]) {
        li.classList.add("text-green-600");
      } else {
        li.classList.remove("text-green-600");
      }
    });
  });

  // ===============================
  // 4️⃣ Submit form
  // ===============================
  submitBtn.addEventListener("click", submitForm);
}

// =====================================================
// ROLE CHANGE → LOAD MANAGER (FIX 403 + MAP ERROR)
// =====================================================
async function onRoleChange(e) {
  const role = e.target.value;
  const wrapper = document.getElementById("managerWrapper");
  const select = document.getElementById("manager_id");

  select.innerHTML = "";
  managersCache = [];

  // không cần manager
  if (!role || role === "director") {
    wrapper.classList.add("hidden");
    return;
  }

  // supervisor tạo sales → manager mặc định = chính mình
  if (currentUser.role === "supervisor" && role === "sales") {
    wrapper.classList.add("hidden");
    select.innerHTML = `<option value="${currentUser.id}" selected></option>`;
    return;
  }

  try {
    const res = await authFetch(API + `/users/managers?role=${role}`);
    if (!res || !res.ok) {
      wrapper.classList.add("hidden");
      return;
    }

    const data = await res.json();

    // 🛡️ đảm bảo là array
    if (!Array.isArray(data)) {
      wrapper.classList.add("hidden");
      return;
    }

    managersCache = data;

    // 0 hoặc 1 manager → auto set
    if (managersCache.length <= 1) {
      wrapper.classList.add("hidden");
      if (managersCache[0]) {
        select.innerHTML = `<option value="${managersCache[0].id}" selected></option>`;
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
// CHECK USERNAME
// =====================================================
async function checkUsername() {
  const input = document.getElementById("username");
  const hint = document.getElementById("usernameHint");
  const username = input.value.trim().toLowerCase();

  if (!username) {
    hint.textContent = "";
    input.classList.remove("error");
    return;
  }

  try {
    const res = await authFetch(
      API + `/users/check-username?username=${username}`,
    );
    if (!res) return;

    const data = await res.json();

    if (data.exists) {
      hint.textContent = "❌ Username đã tồn tại";
      hint.className = "text-xs mt-1 text-red-500";
      input.classList.add("error");
    } else {
      hint.textContent = "✅ Username hợp lệ";
      hint.className = "text-xs mt-1 text-green-600";
      input.classList.remove("error");
    }
  } catch (err) {
    console.error(err);
  }
}

// =====================================================
// SUBMIT FORM
// =====================================================
async function submitForm() {
  const data = {
    username: document.getElementById("username").value.trim(),
    password: document.getElementById("password").value,
    full_name: document.getElementById("full_name").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    role: document.getElementById("role").value,
    manager_id: document.getElementById("manager_id")?.value || null,
  };

  // chuẩn hoá họ tên trước khi submit
  if (data.full_name) {
    data.full_name = formatFullName(data.full_name);
  }

  if (!data.full_name) {
    showToast("Họ tên là bắt buộc", "error");
    document.getElementById("full_name").classList.add("error");
    return;
  }

  if (!data.username || !data.password || !data.role) {
    showToast("Vui lòng nhập đủ dữ liệu bắt buộc", "error");
    return;
  }

  // phone
  if (data.phone && !isValidPhone(data.phone)) {
    showToast("Số điện thoại không hợp lệ", "error");
    return;
  }

  // email
  if (data.email && !isValidEmail(data.email)) {
    showToast("Email không hợp lệ", "error");
    return;
  }

  // password strength
  if (passwordScore(evaluatePassword(data.password)) < 4) {
    showToast("Mật khẩu chưa đủ mạnh", "error");
    return;
  }

  try {
    const res = await authFetch(API + "/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();

      if (err.error === "WEAK_PASSWORD") {
        showToast("❌ Mật khẩu chưa đủ mạnh", "error");
        return;
      }

      throw new Error(err.message || "Lỗi tạo tài khoản");
    }

    showToast("🎉 Tạo tài khoản thành công", "success");

    // reset
    document
      .querySelectorAll("#usersPage input")
      .forEach((i) => (i.value = ""));
    document.getElementById("role").value = "";
    document.getElementById("managerWrapper").classList.add("hidden");
    document.getElementById("full_name").classList.remove("error");
  } catch (err) {
    console.error(err);
    showToast(err.message, "error");
  }
}

// =====================================================
// FORMAT FULL NAME (Viết hoa chữ cái đầu mỗi từ)
// =====================================================
function formatFullName(value) {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function removeVietnameseTones(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}
