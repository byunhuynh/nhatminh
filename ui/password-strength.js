// =====================================================
// PASSWORD RULE – SYNC BACKEND
// =====================================================
export function isStrongPassword(pw) {
  if (!pw || pw.length < 8) return false;
  if (!/[a-z]/.test(pw)) return false;
  if (!/[A-Z]/.test(pw)) return false;
  if (!/\d/.test(pw)) return false;
  if (!/[^A-Za-z0-9]/.test(pw)) return false;
  return true;
}

// =====================================================
// PASSWORD STRENGTH UI
// container: element chứa block strength
// input: input password
// =====================================================
export function bindPasswordStrength(input, container) {
  if (!input || !container) return;

  const bars = container.querySelectorAll("[data-bar]");
  const levelText = container.querySelector("#passwordLevel");

  input.addEventListener("focus", () => {
    container.classList.remove("hidden");
  });

  input.addEventListener("blur", () => {
    container.classList.add("hidden");
  });

  input.addEventListener("input", () => {
    const pw = input.value;

    const rules = {
      length: pw.length >= 8,
      lower: /[a-z]/.test(pw),
      upper: /[A-Z]/.test(pw),
      number: /\d/.test(pw),
      special: /[^A-Za-z0-9]/.test(pw),
    };

    // update rule text
    Object.entries(rules).forEach(([key, ok]) => {
      const li = container.querySelector(`[data-rule="${key}"]`);
      if (!li) return;
      li.textContent = (ok ? "✔️ " : "❌ ") + li.textContent.slice(2);
      li.classList.toggle("text-green-500", ok);
      li.classList.toggle("text-red-500", !ok);
    });

    const score = Object.values(rules).filter(Boolean).length;

    const levels = [
      "Empty",
      "Weak",
      "Medium",
      "Strong",
      "Very Strong",
      "Super Strong",
    ];

    levelText.textContent = levels[score];
    levelText.className =
      "font-semibold " +
      (score >= 4
        ? "text-green-500"
        : score >= 2
          ? "text-yellow-500"
          : "text-red-500");

    bars.forEach((bar, i) => {
      bar.className =
        "h-2 flex-1 rounded " +
        (i < score
          ? score >= 4
            ? "bg-green-500"
            : score >= 2
              ? "bg-yellow-400"
              : "bg-red-400"
          : "bg-slate-200");
    });
  });
}
