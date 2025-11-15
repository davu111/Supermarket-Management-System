import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit3,
  ArrowDownToLine,
  ArrowUpFromLine,
  Trash2,
  ChevronDown,
  Package,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import axios from "../contexts/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import WarehouseHeader from "../components/WarehouseHeader";
import PopUpWarehouse from "../components/PopUpWarehouse";
import PopUp from "../components/PopUp";
import TransactionWarehouse from "../components/TransactionWarehouse";

function Transaction() {
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [products, setProducts] = useState([]);
  const [warehouseOpen, setWarehouseOpen] = useState(false);
  const [warehouseUpdate, setWarehouseUpdate] = useState(false);
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

  // Lấy danh sách kho
  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await axios.get(`/warehouses/all-names`);
      const data = Object.entries(res.data).map(([id, name]) => ({
        id,
        name,
      }));
      setWarehouses(data);
      if (data.length > 0) setWarehouseId(data[0].id);
    } catch (err) {
      console.error("Failed to fetch warehouses", err);
      toast.error("Failed to load warehouses");
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  // Lấy inventory khi warehouseId thay đổi
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/inventory/${warehouseId}`, {
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
    if (!warehouseId) return;
    fetchInventory();
  }, [warehouseId, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleDelete = () => {
    axios
      .delete(`/warehouses/delete/${warehouseId}`)
      .then((response) => {
        toast.success("Warehouse deleted successfully!");
        setPopUpDelete(false);
        fetchWarehouses();
      })
      .catch((error) => {
        toast.error("Failed to delete warehouse!");
      });
  };

  const actionButtons = [
    {
      label: "Add",
      icon: Plus,
      onClick: () => setWarehouseOpen(true),
      linear: "from-indigo-600 to-purple-600",
      hoverGradient: "from-indigo-700 to-purple-700",
    },
    {
      label: "Change",
      icon: Edit3,
      onClick: () => setWarehouseUpdate(true),
      linear: "from-blue-600 to-cyan-600",
      hoverGradient: "from-blue-700 to-cyan-700",
    },
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
    {
      label: "Delete",
      icon: Trash2,
      onClick: () => setPopUpDelete(true),
      linear: "from-red-600 to-rose-600",
      hoverGradient: "from-red-700 to-rose-700",
    },
  ];

  return (
    <>
      <WarehouseHeader title="Table" />

      {/* Control Panel */}
      <div className="p-4 bg-linear-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Warehouse Selector */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-4 mb-4 border-2 border-gray-200"
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Warehouse
            </label>
            <div className="relative">
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full appearance-none bg-linear-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg px-4 py-3 pr-10 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 cursor-pointer hover:border-indigo-300"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-600 pointer-events-none" />
            </div>
          </motion.div>

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
            <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <Package className="w-5 h-5" />
                <h2 className="text-lg font-bold">Inventory</h2>
                <span className="ml-auto bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  {products.length} items
                </span>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto max-h-[calc(100vh-400px)]">
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
                          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
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
                            <Package className="w-12 h-12 text-indigo-600" />
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
                          className="hover:bg-linear-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-mono font-semibold text-indigo-600 group-hover:text-indigo-700">
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
                            <div className="inline-flex items-center bg-linear-to-r from-indigo-100 to-purple-100 px-3 py-1 rounded-full">
                              <span className="text-sm font-bold text-indigo-700">
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
      {warehouseOpen && (
        <PopUpWarehouse
          onClose={() => setWarehouseOpen(false)}
          onConfirm={() => fetchWarehouses()}
        />
      )}
      {warehouseUpdate && (
        <PopUpWarehouse
          warehouseId={warehouseId}
          onClose={() => setWarehouseUpdate(false)}
          onConfirm={() => fetchWarehouses()}
        />
      )}
      {isPopUpDelete && (
        <PopUp
          title={"Delete Confirm"}
          message={"Are you sure?"}
          onClose={() => setPopUpDelete(false)}
          onConfirm={() => handleDelete()}
        />
      )}
      {transactionOpen && (
        <TransactionWarehouse
          warehouseId={warehouseId}
          onClose={() => setTransactionOpen(false)}
          onConfirm={() => fetchInventory()}
          type={transactionType}
        />
      )}
    </>
  );
}

export default Transaction;
