import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  Check,
  Loader2,
  ImageOff,
  Package,
  DollarSign,
} from "lucide-react";
import axios from "../../contexts/axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

function Item({ onClose, item }) {
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user: storedUser } = useAuth();
  const [img, setImg] = useState(null);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/products/images/${item.id}`)
      .then((res) => {
        setImg(res.data);
        setImgLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setImgLoading(false);
      });
  }, [item.id]);

  const handleAddToCart = async (item, quantity) => {
    if (!storedUser || !storedUser.id) {
      console.log("User not logged in");
      navigate("/profile/signin");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`/inventory/addToCart`, {
        userId: storedUser.id,
        productId: item.id,
        quantity: quantity,
      });
      toast.success("Added to cart!");
      setAddedToCart(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = (quantity * item.price).toFixed(2);

  const handleChange = (e) => {
    let value = e.target.value;

    // Nếu người dùng xóa hết -> cho phép để trống tạm thời
    if (value === "") {
      setQuantity(1);
      return;
    }

    // Nếu không phải là số hợp lệ -> bỏ qua
    if (!/^\d+$/.test(value)) return;

    // Chuyển sang số nguyên
    let number = parseInt(value, 10);

    // Giới hạn giá trị
    if (number < 0) number = 0;
    if (number > 9999) number = 9999;

    setQuantity(number);
  };
  const handleConfirm = () => {
    const selectedProducts = [
      {
        productId: item.id,
        productNam: item.name,
        quantity: quantity,
      },
    ];
    axios
      .post(`/inventory/createPendingOrder/${storedUser.id}`, selectedProducts)
      .then((response) => {
        console.log("Order created successfully", response.data);
        toast.success("Order pending successfully!");
        navigate("/status/confirm");
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Failed to confirm order");
      });
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
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Product Details</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg backdrop-blur-sm transition-colors duration-200 group hover:cursor-pointer"
          >
            <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg">
                {imgLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                  </div>
                ) : img ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    src={img}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <ImageOff className="w-16 h-16 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-400">No Image</span>
                  </div>
                )}
              </div>

              {/* Price Badge - Desktop */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden md:flex items-center justify-between bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm text-gray-600 font-medium">
                    Unit Price
                  </span>
                </div>
                <span className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ${item.price.toFixed(2)}
                </span>
              </motion.div>
            </div>

            {/* Info Section */}
            <div className="space-y-6">
              {/* Product Name */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Product ID:</span>
                  <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {item.id}
                  </span>
                </div>
              </motion.div>

              {/* Price - Mobile */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="md:hidden flex items-center justify-between bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm text-gray-600 font-medium">
                    Unit Price
                  </span>
                </div>
                <span className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ${item.price.toFixed(2)}
                </span>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Description
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {item.description || "No description available."}
                </p>
              </motion.div>

              {/* Quantity Selector */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-2"
              >
                <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Quantity
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuantity(Math.max(quantity - 1, 1))}
                      className="bg-linear-to-br from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 px-4 py-3 transition-colors duration-200 border-r-2 border-gray-200 hover:cursor-pointer"
                    >
                      <Minus className="w-5 h-5 text-gray-700" />
                    </motion.button>

                    <input
                      type="text"
                      value={quantity}
                      onChange={handleChange}
                      className="px-6 py-3 font-bold text-lg min-w-20 text-center focus:outline-none"
                      inputMode="numeric" // Gợi ý bàn phím số trên mobile
                      maxLength={4} // Giới hạn tối đa 4 ký tự
                    />

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuantity(Math.min(quantity + 1, 9999))}
                      className="bg-linear-to-br from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 px-4 py-3 transition-colors duration-200 border-l-2 border-gray-200 hover:cursor-pointer"
                    >
                      <Plus className="w-5 h-5 text-gray-700" />
                    </motion.button>
                  </div>

                  {/* Stock indicator (if available) */}
                  {item.stock !== undefined && (
                    <span
                      className={`text-xs font-medium px-3 py-2 rounded-full ${
                        item.stock > 10
                          ? "bg-green-100 text-green-700"
                          : item.stock > 0
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.stock > 0
                        ? `${item.stock} in stock`
                        : "Out of stock"}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Total Price */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Total Price</span>
                  <span className="text-3xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ${totalPrice}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-linear-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAddToCart(item, quantity)}
              disabled={loading || addedToCart}
              className="w-full sm:flex-1 px-6 py-4 rounded-xl font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-indigo-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : addedToCart ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-600">Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </>
              )}
            </motion.button>

            <div onClick={handleConfirm} className="w-full sm:flex-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 rounded-xl font-semibold text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                <span>Buy Now</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Item;
