// =====================================================
// SALES REPORT PAGE – DMS HIERARCHY DATA
// File: pages/sales.page.js
// =====================================================

export async function renderSales() {
  const container = document.getElementById("page-content");
  container.innerHTML = `
    <div class="ui-page max-w-7xl mx-auto space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 class="text-2xl font-black text-gradient">Báo cáo doanh số nhóm</h1>
        <button class="ui-btn ui-btn-outline" onclick="renderSales()">
          <i class="fa-solid fa-rotate mr-2"></i>Làm mới
        </button>
      </div>

      <!-- TỔNG QUAN NHANH -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="reportStats">
          <div class="ui-card bg-sky-500 text-white">
            <p class="text-xs opacity-80 uppercase font-bold">Tổng doanh thu nhóm</p>
            <h2 class="text-3xl font-black mt-1" id="totalValue">0đ</h2>
          </div>
          <div class="ui-card border-main">
            <p class="ui-hint text-xs uppercase font-bold">Tổng mặt hàng đã bán</p>
            <h2 class="text-3xl font-black mt-1" id="totalQty">0</h2>
          </div>
          <div class="ui-card border-main">
            <p class="ui-hint text-xs uppercase font-bold">Nhân viên phát sinh đơn</p>
            <h2 class="text-3xl font-black mt-1" id="activeReps">0</h2>
          </div>
      </div>

      <!-- BẢNG CHI TIẾT -->
      <div class="ui-card overflow-hidden p-0 border-main">
        <div class="p-4 border-b border-main flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h3 class="font-bold">Chi tiết bán hàng từ cấp dưới</h3>
          <i class="fa-solid fa-filter ui-hint"></i>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-100 dark:bg-slate-800 text-xs uppercase text-muted">
              <tr>
                <th class="p-4">Ngày</th>
                <th class="p-4">Nhân viên</th>
                <th class="p-4">Sản phẩm</th>
                <th class="p-4 text-center">SL</th>
                <th class="p-4 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody id="reportTableBody">
              <tr><td colspan="5" class="p-10 text-center ui-hint italic">Đang truy vấn dữ liệu đệ quy...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  loadReportData();
}

async function loadReportData() {
  const res = await authFetch(API + "/reports/sales-by-subordinates");
  if (!res) return;
  const data = await res.json();

  const body = document.getElementById("reportTableBody");

  if (data.length === 0) {
    body.innerHTML = `<tr><td colspan="5" class="p-10 text-center ui-hint italic">Chưa có dữ liệu bán hàng từ cấp dưới</td></tr>`;
    return;
  }

  let totalValue = 0;
  let totalQty = 0;
  const uniqueReps = new Set();

  body.innerHTML = data
    .map((item) => {
      totalValue += item.amount;
      totalQty += item.qty;
      uniqueReps.add(item.sold_by);

      return `
      <tr class="border-b border-main hover:bg-hover transition-colors">
        <td class="p-4 text-xs">${new Date(item.date).toLocaleDateString("vi-VN")}</td>
        <td class="p-4 font-bold text-sky-500">${item.sold_by}</td>
        <td class="p-4">
          <div class="font-medium">${item.product_name}</div>
          <div class="text-[10px] ui-hint">${item.category}</div>
        </td>
        <td class="p-4 text-center font-bold">${item.qty}</td>
        <td class="p-4 text-right font-black text-orange-500">${new Intl.NumberFormat("vi-VN").format(item.amount)}đ</td>
      </tr>
    `;
    })
    .join("");

  // Cập nhật stats
  document.getElementById("totalValue").innerText =
    new Intl.NumberFormat("vi-VN").format(totalValue) + "đ";
  document.getElementById("totalQty").innerText = totalQty;
  document.getElementById("activeReps").innerText = uniqueReps.size;
}
