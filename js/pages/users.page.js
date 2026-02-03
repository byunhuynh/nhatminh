import { apiFetch } from "../core/api.js";
import { showToast } from "../ui/toast.js";

const root = document.getElementById("page-content");

function render() {
  root.innerHTML = `
    <div class="ui-card p-4 space-y-4">
      <h2 class="text-lg font-bold">➕ Thêm nhân viên</h2>

      <input id="username" class="ui-input" placeholder="Username" />
      <input id="password" type="password" class="ui-input" placeholder="Mật khẩu" />
      <input id="full_name" class="ui-input" placeholder="Họ tên" />

      <select id="role" class="ui-select">
        <option value="">-- Chọn vai trò --</option>
        <option value="sales">Nhân viên</option>
        <option value="supervisor">Giám sát</option>
        <option value="director">Giám đốc</option>
      </select>

      <select id="manager" class="ui-select">
        <option value="">-- Quản lý --</option>
      </select>

      <button id="btnCreate" class="ui-btn ui-btn-primary w-full">
        Tạo tài khoản
      </button>
    </div>
  `;

  role.onchange = loadManagers;
  btnCreate.onclick = createUser;
}

async function loadManagers() {
  const roleValue = role.value;
  manager.innerHTML = `<option value="">-- Quản lý --</option>`;

  if (!roleValue) return;

  const res = await apiFetch(`/users/managers?role=${roleValue}`);
  res.forEach((m) => {
    manager.innerHTML += `<option value="${m.id}">${m.full_name}</option>`;
  });
}

async function createUser() {
  const payload = {
    username: username.value.trim(),
    password: password.value,
    full_name: full_name.value,
    role: role.value,
    manager_id: manager.value || null,
  };

  const res = await apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  showToast(res.message || "Tạo thành công");
}

/* 🔥 DÒNG QUAN TRỌNG */
render();
