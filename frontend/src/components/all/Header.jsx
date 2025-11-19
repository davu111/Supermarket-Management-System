import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Receipt,
  History,
  BarChart3,
  Settings,
  Menu,
  ArrowRightLeft,
  X,
} from "lucide-react";

// Simple Header Component
const Header = ({ currentPage = "pos", menu }) => {
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Menu Warehouse
  const warehouseMenu = [
    {
      label: "Product",
      icon: ShoppingCart,
      path: "/warehouse/products",
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

  const menuMap = {
    warehouse: warehouseMenu,
    // pos: posMenu,
  };

  const items = menuMap[menu] || [];

  const handleNavigation = (item) => {
    navigate(item.path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="bg-linear-to-br from-red-700 via-red-600 to-red-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-2">
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-2 py-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.label;

            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
