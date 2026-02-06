// =====================================================
// SALES REPORT PAGE – DMS RECURSIVE HIERARCHY
// =====================================================
export async function renderSales() {
  const container = document.getElementById("page-content");
  container.innerHTML = `
    <div class="ui-page max-w-7xl mx-auto space-y-6 animate-fade-up">
      <h1 class="text-2xl font-black text-gradient">Báo cáo doanh số nhóm</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="statsRow">
        <!-- Stats sẽ load ở đây -->
      </div>

      <div class="ui-card p-0 overflow-hidden border-main">
        <table class="w-full text-sm text-left">
          <thead class="bg-slate-50 dark:bg-slate-800/50 text-muted uppercase text-[10px] font-bold">
            <tr>
              <th class="p-4">Ngày</th>
              <th class="p-4">Nhân viên</th>
              <th class="p-4">Mặt hàng</th>
              <th class="p-4 text-right">Doanh thu</th>
            </tr>
          </thead>
          <tbody id="salesTbody">
            <tr><td colspan="4" class="p-10 text-center ui-hint">Đang tải dữ liệu...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const res = await authFetch(API + "/reports/sales-by-subordinates");
  if (!res) return;
  const data = await res.json();

  const tbody = document.getElementById("salesTbody");
  const statsRow = document.getElementById("statsRow");

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="p-10 text-center ui-hint italic">Chưa có phát sinh doanh số từ cấp dưới</td></tr>`;
    return;
  }

  let total = 0;
  const reps = new Set();

  tbody.innerHTML = data
    .map((item) => {
      total += item.amount;
      reps.add(item.sold_by);
      return `
      <tr class="border-t border-main hover:bg-hover transition-colors">
        <td class="p-4 text-xs">${new Date(item.date).toLocaleDateString("vi-VN")}</td>
        <td class="p-4 font-bold text-sky-500">${item.sold_by}</td>
        <td class="p-4">
          <div class="font-medium">${item.product_name}</div>
          <div class="text-[10px] ui-hint">${item.category}</div>
        </td>
        <td class="p-4 text-right font-black text-orange-600">${new Intl.NumberFormat("vi-VN").format(item.amount)}đ</td>
      </tr>
    `;
    })
    .join("");

  statsRow.innerHTML = `
    <div class="ui-card bg-sky-500 text-white shadow-lg shadow-sky-500/20">
      <p class="text-[10px] uppercase font-bold opacity-80">Doanh thu nhóm</p>
      <h2 class="text-2xl font-black">${new Intl.NumberFormat("vi-VN").format(total)}đ</h2>
    </div>
    <div class="ui-card"><p class="ui-hint text-[10px] uppercase font-bold">Hoạt động</p><h2 class="text-2xl font-black">${reps.size} Nhân sự</h2></div>
    <div class="ui-card"><p class="ui-hint text-[10px] uppercase font-bold">Mặt hàng</p><h2 class="text-2xl font-black">${data.length} dòng</h2></div>
  `;
}
