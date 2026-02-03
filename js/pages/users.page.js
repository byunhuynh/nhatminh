// =====================================================
// USERS PAGE – CREATE USER
// File: frontend/js/pages/users.page.js
// =====================================================

// 🔐 Guard
requireLogin();
requireAdmin();

// =====================================================
// STATE
// =====================================================
let currentUser = null;
let managersCache = [];

// =====================================================
// INIT
// =====================================================
(async function initUsersPage() {
  try {
    showLoading(true);

    // Lấy user hiện tại
    currentUser = await apiGet("/me");

    renderPage();
    bindEvents();
  } catch (err) {
    console.error(err);
    showToast("Không thể tải trang users", "error");
  } finally {
    showLoading(false);
  }
})();

// =====================================================
// RENDER
// =====================================================
function renderPage() {
  const page = document.getElementById("page-content");

  page.innerHTML = `
    <div class="ui-card p-4 space-y-5">
      <h1 class="text-xl font-bold">👥 Tạo nhân viên</h1>

      <div class="grid grid-cols-1 gap-4">

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
          <label>Họ tên</label>
          <input id="full_name" class="ui-input" />
        </div>

        <div>
          <label>Số điện thoại</label>
          <input id="phone" class="ui-input" />
        </div>

        <div>
          <label>Email</label>
          <input id="email" type="email" class="ui-input" />
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

        <button id="submitBtn" class="ui-btn ui-btn-primary">
          ➕ Tạo tài khoản
        </button>

      </div>
    </div>
  `;
}

// =====================================================
// ROLE OPTIONS
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
  document.getElementById("role").addEventListener("change", onRoleChange);

  document.getElementById("username").addEventListener("blur", checkUsername);

  document.getElementById("submitBtn").addEventListener("click", submitForm);
}

// =====================================================
// ROLE CHANGE → LOAD MANAGERS
// =====================================================
async function onRoleChange(e) {
  const role = e.target.value;
  const wrapper = document.getElementById("managerWrapper");
  const select = document.getElementById("manager_id");

  select.innerHTML = "";
  managersCache = [];

  if (!role) {
    wrapper.classList.add("hidden");
    return;
  }

  // supervisor do admin tạo → không cần manager
  if (role === "director") {
    wrapper.classList.add("hidden");
    return;
  }

  wrapper.classList.remove("hidden");

  try {
    showLoading(true);
    managersCache = await apiGet(`/users/managers?role=${role}`);

    select.innerHTML = `
      <option value="">-- chọn quản lý --</option>
      ${managersCache
        .map(
          (m) =>
            `<option value="${m.id}">
              ${m.full_name} (${m.role})
            </option>`,
        )
        .join("")}
    `;
  } catch (err) {
    console.error(err);
    showToast("Không tải được danh sách quản lý", "error");
  } finally {
    showLoading(false);
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
    const res = await apiGet(`/users/check-username?username=${username}`);

    if (res.exists) {
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
// SUBMIT
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

  if (!data.username || !data.password || !data.role) {
    showToast("Vui lòng nhập đủ dữ liệu bắt buộc", "error");
    return;
  }

  try {
    showLoading(true);

    await apiPost("/users", data);

    showToast("🎉 Tạo tài khoản thành công", "success");

    // reset form
    document.querySelectorAll("input").forEach((i) => (i.value = ""));
    document.getElementById("role").value = "";
    document.getElementById("managerWrapper").classList.add("hidden");
  } catch (err) {
    console.error(err);
    showToast(err?.message || "Tạo tài khoản thất bại", "error");
  } finally {
    showLoading(false);
  }
}
