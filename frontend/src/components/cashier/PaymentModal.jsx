import { X, QrCode, Banknote } from "lucide-react";

function PaymentModal({
  cartItems,
  setShowPaymentModal,
  appliedDiscounts,
  handleQRPayment,
  handleCashPayment,
  calculateSubtotal,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="bg-linear-to-r from-red-600 to-red-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Payment Details</h2>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="hover:bg-red-700 p-1 rounded cursor-pointer"
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
                <span>Provisional</span>
                <span>{calculateSubtotal().toLocaleString("vi-VN")}đ</span>
              </div>
            </div>

            {appliedDiscounts?.coupons?.length > 0 && (
              <div className="bg-green-50 p-3 rounded-lg space-y-2">
                {console.log(appliedDiscounts)}
                <p className="text-xs font-semibold text-green-700 mb-2">
                  Applicable discount code:{" "}
                </p>
                {appliedDiscounts.coupons.map((discount, idx) => (
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
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-red-600">
                  {appliedDiscounts?.finalTotal?.toLocaleString("vi-VN") || 0}đ
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleQRPayment}
              className="w-full py-4 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode size={20} />
              QR Payment
            </button>
            <button
              onClick={handleCashPayment}
              className="w-full py-4 bg-linear-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Banknote size={20} />
              Cash Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
