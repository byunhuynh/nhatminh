// ==================================
// Header navbar horizontal scroll
// ==================================
(function initNavbarScroll() {
  function bind() {
    const navList = document.querySelector(".nav__menu--header .nav__list");

    if (!navList || navList.__scrollBound) return;

    navList.__scrollBound = true;

    navList.addEventListener(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          navList.scrollLeft += e.deltaY;
        }
      },
      { passive: false },
    );
  }

  // chạy khi load lần đầu
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }

  // chạy lại khi SPA render layout
  window.addEventListener("hashchange", bind);
})();
