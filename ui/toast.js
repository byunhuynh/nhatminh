// js/ui/toast.js
function isMobile() {
  return window.innerWidth <= 640;
}

function showToast(text, type = "info") {
  const colors = {
    success: "linear-gradient(to right, #22c55e, #16a34a)", // xanh
    error: "linear-gradient(to right, #ef4444, #dc2626)", // đỏ
    info: "linear-gradient(to right, #3b82f6, #2563eb)", // xanh dương
    warning: "linear-gradient(to right, #facc15, #eab308)", // 🟡 vàng
  };

  Toastify({
    text,
    duration: 3000,
    gravity: isMobile() ? "bottom" : "top",
    position: isMobile() ? "center" : "right",
    style: {
      backgroundColor: colors[type] || colors.info,
      borderRadius: "12px",
      fontSize: "14px",
      maxWidth: "90%",
    },
  }).showToast();
}
