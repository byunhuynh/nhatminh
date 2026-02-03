// ==================================
// Theme Toggle Animation (Shared)
// File: Frontend/nhatminh/ui/theme.anim.js
// ==================================

(function () {
  // ==================================
  // Bind animation for #themeToggle
  // ==================================
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#themeToggle");
    if (!btn) return;

    const isDark = document.documentElement.classList.contains("dark");

    // clear state cũ
    btn.classList.remove("rotate-cw", "rotate-ccw", "ripple");

    // force reflow để animation luôn chạy lại
    void btn.offsetWidth;

    // hướng xoay
    btn.classList.add(isDark ? "rotate-ccw" : "rotate-cw");

    // ripple
    btn.classList.add("ripple");

    // cleanup
    setTimeout(() => {
      btn.classList.remove("rotate-cw", "rotate-ccw", "ripple");
    }, 600);
  });
})();
