import { useState, useRef, useEffect } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import axios from "../../contexts/axios";
import { useAuth } from "../../contexts/AuthContext";

import InvoiceModal from "../../components/cashier/InvoiceModal";
import PaymentModal from "../../components/cashier/PaymentModal";
import QRModal from "../../components/cashier/QRModal";
import Header from "../../components/all/Header";

const POSCheckout = () => {
  const [productCode, setProductCode] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [appliedDiscounts, setAppliedDiscounts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const inputRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleProductCodeSubmit = async () => {
    if (productCode.length !== 6) {
      alert("Mã sản phẩm phải có 6 chữ số");
      return;
    }

    // API: GET /api/products/${productCode}
    // Response: { id, name, price, image }
    // const product = mockProductDatabase[productCode];

    const { data: product } = await axios.get(
      `/products/getByProductCode/${productCode}`
    );

    if (!product) {
      alert("No products found");
      setProductCode("");
      return;
    }

    const existingItem = cartItems.find((item) => item.code === productCode);

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.code === productCode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          id: product.id,
          code: productCode,
          name: product.name,
          price: product.price,
          image: product.imageUrl,
          quantity: 1,
        },
      ]);
    }

    setProductCode("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleProductCodeSubmit();
    }
  };

  const removeItem = (code) => {
    setCartItems(cartItems.filter((item) => item.code !== code));
  };

  const updateQuantity = (code, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(
      cartItems.map((item) =>
        item.code === code ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      // Gọi API tính toán giảm giá
      const response = await axios.post("/coupons/apply", {
        productIds: cartItems.map((item) => item.id),
        totalAmount: calculateSubtotal(),
        cardNumber: cardNumber,
      });

      const discounts = response.data;

      // ✅ Đảm bảo luôn set dữ liệu sau khi nhận được
      setAppliedDiscounts(discounts);
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error in calculating discount:", error);
      alert("Discount could not be calculated. Please try again later!");
    }
  };

  const handleQRPayment = () => {
    setPaymentMethod("qr");
    setShowPaymentModal(false);
    setShowQRModal(true);
  };

  const handleCashPayment = () => {
    setPaymentMethod("cash");
    processPayment("cash");
  };

  const handleQRConfirm = async () => {
    processPayment("qr");
  };

  const processPayment = async (method) => {
    try {
      await axios.post("/transactions/create", {
        items: cartItems,
        total: appliedDiscounts.finalTotal,
        paymentMethod: method,
        cardNumber: cardNumber,
      });
      setShowQRModal(false);
      setShowInvoiceModal(true);
    } catch (error) {
      console.error("Error in processing payment:", error);
      alert("Payment could not be processed. Please try again later!");
    }
  };

  const handleFinish = () => {
    setShowInvoiceModal(false);
    setShowPaymentModal(false);
    setCartItems([]);
    setAppliedDiscounts([]);
    setPaymentMethod("");
    inputRef.current?.focus();
  };

  return (
    <>
      <Header currentPage="POS" menu="cash" />
      <div className="min-h-screen bg-linear-to-br from-red-50 to-white p-4">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="bg-white text-gray-800 p-6 rounded-t-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold">Point of Sale</h1>
                  <p className="text-gray-800 text-sm">
                    Convenience Supermarket
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-800">
                  Employee: {user.lastName}
                </p>
                <p className="text-xs text-gray-800">
                  {new Date().toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
          </div>

          {/* Product Input */}
          <div className="bg-white p-6 shadow-lg border-x border-gray-200">
            <div className="flex gap-4">
              <input
                ref={inputRef}
                type="text"
                value={productCode}
                onChange={(e) =>
                  // setProductCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  setProductCode(e.target.value.slice(0, 6))
                }
                onKeyPress={handleKeyPress}
                placeholder="Enter Product Code (6 digits)"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg text-black "
                maxLength={6}
              />
              <button
                onClick={handleProductCodeSubmit}
                className="px-8 py-3 bg-linear-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 transition font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Cart Items Grid */}
          <div className="bg-white p-6 min-h-[400px] shadow-lg border-x border-gray-200">
            {cartItems.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <ShoppingCart size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">There are no products yet</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cartItems.map((item) => (
                  <div
                    key={item.code}
                    className="bg-linear-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 hover:border-red-300 transition"
                  >
                    <div className="flex gap-4">
                      {/* Hình ảnh sản phẩm - bên trái */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 rounded-lg object-cover shrink-0"
                      />

                      {/* Thông tin sản phẩm - bên phải */}
                      <div className="flex-1 flex flex-col">
                        {/* Header với tên và nút xóa */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-1">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Code: {item.code}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.code)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded ml-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* Phần điều chỉnh số lượng và giá */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.code, item.quantity - 1)
                              }
                              className="w-7 h-7 bg-white rounded text-red-600 hover:bg-red-50 font-bold"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.code, item.quantity + 1)
                              }
                              className="w-7 h-7 bg-white rounded text-red-600 hover:bg-red-50 font-bold"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-red-600 font-bold">
                            {(item.price * item.quantity).toLocaleString(
                              "vi-VN"
                            )}
                            đ
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total & Checkout */}
          <div className="bg-linear-to-r from-red-600 to-red-500 text-white p-6 rounded-b-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">Total</p>
                <p className="text-3xl font-bold">
                  {calculateSubtotal().toLocaleString("vi-VN")}đ
                </p>
                <p className="text-xs text-red-200 mt-1">
                  {cartItems.length} products
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Loyalty code (optional)"
                  className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-red-200 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
                <button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                  className="px-12 py-4 bg-white text-red-600 rounded-xl hover:bg-red-50 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg cursor-pointer"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <PaymentModal
            cartItems={cartItems}
            setShowPaymentModal={setShowPaymentModal}
            appliedDiscounts={appliedDiscounts}
            handleQRPayment={handleQRPayment}
            handleCashPayment={handleCashPayment}
            calculateSubtotal={calculateSubtotal}
          />
        )}

        {/* QR Modal */}
        {showQRModal && (
          <QRModal
            setShowQRModal={setShowQRModal}
            appliedDiscounts={appliedDiscounts}
            handleQRConfirm={handleQRConfirm}
          />
        )}

        {/* Invoice Modal */}
        {showInvoiceModal && (
          <InvoiceModal
            cartItems={cartItems}
            calculateSubtotal={calculateSubtotal}
            appliedDiscounts={appliedDiscounts}
            handleFinish={handleFinish}
            paymentMethod={paymentMethod}
          />
        )}
      </div>
    </>
  );
};

export default POSCheckout;
