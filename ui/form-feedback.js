// =====================================================
// FORM FEEDBACK – REUSABLE
// =====================================================
// ==================================
// Feedback timers per input
// ==================================
const __feedbackTimers = new WeakMap();
export function showError(input, hintEl, msg) {
  if (!input) return;

  // ❌ hủy timer OK trước đó
  clearFeedbackTimer(input);

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

  // ❌ hủy timer cũ nếu có
  clearFeedbackTimer(input);

  delete input.dataset.error;

  input.style.borderColor = "#22c55e";
  input.style.boxShadow = "0 0 0 1px #22c55e";

  if (hintEl) {
    hintEl.textContent = "✓ Hợp lệ";
    hintEl.style.color = "#22c55e";
  }

  const timer = setTimeout(() => {
    clearHint(input, hintEl);
    __feedbackTimers.delete(input);
  }, 2500);

  __feedbackTimers.set(input, timer);
}

export function clearHint(input, hintEl) {
  if (!input) return;

  clearFeedbackTimer(input);

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

function clearFeedbackTimer(input) {
  if (__feedbackTimers.has(input)) {
    clearTimeout(__feedbackTimers.get(input));
    __feedbackTimers.delete(input);
  }
}
