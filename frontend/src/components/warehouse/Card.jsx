import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit3, EyeIcon, EyeOff, Loader2, ImageOff } from "lucide-react";
import axios from "../../contexts/axios";

function Card({
  item,
  onClick,
  setIsDelete,
  setIsUnDelete,
  setIsUpdate,
  setItem,
}) {
  const [img, setImg] = useState(null);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    setImgLoading(true);
    // Thêm timestamp để tránh cache
    axios
      .get(`/products/images/${item.id}?t=${Date.now()}`)
      .then((res) => {
        setImg(res.data);
        setImgLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setImgLoading(false);
      });
  }, [item.id, item.updatedAt]); // Thêm dependency để reload khi product update

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative group"
    >
      <div
        className="relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-100 cursor-pointer border-2 border-gray-100 hover:border-indigo-200"
        onClick={onClick}
      >
        {/* Image Container */}
        <div className="relative w-full aspect-square bg-linear-to-br from-gray-100 to-gray-200 overflow-hidden">
          {imgLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
              {console.log(item.deleted)}
            </div>
          ) : img ? (
            <>
              <motion.img
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.1 }}
                src={img}
                alt={item.name}
                className={`w-full h-full object-cover ${
                  item.deleted ? "grayscale" : "grayscale-0"
                }`}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <ImageOff className="w-12 h-12 text-gray-400 mb-2" />
              <span className="text-sm text-gray-400">No Image</span>
            </div>
          )}

          {/* Admin Actions - Top Right */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-100 z-20"
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsUpdate(true);
                setItem(item);
              }}
              className="p-2.5 bg-linear-to-br from-amber-600 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl backdrop-blur-sm cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                item.deleted ? setIsUnDelete(true) : setIsDelete(true);
                setItem(item);
              }}
              className="p-2.5 bg-linear-to-br from-red-700 to-rose-600 text-white rounded-full shadow-lg hover:shadow-xl backdrop-blur-sm cursor-pointer"
            >
              {item.deleted ? (
                <EyeIcon className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </motion.button>
          </motion.div>

          {/* Price Badge - Top Left */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-3 left-3 z-10"
          >
            <div className="px-3 py-1.5 bg-linear-to-r from-red-600 to-red-500 text-white font-bold text-sm rounded-full shadow-lg backdrop-blur-sm">
              ${item.price.toFixed(2)}
            </div>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2 group-hover:text-red-600 transition-colors duration-100">
            {item.name}
          </h3>

          {item.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-2">
              {item.description}
            </p>
          )}

          {/* Additional Info */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">ID: {item.id}</span>

            {/* Stock indicator (if available) */}
            {item.stock !== undefined && (
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  item.stock > 10
                    ? "bg-green-100 text-green-700"
                    : item.stock > 0
                    ? "bg-orange-100 text-orange-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.stock > 0 ? `${item.stock} left` : "Out of stock"}
              </span>
            )}
          </div>
        </div>

        {/* Hover Shine Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100 pointer-events-none">
          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </div>
    </motion.div>
  );
}

export default Card;
