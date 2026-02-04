import {
  bindPasswordStrength,
  isStrongPassword,
} from "../ui/password-strength.js";

import {
  showError,
  showOk,
  clearHint,
  scrollToField,
} from "../ui/form-feedback.js";

// =====================================================
// CHANGE PASSWORD PAGE
// =====================================================
export function renderChangePassword() {
  const root = document.getElementById("page-content");
  if (!root) return;

  root.innerHTML = `
    <div class="ui-page max-w-md mx-auto">
      <div class="ui-card">
        <h2 class="ui-title mb-4">🔐 Đổi mật khẩu</h2>

        <form id="changePasswordForm" class="space-y-4">
          <div class="ui-field">
            <label class="ui-label">Mật khẩu hiện tại</label>
            <input
              type="password"
              name="current_password"
              class="ui-input"
              required
              autocomplete="current-password"
            />
          </div>

          <div class="ui-field">
            <label class="ui-label">Mật khẩu mới</label>
            <input
                type="password"
                name="new_password"
                id="new_password"
                class="ui-input"
                required
                autocomplete="new-password"
                placeholder="Ít nhất 8 ký tự, gồm hoa, thường, số, ký tự đặc biệt"
            />
            </div>

            <!-- PASSWORD STRENGTH -->
            <div id="passwordStrength" class="hidden mt-2">
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

            <ul class="mt-3 space-y-1 text-sm">
                <li data-rule="length">❌ Ít nhất 8 ký tự</li>
                <li data-rule="lower">❌ Có chữ thường</li>
                <li data-rule="upper">❌ Có chữ hoa</li>
                <li data-rule="number">❌ Có số</li>
                <li data-rule="special">❌ Có ký tự đặc biệt</li>
            </ul>
            </div>


          <div class="ui-field">
            <label class="ui-label">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              name="confirm_password"
              class="ui-input"
              required
              autocomplete="new-password"
              placeholder="Nhập lại đúng mật khẩu ở trên"
            />
          </div>

          <div class="flex gap-2 pt-2">
            <button id="submitBtn" class="ui-btn ui-btn-primary w-full">
              Cập nhật mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  bindChangePasswordForm();
  // 🔥 bind password strength (REUSE)
  const pwInput = document.getElementById("new_password");
  const strengthBox = document.getElementById("passwordStrength");
  bindPasswordStrength(pwInput, strengthBox);
}
// =====================================================
// HANDLE CHANGE PASSWORD FORM
// =====================================================
function bindChangePasswordForm() {
  const form = document.getElementById("changePasswordForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = form.current_password.value.trim();
    const newPassword = form.new_password.value.trim();
    const confirmPassword = form.confirm_password.value.trim();

    if (newPassword !== confirmPassword) {
      showError(confirmInput, hintEl, "Mật khẩu xác nhận không khớp");
      return;
    }

    if (!isStrongPassword(newPassword)) {
      scrollToField(
        document.getElementById("new_password"),
        null,
        "Mật khẩu mới không đủ mạnh",
      );
      return;
    }

    if (newPassword.length < 8) {
      showToast("Mật khẩu mới phải tối thiểu 8 ký tự", "error");
      return;
    }

    try {
      const res = await api.post("/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.message || "Đổi mật khẩu thất bại", "error");
        return;
      }

      showToast("Đổi mật khẩu thành công", "success");

      // reset form
      form.reset();

      // quay về profile nếu muốn
      location.hash = "#/profile";
    } catch (err) {
      showToast("Không thể kết nối server", "error");
    }
  });
}
