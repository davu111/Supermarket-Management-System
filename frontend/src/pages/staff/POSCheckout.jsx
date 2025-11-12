import { useState, useRef, useEffect } from "react";
import {
  ShoppingCart,
  Trash2,
  X,
  QrCode,
  Banknote,
  Receipt,
} from "lucide-react";
import axios from "../../contexts/axios";
import { useAuth } from "../../contexts/AuthContext";

const POSCheckout = () => {
  const [productCode, setProductCode] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [appliedDiscounts, setAppliedDiscounts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
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
      alert("Không tìm thấy sản phẩm");
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
      alert("Giỏ hàng trống");
      return;
    }

    // API: POST /api/discounts/calculate
    // Body: { items: cartItems, subtotal: calculateSubtotal() }
    // Response: { discounts: [{ type, name, amount }], total }

    // Mock discounts
    const mockDiscounts = [
      { type: "combo", name: "Combo sữa + bánh mì", amount: 5000 },
      { type: "total", name: "Giảm 10% hóa đơn trên 100k", amount: 10000 },
    ];

    setAppliedDiscounts(mockDiscounts);
    setShowPaymentModal(true);
  };

  const getTotalDiscount = () => {
    return appliedDiscounts.reduce((sum, d) => sum + d.amount, 0);
  };

  const getFinalTotal = () => {
    return calculateSubtotal() - getTotalDiscount();
  };

  const handleQRPayment = () => {
    setPaymentMethod("qr");
    setShowPaymentModal(false);
    setShowQRModal(true);
  };

  const handleCashPayment = () => {
    setPaymentMethod("cash");
    processPayment("cash", "");
  };

  const handleQRConfirm = async () => {
    if (!customerName.trim()) {
      alert("Vui lòng nhập tên khách hàng");
      return;
    }
    processPayment("qr", customerName);
  };

  const processPayment = async (method, customer) => {
    // API: POST /api/transactions
    // Body: {
    //   items: cartItems,
    //   subtotal: calculateSubtotal(),
    //   discounts: appliedDiscounts,
    //   total: getFinalTotal(),
    //   paymentMethod: method,
    //   customerName: customer,
    //   timestamp: new Date()
    // }
    // Response: { transactionId, invoiceData }

    setShowQRModal(false);
    setShowInvoiceModal(true);
  };

  const handleFinish = () => {
    setCartItems([]);
    setAppliedDiscounts([]);
    setCustomerName("");
    setPaymentMethod("");
    setShowInvoiceModal(false);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-white p-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-red-600 to-red-500 text-white p-6 rounded-t-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart size={32} />
              <div>
                <h1 className="text-2xl font-bold">Thanh Toán Tại Quầy</h1>
                <p className="text-red-100 text-sm">Siêu Thị Tiện Lợi</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-red-100">Employee: {user.lastName}</p>
              <p className="text-xs text-red-200">
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
              placeholder="Nhập mã sản phẩm (6 chữ số)"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg text-black "
              maxLength={6}
            />
            <button
              onClick={handleProductCodeSubmit}
              className="px-8 py-3 bg-linear-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 transition font-semibold"
            >
              Thêm
            </button>
          </div>
        </div>

        {/* Cart Items Grid */}
        <div className="bg-white p-6 min-h-[400px] shadow-lg border-x border-gray-200">
          {cartItems.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <ShoppingCart size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Chưa có sản phẩm nào</p>
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
                          {(item.price * item.quantity).toLocaleString("vi-VN")}
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
              <p className="text-red-100 text-sm mb-1">Tổng cộng</p>
              <p className="text-3xl font-bold">
                {calculateSubtotal().toLocaleString("vi-VN")}đ
              </p>
              <p className="text-xs text-red-200 mt-1">
                {cartItems.length} sản phẩm
              </p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className="px-12 py-4 bg-white text-red-600 rounded-xl hover:bg-red-50 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              Thanh Toán
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-linear-to-r from-red-600 to-red-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Chi Tiết Thanh Toán</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="hover:bg-red-700 p-1 rounded"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.code} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-semibold">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                ))}

                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Tạm tính</span>
                    <span>{calculateSubtotal().toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>

                {appliedDiscounts.length > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg space-y-2">
                    <p className="text-xs font-semibold text-green-700 mb-2">
                      Mã giảm giá áp dụng:
                    </p>
                    {appliedDiscounts.map((discount, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-green-700">{discount.name}</span>
                        <span className="text-green-700 font-semibold">
                          -{discount.amount.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">
                      Tổng thanh toán
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      {getFinalTotal().toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleQRPayment}
                  className="w-full py-4 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition font-semibold flex items-center justify-center gap-2"
                >
                  <QrCode size={20} />
                  Thanh Toán QR
                </button>
                <button
                  onClick={handleCashPayment}
                  className="w-full py-4 bg-linear-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition font-semibold flex items-center justify-center gap-2"
                >
                  <Banknote size={20} />
                  Tiền Mặt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-linear-to-r from-blue-600 to-blue-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Thanh Toán QR Code</h2>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="hover:bg-blue-700 p-1 rounded"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 text-center">
              <div className="bg-white border-4 border-blue-200 rounded-2xl p-8 mb-6">
                <div className="w-48 h-48 mx-auto bg-linear-to-br from-blue-100 to-white flex items-center justify-center rounded-xl">
                  <QrCode size={120} className="text-blue-600" />
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Quét mã để thanh toán
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Siêu thị:</span>
                  <span className="font-semibold">Siêu Thị Tiện Lợi</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tổng thanh toán:</span>
                  <span className="font-semibold text-red-600">
                    {getFinalTotal().toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-semibold">
                    {new Date().toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nhập tên khách hàng"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none mb-4"
              />

              <button
                onClick={handleQRConfirm}
                className="w-full py-4 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition font-semibold"
              >
                Xác Nhận Thanh Toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-linear-to-r from-green-600 to-green-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-center gap-2">
                <Receipt size={24} />
                <h2 className="text-xl font-bold">Hóa Đơn Thanh Toán</h2>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold">SIÊU THỊ TIỆN LỢI</h3>
                <p className="text-sm text-gray-600">
                  Địa chỉ: 123 Đường ABC, Quận XYZ
                </p>
                <p className="text-sm text-gray-600">Hotline: 1900 xxxx</p>
                <div className="border-t border-dashed border-gray-300 my-4"></div>
                <p className="text-xs text-gray-500">
                  Mã GD: #
                  {Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleString("vi-VN")}
                </p>
              </div>

              <div className="space-y-2 mb-4">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="flex justify-between font-semibold">
                      <span>{item.name}</span>
                      <span>
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {item.quantity} x {item.price.toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-300 my-4"></div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{calculateSubtotal().toLocaleString("vi-VN")}đ</span>
                </div>
                {appliedDiscounts.map((discount, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-green-600"
                  >
                    <span>{discount.name}:</span>
                    <span>-{discount.amount.toLocaleString("vi-VN")}đ</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Tổng cộng:</span>
                  <span className="font-bold text-2xl text-red-600">
                    {getFinalTotal().toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Hình thức:</span>
                  <span className="font-semibold">
                    {paymentMethod === "qr" ? "QR Code" : "Tiền mặt"}
                  </span>
                </div>
                {customerName && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Khách hàng:</span>
                    <span className="font-semibold">{customerName}</span>
                  </div>
                )}
              </div>

              <div className="text-center text-xs text-gray-500 mb-6">
                <p>Cảm ơn quý khách đã mua hàng!</p>
                <p>Hẹn gặp lại quý khách</p>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-4 bg-linear-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition font-semibold"
              >
                Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSCheckout;
