// ==================================
// MENU CONFIG – SINGLE SOURCE OF TRUTH
// ==================================
// assets/js/menu.config.js
export const MENU_ITEMS = [
  {
    key: "home",
    path: "/",
    href: "#/",
    label: "Trang chủ",
    icon: "fa-house",
  },
  {
    key: "sales",
    path: "/sales",
    href: "#/sales",
    label: "Bán hàng",
    icon: "fa-cart-shopping",
  },
  {
    key: "users",
    path: "/users",
    href: "#/users",
    label: "Thêm nhân viên",
    icon: "fa-user-plus",
  },
  {
    key: "profile",
    path: "/profile",
    href: "#/profile",
    label: "Tài khoản",
    icon: "fa-user",
  },

  // ================================
  // ĐỔI MẬT KHẨU
  // ================================
  {
    key: "change-password",
    path: "/change-password",
    href: "#/change-password",
    label: "Đổi mật khẩu",
    icon: "fa-key",
  },
];
