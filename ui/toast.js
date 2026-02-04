// ==================================
// Toast helper (HEADER-AWARE + CLICK WORKING)
// ==================================

function getHeaderOffset() {
  const header = document.getElementById("header");
  if (!header) return 16;
  return Math.ceil(header.getBoundingClientRect().height + 12);
}

// ==================================
// Show toast message
// ==================================
function showToast(text, type = "info") {
  const colors = {
    success: "linear-gradient(to right, #22c55e, #16a34a)",
    error: "linear-gradient(to right, #ef4444, #dc2626)",
    info: "linear-gradient(to right, #3b82f6, #2563eb)",
    warning: "linear-gradient(to right, #facc15, #eab308)",
  };

  const toast = Toastify({
    text,
    duration: 3000,

    gravity: "top",
    position: "right",

    close: false,
    stopOnFocus: false, // ❌ không pause

    style: {
      background: colors[type] || colors.info,
      borderRadius: "12px",
      fontSize: "14px",
      maxWidth: "90%",
      marginTop: getHeaderOffset() + "px",
      color: type === "warning" ? "#1f2937" : "#fff",
      cursor: "pointer",
      userSelect: "none",
      pointerEvents: "auto", // 🔥 QUAN TRỌNG
    },
  });

  toast.showToast();

  // 🔥 SAU KHI RENDER → bind click CHUẨN
  requestAnimationFrame(() => {
    if (!toast.toastElement) return;

    toast.toastElement.addEventListener(
      "click",
      () => {
        toast.hideToast();
      },
      { once: true },
    );
  });
}

// expose global
window.showToast = showToast;
