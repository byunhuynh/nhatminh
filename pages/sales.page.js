// =====================================================
// SALES REPORT PAGE – DMS HIERARCHY
// =====================================================
export async function renderSales() {
  const container = document.getElementById("page-content");
  container.innerHTML = `
    <div class="ui-page max-w-7xl mx-auto space-y-6">
      <h1 class="text-2xl font-black text-gradient">Báo cáo doanh số nhóm</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="ui-card bg-sky-500 text-white shadow-lg shadow-sky-500/20">
          <p class="text-[10px] uppercase font-bold opacity-80">Doanh thu cấp dưới</p>
          <h2 class="text-2xl font-black" id="totalRevenue">0đ</h2>
        </div>
        <div class="ui-card">
          <p class="ui-hint text-[10px] uppercase font-bold">Số lượng hàng bán</p>
          <h2 class="text-2xl font-black" id="totalItems">0</h2>
        </div>
        <div class="ui-card">
          <p class="ui-hint text-[10px] uppercase font-bold">Nhân viên hoạt động</p>
          <h2 class="text-2xl font-black" id="activeStaff">0</h2>
        </div>
      </div>

      <div class="ui-card p-0 overflow-hidden border-main">
        <table class="w-full text-sm text-left">
          <thead class="bg-slate-50 dark:bg-slate-800/50 text-muted uppercase text-[10px]">
            <tr>
              <th class="p-4">Ngày</th>
              <th class="p-4">Nhân viên</th>
              <th class="p-4">Mặt hàng</th>
              <th class="p-4 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody id="salesTableBody">
            <tr><td colspan="4" class="p-10 text-center ui-hint">Đang tải báo cáo...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  fetchSalesReport();
}

async function fetchSalesReport() {
  const res = await authFetch(API + "/reports/sales-by-subordinates");
  if (!res || !res.ok) return;
  const data = await res.json();

  const tbody = document.getElementById("salesTableBody");
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="p-10 text-center ui-hint italic">Cấp dưới chưa có phát sinh đơn hàng</td></tr>`;
    return;
  }

  let totalRev = 0;
  let totalQty = 0;
  let staffSet = new Set();

  tbody.innerHTML = data
    .map((item) => {
      totalRev += item.amount;
      totalQty += item.qty;
      staffSet.add(item.sold_by);
      return `
      <tr class="border-t border-main hover:bg-hover transition-colors">
        <td class="p-4 text-xs">${new Date(item.date).toLocaleDateString("vi-VN")}</td>
        <td class="p-4 font-bold text-sky-500">${item.sold_by}</td>
        <td class="p-4">
          <div class="font-medium">${item.product_name}</div>
          <div class="text-[10px] ui-hint">${item.category}</div>
        </td>
        <td class="p-4 text-right font-bold text-orange-500">${new Intl.NumberFormat("vi-VN").format(item.amount)}đ</td>
      </tr>
    `;
    })
    .join("");

  document.getElementById("totalRevenue").innerText =
    new Intl.NumberFormat("vi-VN").format(totalRev) + "đ";
  document.getElementById("totalItems").innerText = totalQty;
  document.getElementById("activeStaff").innerText = staffSet.size;
}
