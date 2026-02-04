// =====================================================
// FORM FEEDBACK – REUSABLE
// =====================================================

export function showError(input, hintEl, msg) {
  if (!input) return;

  input.dataset.error = "1";

  input.style.borderColor = "#ef4444";
  input.style.boxShadow = "0 0 0 1px #ef4444";

  if (hintEl) {
    hintEl.textContent = msg;
    hintEl.style.color = "#ef4444";
  }
}

export function showOk(input, hintEl) {
  if (!input) return;

  delete input.dataset.error;

  input.style.borderColor = "#22c55e";
  input.style.boxShadow = "0 0 0 1px #22c55e";

  if (hintEl) {
    hintEl.textContent = "✓ Hợp lệ";
    hintEl.style.color = "#22c55e";
  }

  setTimeout(() => {
    clearHint(input, hintEl);
  }, 2500);
}

export function clearHint(input, hintEl) {
  if (!input) return;

  delete input.dataset.error;

  input.style.borderColor = "";
  input.style.boxShadow = "";

  if (hintEl) {
    hintEl.textContent = "";
    hintEl.style.color = "";
  }
}

export function scrollToField(input, hintEl, msg) {
  if (!input) return;

  showError(input, hintEl, msg);

  input.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  setTimeout(() => input.focus(), 300);
}
