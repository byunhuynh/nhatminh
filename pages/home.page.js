// =====================================================
// HOME PAGE – AUTO FIT DASHBOARD GRID (SPA SAFE)
// =====================================================

import { store } from "../app/store.js";
import {
  createLineChart,
  createBarChart,
  createPercentChart,
  observeOnce,
} from "../ui/charts.js";

// =====================================================
// STATE (GLOBAL FOR HOME ONLY)
// =====================================================
let __homeClockTimer = null;
let __homeActive = false;

// =====================================================
// CLOCK
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
  dateEl.textContent = `📅 ${weekday}, ${date}`;
}

function startHomeClock() {
  if (__homeClockTimer) return;

  __homeClockTimer = setInterval(syncHomeClock, 30_000);
}

function stopHomeClock() {
  if (__homeClockTimer) {
    clearInterval(__homeClockTimer);
    __homeClockTimer = null;
  }
}

// =====================================================
// RENDER HOME
// =====================================================
export function renderHome() {
  const container = document.getElementById("page-content");
  if (!container) return;

  __homeActive = true;

  const me = store.user;

  container.innerHTML = `
    <div class="ui-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-up">

      <!-- USER INFO -->
      <div class="ui-card ui-card-glow">
        <div class="ui-title mb-4 text-center md:text-right">
          👋 Chào mừng
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex justify-center md:justify-start">
            <div class="w-full max-w-xs rounded-xl px-5 py-4 text-center space-y-2">
              <div id="home-time-icon" class="text-4xl">⏰</div>
              <div id="home-time" class="text-2xl font-semibold">--:--</div>
              <div id="home-date" class="text-sm opacity-80">--</div>
              <div id="home-weather" class="hidden text-sm opacity-90"></div>
              <div id="home-location" class="hidden text-xs opacity-70"></div>
            </div>
          </div>

          <div class="ui-text space-y-2 text-center md:text-right flex flex-col items-center md:items-end">
            <div><b>Tài khoản:</b> ${me.username}</div>
            <div><b>Họ tên:</b> ${me.full_name || "—"}</div>
            <div>
              <b>Chức vụ:</b>
              <span id="home_role"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- DASHBOARD -->
      <div class="ui-grid-auto mt-6">
        ${renderDashboardByRole(me.role)}
      </div>
    </div>
  `;

  applyRoleBadge(document.getElementById("home_role"), me.role);

  syncHomeClock();
  startHomeClock();
  initHomeWeather();
  bindChartsByRole(me.role);
}

// =====================================================
// UNMOUNT HOME (SPA CLEANUP)
// =====================================================
export function unmountHome() {
  __homeActive = false;
  stopHomeClock();
}

// =====================================================
// DASHBOARD BY ROLE (PREPARE FOR API)
// =====================================================
function renderDashboardByRole(role) {
  // TODO: replace hardcode bằng API /reports/*
  if (role === "sales") {
    return `
      <div class="ui-card ui-card-glow">
        <div class="ui-title mb-2">📦 Hoạt động cá nhân</div>
        <div class="ui-text">Chưa có dữ liệu trong kỳ này</div>
      </div>
    `;
  }

  return `
    <div class="ui-card ui-card-glow" id="revenueCard">
      <div class="ui-title mb-3">📈 Doanh thu theo tháng</div>
      <canvas id="revenueChart" height="140"></canvas>
    </div>

    <div class="ui-card ui-card-glow" id="kpiCard">
      <div class="ui-title mb-1">🎯 Hoàn thành chỉ tiêu</div>
      <canvas id="kpiChart" width="180" height="180"></canvas>
      <div class="text-center mt-3 ui-text">Đã đạt <b>78%</b> chỉ tiêu</div>
    </div>

    <div class="ui-card ui-card-glow" id="routeCard">
      <div class="ui-title mb-3">🛣️ Đơn hàng theo tuyến</div>
      <canvas id="routeChart" height="140"></canvas>
    </div>
  `;
}

// =====================================================
// CHARTS BY ROLE
// =====================================================
function bindChartsByRole(role) {
  if (role === "sales") return;

  observeOnce(document.getElementById("revenueCard"), () => {
    createLineChart(
      "revenueChart",
      ["T1", "T2", "T3", "T4", "T5", "T6"], // TODO: API
      [120, 150, 180, 140, 210, 260],
    );
  });

  observeOnce(document.getElementById("kpiCard"), () => {
    createPercentChart("kpiChart", 78);
  });

  observeOnce(document.getElementById("routeCard"), () => {
    createBarChart(
      "routeChart",
      ["Route A", "Route B", "Route C"],
      [32, 45, 28],
    );
  });
}

// =====================================================
// WEATHER (ONLY WHEN HOME ACTIVE)
// =====================================================
function initHomeWeather() {
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
        const cw = data.current_weather;

        if (cw) {
          weatherEl.textContent = `🌡️ ${Math.round(cw.temperature)}°C`;
          weatherEl.classList.remove("hidden");
        }

        const geo = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        );
        const geoData = await geo.json();
        const city =
          geoData.address?.city ||
          geoData.address?.town ||
          geoData.address?.state;

        if (city) {
          locationEl.textContent = `📍 ${city}`;
          locationEl.classList.remove("hidden");
        }
      } catch {
        // silent
      }
    },
    () => {},
    { timeout: 5000 },
  );
}

// =====================================================
// Map weather code → icon + text
// =====================================================
function mapWeatherCode(code) {
  if (code === 0) return "☀️ Nắng";
  if ([1, 2, 3].includes(code)) return "🌤️ Có mây";
  if ([45, 48].includes(code)) return "🌫️ Sương mù";
  if ([51, 53, 55, 61, 63, 65].includes(code)) return "🌧️ Mưa";
  if ([71, 73, 75].includes(code)) return "❄️ Lạnh";
  if ([95, 96, 99].includes(code)) return "⛈️ Dông";
  return "🌡️ Thời tiết";
}
