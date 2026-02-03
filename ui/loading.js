// js/ui/loading.js
let __API_LOADING_COUNT__ = 0;

function ensureGlobalLoading() {
  let el = document.getElementById("globalLoading");
  if (el) return el;

  el = document.createElement("div");
  el.id = "globalLoading";
  el.className = "hidden";
  el.innerHTML = `
    <div class="flex flex-col items-center gap-3">
      <div class="animate-spin rounded-full h-10 w-10
        border-4 border-blue-500 border-t-transparent"></div>
      <div class="text-sm font-medium">Đang tải dữ liệu…</div>
    </div>
  `;
  document.body.appendChild(el);
  return el;
}

function apiLoadingStart() {
  __API_LOADING_COUNT__++;
  ensureGlobalLoading().classList.remove("hidden");
}

function apiLoadingEnd() {
  __API_LOADING_COUNT__ = Math.max(0, __API_LOADING_COUNT__ - 1);
  if (__API_LOADING_COUNT__ === 0) {
    const el = document.getElementById("globalLoading");
    if (el) el.classList.add("hidden");
  }
}
