import { useState, useEffect } from "react";
import axios from "../../contexts/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TransactionWarehouse({ onClose, onConfirm, type }) {
  const isImport = type === "IMPORT";
  const [products, setProducts] = useState([]);
  const [exportList, setExportList] = useState([
    { product: null, quantity: "" },
  ]);

  const [loading, setLoading] = useState(false);

  // 🟦 Lấy danh sách sản phẩm trong kho
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        var res;
        if (type === "EXPORT") res = await axios.get(`/inventory/getInventory`);
        else if (type === "IMPORT") res = await axios.get(`/products/all`);
        console.log(res.data);
        setProducts(res.data);
      } catch (err) {
        toast.error("Không thể tải danh sách sản phẩm!");
      }
    };

    fetchProducts();
  }, []);

  // 🟩 Thêm một dòng xuất kho
  const addExportRow = () => {
    setExportList([...exportList, { product: null, quantity: "" }]);
  };

  // 🟨 Cập nhật sản phẩm hoặc số lượng trong từng dòng
  const handleChange = (index, field, value) => {
    const newList = [...exportList];
    newList[index][field] = value;
    setExportList(newList);
  };

  // 🟥 Kiểm tra và gửi yêu cầu xuất kho
  const handleExport = async () => {
    if (!exportList.length)
      return toast.warn("Vui lòng thêm ít nhất một sản phẩm!");

    // Kiểm tra hợp lệ từng dòng
    for (let i = 0; i < exportList.length; i++) {
      const { product, quantity } = exportList[i];

      if (!product) {
        toast.warn(`Dòng ${i + 1}: chưa chọn sản phẩm!`);
        return;
      }

      const productData = products.find(
        (p) => p.productId === product || p.id === product
      );
      if (!productData) {
        toast.error(`Dòng ${i + 1}: sản phẩm không tồn tại trong kho!`);
        return;
      }

      if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
        toast.warn(`Dòng ${i + 1}: số lượng không hợp lệ!`);
        return;
      }

      if (type === "EXPORT" && Number(quantity) > productData.quantity) {
        toast.error(
          `Dòng ${i + 1}: số lượng xuất (${quantity}) vượt quá tồn kho (${
            productData.quantity
          })!`
        );
        return;
      }
    }

    // Nếu tất cả hợp lệ → gửi API
    try {
      setLoading(true);
      console.log(exportList);
      const transactions = exportList.map((item) => ({
        productId: item.product,
        quantity: Number(item.quantity),
        type: type,
      }));

      console.log("Transactions payload:", transactions);

      const response = await axios.post(
        "/inventory/transactions/batch",
        transactions
      );
      console.log("Batch transaction success:", response.data);

      toast.success("Successful!");
      onConfirm();
      onClose();
      setExportList([{ product: null, quantity: "" }]); // reset form
    } catch (err) {
      toast.error("Error! Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`bg-linear-to-r ${
            isImport
              ? "from-green-600 to-emerald-600"
              : "from-orange-600 to-amber-600"
          } p-6 flex items-center justify-between`}
        >
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              {isImport ? (
                <ArrowDownToLine className="w-6 h-6" />
              ) : (
                <ArrowUpFromLine className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {isImport ? "Import to Warehouse" : "Export from Warehouse"}
              </h2>
              <p className="text-sm opacity-90">
                {isImport
                  ? "Add products to warehouse inventory"
                  : "Remove products from warehouse"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg backdrop-blur-sm transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-linear-to-br ${
              isImport
                ? "from-green-50 to-emerald-50"
                : "from-orange-50 to-amber-50"
            } border-2 ${
              isImport ? "border-green-200" : "border-orange-200"
            } rounded-xl p-4 mb-6`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`${
                  isImport ? "bg-green-600" : "bg-orange-600"
                } p-2 rounded-lg`}
              >
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">
                  {isImport ? "Import Instructions" : "Export Instructions"}
                </h3>
                <p className="text-sm text-gray-600">
                  {isImport
                    ? "Select products and quantities to add to the warehouse inventory."
                    : "Select products and quantities to remove. Available stock is shown in parentheses."}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Product List */}
          <div className="space-y-3">
            <AnimatePresence>
              {exportList.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row gap-3 items-center">
                    {/* Product Selector */}
                    <div className="flex-1 w-full">
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">
                        Product
                      </label>
                      <div className="relative">
                        <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                          value={item.product || ""}
                          onChange={(e) =>
                            handleChange(index, "product", e.target.value)
                          }
                        >
                          <option value="">-- Select Product --</option>
                          {products.map((p) => (
                            <option
                              key={p.productId || p.id}
                              value={p.productId || p.id}
                            >
                              {`${p.productName || p.name} ${
                                !isImport ? `(Stock: ${p.quantity})` : ""
                              }`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quantity Input */}
                    <div className="w-full md:w-40">
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">
                        Quantity
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="0"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleChange(index, "quantity", e.target.value)
                        }
                      />
                    </div>

                    {/* Add/Remove Button */}
                    <div className="w-full md:w-auto flex gap-2">
                      {index === exportList.length - 1 ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={addExportRow}
                          className="flex-1 cursor-pointer md:flex-initial px-4 py-2.5 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="md:hidden">Add Row</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            // Add remove logic here if needed
                            console.log("Remove row", index);
                          }}
                          className="flex-1 md:flex-initial px-4 py-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-linear-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              onClick={handleExport}
              disabled={loading}
              className={`cursor-pointer flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : isImport
                  ? "bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  : "bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isImport ? (
                    <ArrowDownToLine className="w-5 h-5" />
                  ) : (
                    <ArrowUpFromLine className="w-5 h-5" />
                  )}
                  <span>Confirm {isImport ? "Import" : "Export"}</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
