// =====================================================
// HOME PAGE – PROFESSIONAL DASHBOARD (SPA SAFE)
// =====================================================

import { store } from "../app/store.js";
import {
  createLineChart,
  createBarChart,
  createPercentChart,
  observeOnce,
} from "../ui/charts.js";

let __homeClockTimer = null;
let __homeActive = false;

// =====================================================
// CLOCK LOGIC
// =====================================================
function syncHomeClock() {
  if (!__homeActive) return;
  const dateEl = document.getElementById("home-date");
  const timeEl = document.getElementById("home-time");
  const iconEl = document.getElementById("home-time-icon");
  if (!dateEl || !timeEl || !iconEl) return;

  const now = new Date();
  const hour = now.getHours();
  const weekday = now.toLocaleDateString("vi-VN", { weekday: "long" });
  const date = now.toLocaleDateString("vi-VN");
  const time = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let icon = "⏰";
  if (hour >= 5 && hour < 11) icon = "🌅";
  else if (hour < 16) icon = "☀️";
  else if (hour < 19) icon = "🌇";
  else icon = "🌙";

  iconEl.textContent = icon;
  timeEl.textContent = time;
  dateEl.textContent = `${weekday}, ${date}`;
}

// =====================================================
// RENDER HELPERS
// =====================================================
function renderStatCard(title, value, sub, icon, colorClass) {
  return `
    <div class="ui-card ui-card-glow flex items-center gap-4">
      <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colorClass} bg-opacity-10">
        <i class="fa-solid ${icon}"></i>
      </div>
      <div>
        <p class="ui-hint font-medium">${title}</p>
        <h3 class="text-xl font-bold">${value}</h3>
        <p class="text-xs text-green-500 font-medium">${sub}</p>
      </div>
    </div>
  `;
}

function renderActivityItem(user, action, time, icon) {
  return `
    <div class="flex items-start gap-3 p-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
      <div class="mt-1 text-sky-500"><i class="fa-solid ${icon}"></i></div>
      <div class="flex-1">
        <p class="ui-text text-sm"><b>${user}</b> ${action}</p>
        <span class="ui-hint text-[10px] uppercase">${time}</span>
      </div>
    </div>
  `;
}

// =====================================================
// MAIN RENDER
// =====================================================
export function renderHome() {
  const container = document.getElementById("page-content");
  if (!container) return;
  __homeActive = true;
  const me = store.user;

  container.innerHTML = `
    <div class="ui-page max-w-7xl mx-auto space-y-6 animate-fade-up">
      
      <!-- HEADER SECTION -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 ui-card ui-card-glow flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="space-y-2 text-center md:text-left">
            <h1 class="text-2xl font-bold">Chào mừng trở lại, <span class="text-gradient">${me.full_name || me.username}</span>!</h1>
            <p class="ui-text">Hệ thống Nhật Minh đã sẵn sàng. Chúc bạn một ngày làm việc hiệu quả.</p>
            <div class="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
               <span class="ui-badge ui-badge-success"><i class="fa-solid fa-shield-check mr-1"></i> Tài khoản xác thực</span>
               <span id="home_role"></span>
            </div>
          </div>
          <div class="flex flex-col items-center min-w-[140px]">
            <div id="home-time-icon" class="text-4xl mb-1 animate-bounce">⏰</div>
            <div id="home-time" class="text-3xl font-black tracking-tight">--:--</div>
            <div id="home-date" class="ui-hint font-semibold">--</div>
          </div>
        </div>

        <div class="ui-card flex flex-col justify-center items-center text-center space-y-2 bg-gradient-to-br from-sky-500/5 to-transparent">
          <div id="home-weather" class="text-2xl font-bold text-sky-500">--</div>
          <div id="home-location" class="ui-text flex items-center gap-1"><i class="fa-solid fa-location-dot"></i> Đang định vị...</div>
          <p class="ui-hint px-4 italic">Thông tin thời tiết dựa trên vị trí hiện tại của bạn.</p>
        </div>
      </section>

      <!-- QUICK STATS -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        ${renderStatCard("Doanh thu tháng", "128.5M", "+12% so với T1", "fa-money-bill-trend-up", "text-green-500 bg-green-500")}
        ${renderStatCard("Đơn hàng mới", "42", "5 đơn chờ duyệt", "fa-cart-shopping", "text-sky-500 bg-sky-500")}
        ${renderStatCard("Tuyến đường", "12/15", "Đã hoàn thành 80%", "fa-route", "text-orange-500 bg-orange-500")}
        ${renderStatCard("Khách hàng", "1,204", "+15 khách hàng mới", "fa-users", "text-purple-500 bg-purple-500")}
      </section>

      <!-- MAIN ANALYTICS -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="ui-card ui-card-glow" id="revenueCard">
          <div class="flex justify-between items-center mb-4">
            <h2 class="ui-title"><i class="fa-solid fa-chart-line mr-2 text-sky-500"></i>Doanh thu 6 tháng</h2>
            <button class="ui-hint hover:text-sky-500 transition-colors"><i class="fa-solid fa-ellipsis-vertical"></i></button>
          </div>
          <canvas id="revenueChart" height="180"></canvas>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div class="ui-card ui-card-glow flex flex-col items-center justify-center py-6" id="kpiCard">
              <h2 class="ui-title mb-4 w-full text-center">🎯 Chỉ tiêu KPI</h2>
              <div class="relative w-40 h-40">
                <canvas id="kpiChart"></canvas>
              </div>
              <p class="mt-4 ui-text text-sm">Còn <b>22%</b> để đạt mục tiêu</p>
           </div>

           <div class="ui-card ui-card-glow" id="routeCard">
              <h2 class="ui-title mb-4"><i class="fa-solid fa-truck-ramp-box mr-2 text-orange-500"></i>Sản lượng tuyến</h2>
              <canvas id="routeChart" height="240"></canvas>
           </div>
        </div>
      </section>

      <!-- RECENT ACTIVITY & SYSTEM LOGS -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 ui-card">
           <div class="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h2 class="ui-title">🚩 Hoạt động gần đây</h2>
              <a href="javascript:void(0)" class="text-xs text-sky-500 font-semibold hover:underline">Xem tất cả</a>
           </div>
           <div class="space-y-1">
              ${renderActivityItem("Nguyễn Văn Hùng", "vừa tạo đơn hàng mới #SO-9921", "2 phút trước", "fa-circle-plus")}
              ${renderActivityItem("Trần Thị Lan", "đã cập nhật trạng thái Tuyến 05", "15 phút trước", "fa-pen-to-square")}
              ${renderActivityItem("Hệ thống", "tự động đồng bộ dữ liệu tồn kho", "1 giờ trước", "fa-rotate")}
              ${renderActivityItem("Lê Minh", "vừa đăng ký khách hàng mới: Đại lý An Bình", "3 giờ trước", "fa-user-check")}
           </div>
        </div>

        <div class="ui-card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <h2 class="text-lg font-bold mb-2 text-white">Cần hỗ trợ?</h2>
          <p class="text-sm text-orange-50 opacity-90 mb-6">Liên hệ phòng kỹ thuật hoặc quản lý khu vực nếu gặp sự cố vận hành.</p>
          <div class="space-y-3">
            <a href="tel:0901234567" class="flex items-center gap-3 bg-white/20 p-3 rounded-xl hover:bg-white/30 transition-all">
              <i class="fa-solid fa-phone-volume"></i>
              <span class="text-sm font-semibold">Hotline: 090.123.4567</span>
            </a>
            <button class="w-full py-3 bg-white text-orange-600 rounded-xl font-bold shadow-lg hover:bg-orange-50 active:scale-95 transition-all">
              Gửi yêu cầu hỗ trợ
            </button>
          </div>
        </div>
      </section>

    </div>
  `;

  // Apply Role Badge
  if (window.applyRoleBadge) {
    window.applyRoleBadge(document.getElementById("home_role"), me.role);
  }

  // Start Utilities
  syncHomeClock();
  if (!__homeClockTimer) __homeClockTimer = setInterval(syncHomeClock, 30000);
  initHomeWeather();
  bindChartsByRole(me.role);
}

// =====================================================
// CHARTS BINDING
// =====================================================
function bindChartsByRole(role) {
  // Demo data logic
  observeOnce(document.getElementById("revenueCard"), () => {
    createLineChart(
      "revenueChart",
      ["Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12", "Tháng 1", "Tháng 2"],
      [95, 120, 105, 160, 140, 185],
    );
  });

  observeOnce(document.getElementById("kpiCard"), () => {
    createPercentChart("kpiChart", 78);
  });

  observeOnce(document.getElementById("routeCard"), () => {
    createBarChart(
      "routeChart",
      ["Tuyến 01", "Tuyến 03", "Tuyến 05", "Tuyến 09"],
      [45, 28, 52, 39],
    );
  });
}

// =====================================================
// WEATHER LOGIC
// =====================================================
async function initHomeWeather() {
  if (!navigator.geolocation) return;
  const weatherEl = document.getElementById("home-weather");
  const locationEl = document.getElementById("home-location");

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      if (!__homeActive) return;
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`,
        );
        const data = await res.json();
        if (data.current_weather) {
          weatherEl.textContent = `🌡️ ${Math.round(data.current_weather.temperature)}°C`;
        }
        const geo = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        );
        const geoData = await geo.json();
        const city =
          geoData.address?.city ||
          geoData.address?.town ||
          geoData.address?.state;
        if (city)
          locationEl.innerHTML = `<i class="fa-solid fa-location-dot text-sky-500"></i> ${city}`;
      } catch (e) {
        console.error("Weather error", e);
      }
    },
    null,
    { timeout: 5000 },
  );
}

export function unmountHome() {
  __homeActive = false;
  if (__homeClockTimer) {
    clearInterval(__homeClockTimer);
    __homeClockTimer = null;
  }
}
