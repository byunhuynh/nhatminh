// ==================================
// Create Line Chart – WOW Animation
// ==================================
export function createLineChart(canvasId, labels, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  return new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Doanh thu",
          data,
          borderWidth: 3,
          tension: 0.45,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      animation: {
        duration: 1600,
        easing: "easeOutExpo", // 🔥 rất mượt
        from: 0,
      },
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// ==================================
// Create KPI Percent Donut Chart (WOW)
// ==================================
export function createPercentChart(canvasId, percent) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const value = Math.max(0, Math.min(percent, 100));

  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Đã đạt", "Còn lại"],
      datasets: [
        {
          data: [value, 100 - value],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "75%", // donut đẹp
      animation: {
        duration: 1600,
        easing: "easeOutCubic",
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    },
    plugins: [
      {
        // ==================================
        // Draw % text in center
        // ==================================
        id: "centerText",
        afterDraw(chart) {
          const { ctx, chartArea } = chart;
          if (!chartArea) return;

          ctx.save();
          ctx.font = "600 22px system-ui";
          ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue("--text-title")
            .trim();

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          ctx.fillText(
            value + "%",
            (chartArea.left + chartArea.right) / 2,
            (chartArea.top + chartArea.bottom) / 2,
          );

          ctx.restore();
        },
      },
    ],
  });
}

// ==================================
// Create Bar Chart – WOW Stagger
// ==================================
export function createBarChart(canvasId, labels, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Số đơn",
          data,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      animation: {
        duration: 1400,
        easing: "easeOutBack",
        delay: (ctx) => ctx.dataIndex * 160, // 🔥 chạy từng cột
      },
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
// =====================================================
// Observe element & run once (SPA + short page SAFE)
// =====================================================
export function observeOnce(el, callback) {
  if (!el) return;

  let fired = false;

  const run = () => {
    if (fired) return;
    fired = true;

    // ⏳ cho layout ổn định trước
    requestAnimationFrame(() => {
      setTimeout(callback, 200); // 🔥 delay nhẹ để thấy animation
    });
  };

  // Nếu có scroll → dùng observer
  const root = document.getElementById("page-content");
  if (root && root.scrollHeight > root.clientHeight) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run();
          observer.disconnect();
        }
      },
      { root, threshold: 0.4 },
    );

    observer.observe(el);
    return;
  }

  // ❗ Trang ngắn → fallback chạy sau render
  run();
}
