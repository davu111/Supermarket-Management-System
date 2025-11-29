import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  ShoppingCart,
  Package,
  Receipt,
  History,
  BarChart3,
  User,
  Menu,
  ArrowRightLeft,
  X,
  LogOut,
  UserStar,
  List,
  ClipboardClock,
} from "lucide-react";

// Simple Header Component
const Header = ({ currentPage = "pos", menu }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Menu Warehouse
  const warehouseMenu = [
    {
      label: "Product",
      icon: ShoppingCart,
      path: "/warehouse/products",
    },
    {
      label: "Category",
      icon: List,
      path: "/warehouse/categories",
    },
    {
      label: "Transaction",
      icon: ArrowRightLeft,
      path: "/warehouse/transactions",
    },
    {
      label: "History",
      icon: History,
      path: "/warehouse/history",
    },
  ];

  const adminMenu = [
    {
      label: "Employee",
      icon: User,
      path: "/admin/employees",
    },
    {
      label: "Report",
      icon: BarChart3,
      path: "/admin/reports",
    },
  ];

  const marketingMenu = [
    {
      label: "Customer",
      icon: UserStar,
      path: "/marketing/customers",
    },
    {
      label: "Coupon",
      icon: Receipt,
      path: "/marketing/coupons",
    },
    {
      label: "CustomerHistory",
      icon: ClipboardClock,
      path: "/marketing/customerHistory",
    },
    {
      label: "Report",
      icon: BarChart3,
      path: "/marketing/reports",
    },
  ];

  const cashMenu = [
    {
      label: "POS",
      icon: ShoppingCart,
      path: "/cash/pos",
    },
  ];

  const menuMap = {
    warehouse: warehouseMenu,
    admin: adminMenu,
    marketing: marketingMenu,
    cash: cashMenu,
  };

  const items = menuMap[menu] || [];

  const handleNavigation = (item) => {
    navigate(item.path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="py-2 bg-linear-to-br from-red-700 via-red-600 to-red-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-2">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between py-1">
          {/* Menu trái */}
          <nav className="flex gap-2">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item)}
                  className={`
                flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? "bg-white text-red-600 shadow-md"
                    : "text-white hover:bg-white/10"
                }
              `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Nút Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 text-white hover:bg-white/10 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          {/* Mobile Header */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-white">
              <ShoppingCart className="w-6 h-6" />
              <span className="font-bold text-lg">Menu</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="pb-4 space-y-2">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.label;

                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigation(item)}
                    className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
            ${
              isActive
                ? "bg-white text-red-600 shadow-md"
                : "text-white hover:bg-white/10"
            }
          `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Nút Logout Mobile */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-lg text-white hover:bg-white/10 transition"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
