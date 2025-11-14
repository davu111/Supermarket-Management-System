import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

function PopUp({ title, message, onConfirm, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose} // Đóng khi click bên ngoài
    >
      <motion.div
        className="relative bg-white p-6 rounded-lg shadow-lg max-w-lg max-h-[80vh] flex flex-col"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()} // Ngăn đóng khi click vào nội dung
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-3">{title}</h2>
        <p className="text-gray-600">{message}</p>

        <div className="flex flex-row-reverse gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-colors font-medium hover:cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <X className="text-gray-700" />
              No
            </div>
          </button>

          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl font-bold text-lg flex items-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:cursor-pointer"
          >
            <Check />
            Yes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default PopUp;
