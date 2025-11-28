import { X, QrCode } from "lucide-react";

function QRModal({ setShowQRModal, appliedDiscounts, handleQRConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="bg-linear-to-r from-blue-600 to-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">QR Code Payment</h2>
            <button
              onClick={() => setShowQRModal(false)}
              className="hover:bg-blue-700 p-1 rounded cursor-pointer"
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
            <p className="text-sm text-gray-500 mt-4">Scan code to pay</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Supermarket:</span>
              <span className="font-semibold">Convenient Supermarket</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold text-red-600">
                {appliedDiscounts.finalTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">
                {new Date().toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
          <button
            onClick={handleQRConfirm}
            className="w-full py-4 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition font-semibold cursor-pointer"
          >
            Payment Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default QRModal;
