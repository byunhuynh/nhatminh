// js/ui/theme.js
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
