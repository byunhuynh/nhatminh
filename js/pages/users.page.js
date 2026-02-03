// js/pages/users.page.js
document.addEventListener("DOMContentLoaded", async () => {
  if (!(await requireNotLowestRole())) return;

  await loadLayout(
    "users",
    `
    <div class="ui-card p-5 max-w-md mx-auto">
      <h2 class="text-lg font-semibold mb-4">➕ Tạo tài khoản</h2>
      <input id="u_username" class="ui-input mb-3" placeholder="Username">
      <input id="u_password" type="password" class="ui-input mb-3" placeholder="Mật khẩu">
      <button onclick="createUser()" class="ui-btn ui-btn-primary w-full">
        Tạo tài khoản
      </button>
    </div>
  `,
  );
});

async function createUser() {
  const username = u_username.value.trim().toLowerCase();
  const password = u_password.value;

  if (!username || !password) {
    showToast("Thiếu thông tin", "error");
    return;
  }

  const res = await authFetch(API + "/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role: "sales" }),
  });

  if (!res || !res.ok) {
    showToast("Tạo tài khoản thất bại", "error");
    return;
  }

  showToast("Tạo tài khoản thành công", "success");
  u_username.value = "";
  u_password.value = "";
}
