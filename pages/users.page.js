// =====================================================
// USERS PAGE – SPA VERSION (SAFE UX IMPROVE)
// File: Frontend/nhatminh/pages/users.page.js
// =====================================================

import { store } from "../app/store.js";
import { navigate } from "../app/router.js";

// =====================================================
// STATE
// =====================================================
let currentUser = null;
let managersCache = [];
let lastCheckedUsername = null;

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
  bindEvents();
}

// =====================================================
// RENDER PAGE
// =====================================================
function renderPage() {
  const page = document.getElementById("usersPage");

  page.innerHTML = `
    <div class="space-y-6">

      <!-- ================= THÔNG TIN CÁ NHÂN ================= -->
      <div class="ui-card">
        <div class="ui-title mb-4">🧾 Thông tin cá nhân</div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <input id="phone" class="ui-input" />
            <div id="phoneHint" class="ui-hint mt-1"></div>
          </div>

          <div>
            <label>Email</label>
            <input id="email" type="email" class="ui-input" />
            <div id="emailHint" class="ui-hint mt-1"></div>
          </div>
        </div>
      </div>

      <!-- ================= TÀI KHOẢN ================= -->
      <div class="ui-card">
        <div class="ui-title mb-4">🔐 Thông tin tài khoản</div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Username *</label>
            <input id="username" class="ui-input" />
            <div id="usernameHint" class="ui-hint mt-1"></div>
          </div>

          <div>
            <label>Mật khẩu *</label>
            <input id="password" type="password" class="ui-input" />
          </div>

          <div>
            <label>Nhập lại mật khẩu *</label>
            <input id="password_confirm" type="password" class="ui-input" />
            <div id="passwordConfirmHint" class="ui-hint mt-1"></div>
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
function bindEvents() {
  const fullName = document.getElementById("full_name");
  const username = document.getElementById("username");
  const submitBtn = document.getElementById("submitBtn");

  document.getElementById("role").addEventListener("change", onRoleChange);
  username.addEventListener("blur", checkUsername);

  // ✨ UX: chỉ generate username khi full_name thay đổi
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

    if (username.value !== data.username) {
      username.value = data.username;
      lastCheckedUsername = null;
      checkUsername();
    }
  });

  submitBtn.addEventListener("click", submitForm);
}

// =====================================================
// ROLE CHANGE → MANAGER
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

  if (currentUser.role === "supervisor" && role === "sales") {
    wrapper.classList.add("hidden");
    select.innerHTML = `<option value="${currentUser.id}" selected></option>`;
    return;
  }

  const res = await authFetch(API + `/users/managers?role=${role}`);
  if (!res || !res.ok) {
    wrapper.classList.add("hidden");
    return;
  }

  managersCache = await res.json();

  if (managersCache.length <= 1) {
    wrapper.classList.add("hidden");
    if (managersCache[0]) {
      select.innerHTML = `<option value="${managersCache[0].id}" selected></option>`;
    }
    return;
  }

  wrapper.classList.remove("hidden");
  select.innerHTML = `
    <option value="">-- chọn quản lý --</option>
    ${managersCache
      .map(
        (m) =>
          `<option value="${m.id}">
            ${m.full_name} (${roleToLabel(m.role)})
          </option>`,
      )
      .join("")}
  `;
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
// SUBMIT
// =====================================================
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
  renderUsers();
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
