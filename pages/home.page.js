// =====================================================
// HOME PAGE – AUTO FIT DASHBOARD GRID
// =====================================================

import { store } from "../app/store.js";
import {
  createLineChart,
  createBarChart,
  createPercentChart,
  observeOnce,
} from "../ui/charts.js";

// =====================================================
// Render Home Page
// =====================================================
export function renderHome() {
  const container = document.getElementById("page-content");
  if (!container) return;

  const me = store.user;

  container.innerHTML = `
    <div class="ui-page max-w-7xl mx-auto">

      <!-- ================= USER INFO ================= -->
      <div class="ui-card">
        <div class="ui-title mb-4">👋 Chào mừng</div>

        <div class="ui-text space-y-2">
          <div><b>Tài khoản:</b> ${me.username}</div>
          <div><b>Họ tên:</b> ${me.full_name || "—"}</div>
          <div>
            <b>Chức vụ:</b>
            <span id="home_role"></span>
          </div>
        </div>
      </div>

      <!-- ================= DASHBOARD (AUTO FIT GRID) ================= -->
      <div class="ui-grid-auto">

        <!-- Revenue -->
        <div class="ui-card" id="revenueCard">
          <div class="ui-title mb-3">📈 Doanh thu theo tháng</div>
          <canvas id="revenueChart" height="140"></canvas>
        </div>

        <!-- KPI -->
        <div class="ui-card" id="kpiCard">
          <div class="ui-title mb-1">🎯 Hoàn thành chỉ tiêu</div>
          <div class="ui-hint mb-3">Doanh thu / kế hoạch tháng</div>

          <div class="flex items-center justify-center">
            <canvas id="kpiChart" width="180" height="180"></canvas>
          </div>

          <div class="text-center mt-3 ui-text">
            Đã đạt <b>78%</b> chỉ tiêu
          </div>
        </div>

        <!-- Route -->
        <div class="ui-card" id="routeCard">
          <div class="ui-title mb-3">🛣️ Đơn hàng theo tuyến</div>
          <canvas id="routeChart" height="140"></canvas>
        </div>

      </div>
    </div>
  `;

  applyRoleBadge(document.getElementById("home_role"), me.role);
  bindChartAnimations();
}

// =====================================================
// Animate charts when scroll to view (SPA SAFE)
// =====================================================
function bindChartAnimations() {
  observeOnce(document.getElementById("revenueCard"), () => {
    createLineChart(
      "revenueChart",
      ["T1", "T2", "T3", "T4", "T5", "T6"],
      [120, 150, 180, 140, 210, 260],
    );
  });

  observeOnce(document.getElementById("kpiCard"), () => {
    createPercentChart("kpiChart", 78);
  });

  observeOnce(document.getElementById("routeCard"), () => {
    createBarChart(
      "routeChart",
      ["Route A", "Route B", "Route C", "Route D"],
      [32, 45, 28, 52],
    );
  });
}

