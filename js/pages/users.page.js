/* =========================================================
   USERS PAGE – CREATE USER
   Chuẩn theo backend /users
========================================================= */

async function renderUsersPage() {
  const root = document.getElementById("page-content");

  root.innerHTML = `
    <div class="ui-card p-5 space-y-5">
      <h1 class="text-xl font-semibold">➕ Tạo tài khoản</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label>Username *</label>
          <input id="u_username" class="ui-input" placeholder="vd: nguyenvana" />
        </div>

        <div>
          <label>Mật khẩu *</label>
          <input id="u_password" type="password" class="ui-input" />
        </div>

        <div>
          <label>Họ tên</label>
          <input id="u_fullname" class="ui-input" />
        </div>

        <div>
          <label>Email</label>
          <input id="u_email" type="email" class="ui-input" />
        </div>

        <div>
          <label>Số điện thoại</label>
          <input id="u_phone" class="ui-input" />
        </div>

        <div>
          <label>Vai trò *</label>
          <select id="u_role" class="ui-select">
            <option value="">-- Chọn vai trò --</option>
            <option value="sales">Sales</option>
            <option value="supervisor">Supervisor</option>
            <option value="director">Director</option>
          </select>
        </div>

        <div class="md:col-span-2">
          <label>Quản lý trực tiếp</label>
          <select id="u_manager" class="ui-select">
            <option value="">-- Mặc định --</option>
          </select>
        </div>

      </div>

      <div class="pt-3">
        <button onclick="createUser()" class="ui-btn ui-btn-primary w-full">
          Tạo tài khoản
        </button>
      </div>
    </div>
  `;

  bindUserEvents();
}

/* =========================================================
   EVENTS
========================================================= */

function bindUserEvents() {
  document.getElementById("u_role").addEventListener("change", (e) => {
    loadManagers(e.target.value);
  });

  document.getElementById("u_username").addEventListener("blur", checkUsername);
}

/* =========================================================
   CHECK USERNAME
========================================================= */

async function checkUsername() {
  const input = document.getElementById("u_username");
  const username = input.value.trim();

  if (!username) return;

  try {
    const res = await api.get(
      `/users/check-username?username=${encodeURIComponent(username)}`,
    );

    if (res.exists) {
      input.classList.add("error");
      toast.error("Username đã tồn tại");
    } else {
      input.classList.remove("error");
    }
  } catch {
    // ignore
  }
}

/* =========================================================
   LOAD MANAGERS
========================================================= */

async function loadManagers(role) {
  const select = document.getElementById("u_manager");
  select.innerHTML = `<option value="">-- Mặc định --</option>`;

  if (!role) return;

  try {
    const res = await api.get(`/users/managers?role=${role}`);

    res.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${m.full_name} (${m.role})`;
      select.appendChild(opt);
    });
  } catch (err) {
    toast.error("Không tải được danh sách quản lý");
  }
}

/* =========================================================
   CREATE USER
========================================================= */

async function createUser() {
  const data = {
    username: document.getElementById("u_username").value.trim(),
    password: document.getElementById("u_password").value,
    full_name: document.getElementById("u_fullname").value.trim(),
    email: document.getElementById("u_email").value.trim(),
    phone: document.getElementById("u_phone").value.trim(),
    role: document.getElementById("u_role").value,
    manager_id: document.getElementById("u_manager").value || null,
  };

  // validate tối thiểu
  if (!data.username || !data.password || !data.role) {
    toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
    return;
  }

  try {
    showLoading();
    await api.post("/users", data);
    toast.success("🎉 Tạo tài khoản thành công");

    // reset form
    document
      .querySelectorAll(
        "#u_username, #u_password, #u_fullname, #u_email, #u_phone",
      )
      .forEach((i) => (i.value = ""));

    document.getElementById("u_role").value = "";
    document.getElementById("u_manager").innerHTML =
      `<option value="">-- Mặc định --</option>`;
  } catch (err) {
    toast.error(err.message || "Không thể tạo tài khoản");
  } finally {
    hideLoading();
  }
}

/* =========================================================
   INIT
========================================================= */

renderUsersPage();
