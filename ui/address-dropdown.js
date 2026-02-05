// =====================================================
// SEARCHABLE DROPDOWN (UI ONLY)
// File: assets/js/ui/address-dropdown.js
// =====================================================

export function setupSearchDropdown({
  inputEl,
  dropdownEl,
  data = [],
  onSelect,
}) {
  if (!inputEl || !dropdownEl) return;

  let isOpen = false;

  // ===============================
  // HELPERS
  // ===============================
  function openDropdown() {
    if (isOpen) return;
    dropdownEl.classList.add("open");
    const field = inputEl.closest(".ui-field");
    field?.classList.add("dropdown-focus");
    isOpen = true;

    // Bổ sung: Cuộn nhẹ để thấy trọn vẹn dropdown nếu trang dài
    setTimeout(() => {
      dropdownEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }

  function closeDropdown() {
    if (!isOpen) return;
    dropdownEl.classList.remove("open");
    inputEl.closest(".ui-field")?.classList.remove("dropdown-focus");
    isOpen = false;
  }

  function renderList(list) {
    dropdownEl.innerHTML = "";

    if (!list || !list.length) {
      closeDropdown();
      return;
    }

    list.forEach((item) => {
      const div = document.createElement("div");
      div.className = "ui-dropdown-item";
      div.textContent = item.name;

      div.addEventListener("click", () => {
        inputEl.value = item.name;
        closeDropdown();
        onSelect?.(item);
      });

      dropdownEl.appendChild(div);
    });

    openDropdown();
  }

  // ===============================
  // EVENTS
  // ===============================

  // Focus → show all
  inputEl.addEventListener("focus", () => {
    renderList(data);
  });

  // Typing → filter
  inputEl.addEventListener("input", () => {
    const keyword = inputEl.value.trim().toLowerCase();

    const filtered = keyword
      ? data.filter((item) => item.name.toLowerCase().includes(keyword))
      : data;

    renderList(filtered);
  });

  // ESC → close
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDropdown();
      inputEl.blur();
    }
  });

  // Click outside → close
  document.addEventListener("click", (e) => {
    if (!inputEl.contains(e.target) && !dropdownEl.contains(e.target)) {
      closeDropdown();
    }
  });
}
