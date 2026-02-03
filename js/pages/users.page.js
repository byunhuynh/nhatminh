// =====================================================
// USERS PAGE – CREATE USER (FIXED)
// File: frontend/js/pages/users.page.js
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {
  // 🔐 chặn role thấp nhất (sales)
  if (!(await requireNotLowestRole())) return;

  // 🧱 load layout trước
  await loadLayout("users", `<div id="usersPage"></div>`);

  initUsersPage();
});

// =====================================================
// STATE
// =====================================================
let currentUser = null;
let managersCache = [];

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

          <div>
            <label>Mật khẩu *</label>
            <input id="password" type="password" class="ui-input" />
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
// ROLE OPTIONS (THEO QUYỀN)
// =====================================================
function renderRoleOptions() {
  const role = currentUser.role;

  if (role === "admin") {
    return `
      <option value="">-- chọn --</option>
      <option value="director">Director</option>
      <option value="supervisor">Supervisor</option>
      <option value="sales">Sales</option>
    `;
  }

  if (role === "director") {
    return `
      <option value="">-- chọn --</option>
      <option value="supervisor">Supervisor</option>
      <option value="sales">Sales</option>
    `;
  }

  if (role === "supervisor") {
    return `
      <option value="">-- chọn --</option>
      <option value="sales">Sales</option>
    `;
  }

  return "";
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

  // ===============================
  // 4️⃣ Submit form
  // ===============================
  submitBtn.addEventListener("click", submitForm);
}

// =====================================================
// ROLE CHANGE → LOAD MANAGER
// =====================================================
async function onRoleChange(e) {
  const role = e.target.value;
  const wrapper = document.getElementById("managerWrapper");
  const select = document.getElementById("manager_id");

  select.innerHTML = "";
  managersCache = [];

  if (!role || role === "director") {
    wrapper.classList.add("hidden");
    return;
  }

  try {
    const res = await authFetch(API + `/users/managers?role=${role}`);
    if (!res) return;

    managersCache = await res.json();

    // 🔥 chỉ có 0 hoặc 1 manager → auto set
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
          (m) =>
            `<option value="${m.id}">
              ${m.full_name || m.username} (${m.role})
            </option>`,
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

  try {
    const res = await authFetch(API + "/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
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
