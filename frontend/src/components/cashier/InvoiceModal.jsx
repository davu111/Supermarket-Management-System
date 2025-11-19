function InvoiceModal(cartItems) {
  return (
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
              Mã GD: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
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
            {appliedDiscounts.coupons.map((discount, idx) => (
              <div key={idx} className="flex justify-between text-green-600">
                <span>{discount.name}:</span>
                <span>-{discount.amount.toLocaleString("vi-VN")}đ</span>
              </div>
            ))}
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Tổng cộng:</span>
              <span className="font-bold text-2xl text-red-600">
                {appliedDiscounts.finalTotal.toLocaleString("vi-VN")}đ
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
  );
}

export default InvoiceModal;
