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
  initDobPicker();
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
            <input
              id="full_name"
              class="ui-input"
              placeholder="vd: Nguyễn Văn A"
            />

          </div>

          <div>
            <label>Ngày sinh</label>
            <div class="relative">
              <input
                id="dob"
                type="text"
                class="ui-input cursor-pointer pr-10"
                placeholder="DD/MM/YYYY"
              />
              <span
                class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]"
              >
                📅
              </span>
            </div>
          </div>



          <div>
            <label>Số điện thoại</label>
            <input
              id="phone"
              class="ui-input"
              placeholder="vd: 0901234567"
            />

            <div id="phoneHint" class="ui-hint mt-1"></div>
          </div>

          <div>
            <label>Email</label>
            <input
              id="email"
              type="email"
              class="ui-input"
              placeholder="vd: ho_ten@example.com"
            />

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

            <div class="flex gap-2">
              <input
                id="username"
                class="ui-input flex-1"
                placeholder="vd: ten.ho"
              />

              <button
                id="regenUsernameBtn"
                type="button"
                class="ui-btn ui-btn-primary px-3"
                title="Tạo lại username"
              >
                ↻
              </button>
            </div>

            <div id="usernameHint" class="ui-hint mt-1"></div>
          </div>


          <div>
            <label>Mật khẩu *</label>
            <input
              id="password"
              type="password"
              class="ui-input"
              placeholder="Ít nhất 8 ký tự, gồm hoa, thường, số, ký tự đặc biệt"
            />

          </div>

          <!-- PASSWORD STRENGTH – FULL WIDTH -->
          <div id="passwordStrength" class="hidden md:col-span-2 mt-2">

            <!-- Strength bar -->
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

            <ul class="mt-3 space-y-1 text-sm text-muted-foreground-1">
              <li data-rule="length">❌ Ít nhất 8 ký tự</li>
              <li data-rule="lower">❌ Có chữ thường</li>
              <li data-rule="upper">❌ Có chữ hoa</li>
              <li data-rule="number">❌ Có số</li>
              <li data-rule="special">❌ Có ký tự đặc biệt</li>
            </ul>
          </div>




          <div>
            <label>Nhập lại mật khẩu *</label>
            <input
              id="password_confirm"
              type="password"
              class="ui-input"
              placeholder="Nhập lại đúng mật khẩu ở trên"
            />

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
// =====================================================
// EVENTS
// =====================================================
function bindEvents() {
  const fullName = document.getElementById("full_name");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const passwordConfirm = document.getElementById("password_confirm");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const submitBtn = document.getElementById("submitBtn");

  document.getElementById("role").addEventListener("change", onRoleChange);

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

    username.value = "⏳ đang tạo username...";
    username.disabled = true;

    const finalUsername = await resolveUsernameAvailable(baseUsername);

    username.disabled = false;

    if (finalUsername) {
      username.value = finalUsername;
      showOk(username, document.getElementById("usernameHint"));
    }
  });

  // ===============================
  // FULL NAME → REGENERATE USERNAME
  // ===============================
  fullName.addEventListener("blur", async () => {
    if (!fullName.value.trim()) {
      showError(fullName, null, "Họ tên là bắt buộc");
      return;
    }

    // format họ tên
    fullName.value = formatFullName(fullName.value);

    // nếu user đã sửa username tay → không auto
    if (usernameManuallyEdited) return;

    const baseUsername = generateUsernameFromFullName(fullName.value);
    if (!baseUsername) return;

    // UX: đang xử lý
    username.value = "⏳ đang tạo username...";
    username.disabled = true;

    const finalUsername = await resolveUsernameAvailable(baseUsername);

    username.disabled = false;

    if (!finalUsername) return;

    username.value = finalUsername;

    // show OK ngay
    showOk(username, document.getElementById("usernameHint"));
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

  submitBtn.addEventListener("click", submitForm);
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
    username: username.value.trim(),
    password: password.value,
    full_name: full_name.value,
    phone: phone.value,
    email: email.value,
    role: role.value,
    manager_id: manager_id?.value || null,
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
// INIT FLATPICKR – DOB (SPA SAFE)
// ==================================
function initDobPicker() {
  const input = document.getElementById("dob");
  if (!input || !window.flatpickr) return;

  // destroy cũ nếu render lại page
  if (input._flatpickr) {
    input._flatpickr.destroy();
  }

  flatpickr(input, {
    dateFormat: "d-m-Y",
    allowInput: false,
    disableMobile: true, // 🔥 QUAN TRỌNG
    locale: {
      firstDayOfWeek: 1,
    },
    onOpen: () => {
      // sync dark/light mỗi lần mở
      const cal = document.querySelector(".flatpickr-calendar");
      if (!cal) return;

      document.documentElement.classList.contains("dark")
        ? cal.classList.add("dark")
        : cal.classList.remove("dark");
    },
  });
}
