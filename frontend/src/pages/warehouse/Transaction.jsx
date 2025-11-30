import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import axios from "../../contexts/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TransactionWarehouse from "../../components/warehouse/TransactionWarehouse";
import Header from "../../components/all/Header";

function Transaction() {
  const [products, setProducts] = useState([]);
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [isPopUpDelete, setPopUpDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const cols = ["ID", "Name", "Quantity"];
  const colKeyMap = ["id", "name", "quantity"];

  // Lấy inventory khi warehouseId thay đổi
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/inventory/getInventory`, {
        params: { sortBy: sortConfig.key, direction: sortConfig.direction },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const actionButtons = [
    {
      label: "Import",
      icon: ArrowDownToLine,
      onClick: () => {
        setTransactionOpen(true);
        setTransactionType("IMPORT");
      },
      linear: "from-green-600 to-emerald-600",
      hoverGradient: "from-green-700 to-emerald-700",
    },
    {
      label: "Export",
      icon: ArrowUpFromLine,
      onClick: () => {
        setTransactionOpen(true);
        setTransactionType("EXPORT");
      },
      linear: "from-orange-600 to-amber-600",
      hoverGradient: "from-orange-700 to-amber-700",
    },
  ];

  return (
    <>
      <Header currentPage="Transaction" menu="warehouse" />

      {/* Control Panel */}
      <div className="p-4 bg-linear-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
          >
            {actionButtons.map((button, index) => {
              const Icon = button.icon;
              return (
                <motion.button
                  key={button.label}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={button.onClick}
                  className={`
                    relative overflow-hidden bg-linear-to-r ${button.linear}
                    text-white font-semibold rounded-lg px-4 py-3
                    shadow-lg hover:shadow-xl transition-all duration-300
                    flex items-center justify-center gap-2 group cursor-pointer
                  `}
                >
                  <div
                    className={`absolute inset-0 bg-linear-to-r ${button.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  <Icon className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10 text-sm">{button.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Table Section */}
      <div className="px-4 pb-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-gray-200"
          >
            {/* Table Header */}
            <div className="bg-linear-to-r from-red-600 to-rose-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <Package className="w-5 h-5" />
                <h2 className="text-lg font-bold">Inventory</h2>
                <span className="ml-auto bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  {products.length} items
                </span>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto max-h-[calc(90vh-200px)]">
              <table className="w-full">
                <thead className="sticky top-0 bg-linear-to-br from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    {cols.map((col, index) => {
                      const keycol = colKeyMap[index];
                      const isActive = sortConfig.key === keycol;
                      return (
                        <th
                          key={col}
                          onClick={() => handleSort(keycol)}
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer select-none group hover:bg-indigo-50 transition-colors duration-200"
                        >
                          <div className="flex items-center gap-2">
                            <span>{col}</span>
                            <ArrowUpDown
                              className={`w-4 h-4 transition-all duration-300 ${
                                isActive
                                  ? "text-indigo-600 scale-110"
                                  : "text-gray-400 group-hover:text-indigo-400"
                              } ${
                                isActive && sortConfig.direction === "desc"
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={cols.length} className="px-6 py-16">
                        <div className="flex flex-col items-center justify-center">
                          <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-3" />
                          <p className="text-gray-500 font-medium">
                            Loading inventory...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={cols.length} className="px-6 py-16">
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-linear-to-br from-indigo-100 to-purple-100 rounded-full p-6 mb-4">
                            <Package className="w-12 h-12 text-red-600" />
                          </div>
                          <p className="text-gray-500 font-medium text-lg">
                            No products found
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Add products to get started
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence>
                      {products.map((product, index) => (
                        <motion.tr
                          key={product.productId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-linear-to-r hover:from-rose-50 hover:to-rose-50 transition-all duration-200 group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-mono font-semibold text-rose-500 group-hover:text-rose-700">
                                {product.productId}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-800 font-medium">
                              {product.productName || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center bg-linear-to-r from-red-100 to-rose-100 px-3 py-1 rounded-full">
                              <span className="text-sm font-bold text-rose-700">
                                {product.quantity || 0}
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      {transactionOpen && (
        <TransactionWarehouse
          onClose={() => setTransactionOpen(false)}
          onConfirm={() => fetchInventory()}
          type={transactionType}
        />
      )}
    </>
  );
}

export default Transaction;
