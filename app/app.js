// app/app.js
import { loadLayoutOnce } from "../layout/layout.js";
import { renderRoute } from "./router.js";
import { store } from "./store.js";

async function bootstrap() {
  const token = storage.get("access_token");
  if (!token) {
    location.replace("./login.html");
    return;
  }

  await loadLayoutOnce();

  const res = await authFetch(API + "/me");
  if (!res) return;

  store.setUser(await res.json());
  // ✅ sau khi đã có user
  // fill user info for sidenav
  window.fillSidenavUserInfo?.();

  // ===============================
  // Show login success
  // ===============================
  if (localStorage.getItem("login_notice")) {
    localStorage.removeItem("login_notice");
    showToast("🎉 Đăng nhập thành công", "success");
  }

  renderRoute();
}

bootstrap();
