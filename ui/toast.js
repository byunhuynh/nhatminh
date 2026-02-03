// ==================================
// Toast helper
// ==================================
function isMobile() {
  return window.innerWidth <= 640;
}

// ==================================
// Show toast message
// type: success | error | info | warning
// ==================================
function showToast(text, type = "info") {
  const colors = {
    success: "linear-gradient(to right, #22c55e, #16a34a)",
    error: "linear-gradient(to right, #ef4444, #dc2626)",
    info: "linear-gradient(to right, #3b82f6, #2563eb)",
    warning: "linear-gradient(to right, #facc15, #eab308)",
  };

  Toastify({
    text,
    duration: 3000,
    gravity: "top", // ✅ LUÔN TRÊN
    position: "right", // desktop
    style: {
      background: colors[type] || colors.info,
      borderRadius: "12px",
      fontSize: "14px",
      maxWidth: "90%",
      marginTop: isMobile() ? "12px" : "16px", // tránh sát header
      color: type === "warning" ? "#1f2937" : "#fff",
    },
  }).showToast();
}
