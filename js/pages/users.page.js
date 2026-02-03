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
    showLoading(true);

    const res = await authFetch(API + "/me");
    if (!res) return;
    currentUser = await res.json();

    renderPage();
    bindEvents();
  } catch (err) {
    console.error(err);
    showToast("Không thể tải trang tạo nhân viên", "error");
  } finally {
    showLoading(false);
  }
}

// =====================================================
// RENDER
// =====================================================
function renderPage() {
  const page = document.getElementById("usersPage");

  page.innerHTML = `
    <div class="ui-card p-5 space-y-5">
      <h1 class="text-xl font-semibold">👥 Tạo nhân viên</h1>

      <div class="grid grid-cols-1 gap-4 text-sm">

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

        <button id="submitBtn" class="ui-btn ui-btn-primary mt-2">
          ➕ Tạo tài khoản
        </button>
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
  document.getElementById("role").addEventListener("change", onRoleChange);
  document.getElementById("username").addEventListener("blur", checkUsername);
  document.getElementById("submitBtn").addEventListener("click", submitForm);
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

  wrapper.classList.remove("hidden");

  try {
    showLoading(true);

    const res = await authFetch(API + `/users/managers?role=${role}`);
    if (!res) return;

    managersCache = await res.json();

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

  if (!data.username || !data.password || !data.role) {
    showToast("Vui lòng nhập đủ dữ liệu bắt buộc", "error");
    return;
  }

  try {
    showLoading(true);

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
  } catch (err) {
    console.error(err);
    showToast(err.message, "error");
  } finally {
    showLoading(false);
  }
}
