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
    document.documentElement.classList.remove("dark");
  }
}

// ==================================
// Update theme toggle icon (Font Awesome)
// ==================================
function updateThemeIcon() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const isDark = document.documentElement.classList.contains("dark");

  btn.innerHTML = isDark
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

// ==================================
// Toggle dark / light mode
// ==================================
function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");

  localStorage.theme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";

  updateThemeIcon();
}

// ==================================
// Init on DOM ready
// ==================================
document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
  updateThemeIcon();
});
