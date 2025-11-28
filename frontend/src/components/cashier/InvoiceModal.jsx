import { Receipt } from "lucide-react";

function InvoiceModal({
  cartItems,
  calculateSubtotal,
  appliedDiscounts,
  handleFinish,
  paymentMethod,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="bg-linear-to-r from-green-600 to-green-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-center gap-2">
            <Receipt size={24} />
            <h2 className="text-xl font-bold">Payment Invoice</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold">CONVENIENT SUPERMARKET</h3>
            <p className="text-sm text-gray-600">
              Address: 123 ABC Street, XYZ District
            </p>
            <p className="text-sm text-gray-600">Hotline: 1900 xxxx</p>
            <div className="border-t border-dashed border-gray-300 my-4"></div>
            <p className="text-xs text-gray-500">
              Transaction Code: #
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
              <span>Provisional:</span>
              <span>{calculateSubtotal().toLocaleString("vi-VN")}đ</span>
            </div>
            {appliedDiscounts.coupons.map((discount, idx) => (
              <div key={idx} className="flex justify-between text-green-600">
                <span>{discount.name}:</span>
                <span>-{discount.amount.toLocaleString("vi-VN")}đ</span>
              </div>
            ))}
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Total:</span>
              <span className="font-bold text-2xl text-red-600">
                {appliedDiscounts.finalTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Payment:</span>
              <span className="font-semibold">
                {paymentMethod === "qr" ? "QR Code" : "Cash"}
              </span>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 mb-6">
            <p>Thank you for your purchase!</p>
            <p>See you again!</p>
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-4 bg-linear-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceModal;
