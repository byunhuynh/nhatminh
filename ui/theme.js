// js/ui/theme.js
// ==================================
// Apply theme on load
// Default: LIGHT if first visit
// ==================================
function applyTheme() {
  const theme = localStorage.getItem("theme");

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    // mặc định hoặc theme === "light"
    document.documentElement.classList.remove("dark");
  }
}

function updateThemeIcon() {
  const btn = document.getElementById("themeToggle");

  if (!btn) return;
  btn.textContent = document.documentElement.classList.contains("dark")
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

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
  updateThemeIcon();
});
