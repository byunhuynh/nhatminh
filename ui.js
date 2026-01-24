// ===== THEME =====
function applyTheme() {
  if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
     window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  }
}

function updateThemeIcon() {
  const icon = document.getElementById("themeIcon");
  if (!icon) return;

  icon.textContent =
    document.documentElement.classList.contains("dark")
      ? "☀️"
      : "🌙";
}

function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
  localStorage.theme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
  updateThemeIcon();
}

// ===== TOAST =====
function isMobile() {
  return window.innerWidth <= 640;
}

function showToast(text, type = "info") {
  const colors = {
    success: "linear-gradient(to right, #22c55e, #16a34a)",
    error: "linear-gradient(to right, #ef4444, #dc2626)",
    info: "linear-gradient(to right, #3b82f6, #2563eb)"
  };

  Toastify({
    text,
    duration: 3000,
    gravity: isMobile() ? "bottom" : "top",
    position: isMobile() ? "center" : "right",
    backgroundColor: colors[type] || colors.info,
    style: {
      borderRadius: "12px",
      fontSize: "14px",
      maxWidth: "90%"
    }
  }).showToast();
}

// ===== INIT UI =====
document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
  updateThemeIcon();
});

// ===== ROLE LABEL & BADGE =====
const ROLE_LABELS = {
  sales: "Nhân viên kinh doanh",
  supervisor: "Giám sát kinh doanh",
  director: "Giám đốc kinh doanh",
  admin: "Quản trị hệ thống"
};

const ROLE_BADGE_CLASS = {
  sales: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  supervisor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
  director: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
  admin: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
};

function roleToLabel(role) {
  return ROLE_LABELS[role] || role;
}

function applyRoleBadge(el, role) {
  el.textContent = roleToLabel(role);
  el.className = `
    inline-block px-2 py-1 rounded
    text-xs font-semibold
    ${ROLE_BADGE_CLASS[role] || ""}
  `;
}

// ===================================================
// 🔥 GLOBAL LOADING – API BASED (CHUẨN)
// ===================================================

function ensureGlobalLoading() {
  let el = document.getElementById("globalLoading");
  if (el) return el;

  el = document.createElement("div");
  el.id = "globalLoading";
  el.className = `
    fixed inset-0 z-[9999]
    bg-white/70 dark:bg-gray-900/70
    backdrop-blur
    flex items-center justify-center
    text-gray-700 dark:text-gray-200
  `;
  el.innerHTML = `
    <div class="flex flex-col items-center gap-3">
      <div class="animate-spin rounded-full h-10 w-10
                  border-4 border-blue-500 border-t-transparent"></div>
      <div class="text-sm font-medium">Đang tải dữ liệu…</div>
    </div>
  `;

  document.body.appendChild(el);
  return el;
}

function showGlobalLoading() {
  const el = ensureGlobalLoading();
  el.classList.remove("hidden");
}

function hideGlobalLoading() {
  const el = document.getElementById("globalLoading");
  if (el) el.classList.add("hidden");
}

let __API_LOADING_COUNT__ = 0;

function apiLoadingStart() {
  __API_LOADING_COUNT__++;
  showGlobalLoading();
}

function apiLoadingEnd() {
  __API_LOADING_COUNT__ = Math.max(0, __API_LOADING_COUNT__ - 1);
  if (__API_LOADING_COUNT__ === 0) {
    hideGlobalLoading();
  }
}
