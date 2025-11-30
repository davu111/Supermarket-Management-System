import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Loader2,
  Image as ImageIcon,
  DollarSign,
  FileText,
  Package,
  Hash,
  ChevronDown,
} from "lucide-react";
import axios from "../../contexts/axios";
import { toast } from "react-toastify";

function AddProductPopup({
  onClose,
  onSuccess,
  productId = null,
  initialData = null,
}) {
  const isEditMode = !!productId;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    productCode: "",
    categoryId: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);

  // Lấy danh sách danh mục
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`/categories/all`);
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
      toast.error("Failed to load categories");
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Load existing product data in edit mode
  useEffect(() => {
    if (isEditMode && productId) {
      setLoadingData(true);

      // Load product data
      const loadProductData = async () => {
        try {
          // Load product info
          let productData;
          if (initialData) {
            productData = initialData;
          } else {
            const response = await axios.get(`/products/${productId}`);
            productData = response.data;
          }

          setFormData({
            name: productData.name || "",
            description: productData.description || "",
            price: productData.price?.toString() || "",
            productCode: productData.productCode || "",
            categoryId: productData.categoryId || "",
          });

          // Load existing image
          try {
            const imageResponse = await axios.get(
              `/products/images/${productId}`
            );
            setExistingImageUrl(imageResponse.data);
            setImagePreview(imageResponse.data);
          } catch (err) {
            console.log("No existing image found");
          }

          setLoadingData(false);
        } catch (error) {
          console.error("Error loading product data:", error);
          toast.error("Failed to load product data");
          setLoadingData(false);
        }
      };

      loadProductData();
    }
  }, [isEditMode, productId, initialData]);

  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      // Chỉ set khi chưa có categoryId (trường hợp tạo mới)
      setFormData((prev) => ({
        ...prev,
        categoryId: categories[0].id,
      }));
    }
  }, [categories, formData.categoryId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error khi user type
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null); // Revert to existing image in edit mode
    if (isEditMode && !existingImageUrl) {
      setImagePreview(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Please enter a valid price";
    }

    if (!formData.productCode.trim()) {
      newErrors.productCode = "Product code is required";
    }

    // Image required only for create mode
    if (!isEditMode && !imageFile) {
      newErrors.image = "Product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        productCode: formData.productCode.trim(),
        categoryId: formData.categoryId,
      };

      console.log(productData);

      let responseProductId;

      if (isEditMode) {
        // Update existing product
        await axios.put(`/products/update/${productId}`, productData);
        responseProductId = productId;
        toast.success("Product updated successfully!");
      } else {
        // Create new product
        const productResponse = await axios.post(
          "/products/create",
          productData
        );
        responseProductId = productResponse.data.id;
        toast.success("Product created successfully!");
      }

      // Upload new image if selected
      if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append("file", imageFile);

        await axios.post(
          `/products/images/upload/${responseProductId}`,
          formDataImage,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} product:`,
        error
      );
      toast.error(
        error.response?.data?.message ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } product. Please try again.`
      );
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
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`bg-linear-to-r ${
            isEditMode
              ? "from-amber-600 to-orange-500"
              : "from-red-600 to-rose-500"
          } p-6 flex items-center justify-between`}
        >
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {isEditMode ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="text-sm opacity-90">
                {isEditMode
                  ? "Update product details"
                  : "Fill in product details"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading || loadingData}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg backdrop-blur-sm transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed group-hover: cursor-pointer"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        {loadingData ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading product data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Package className="w-4 h-4 text-red-600" />
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-red-200"
                  }`}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none ${
                    errors.description
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-red-200"
                  }`}
                  disabled={loading}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 text-red-600" />
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    đ
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.price
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-red-200"
                    }`}
                    disabled={loading}
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>
              {/* Product Code */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Hash className="w-4 h-4 text-red-600" />
                  Product Code *
                </label>
                <input
                  type="text"
                  name="productCode"
                  value={formData.productCode}
                  onChange={handleInputChange}
                  placeholder="Enter product code"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-red-200"
                  }`}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Categories Selector */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-4 mb-4 border-2 border-gray-200"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Category
                </label>
                <div className="relative">
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                      }))
                    }
                    className="w-full appearance-none bg-linear-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg px-4 py-3 pr-10 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 cursor-pointer hover:border-indigo-300"
                  >
                    {categories.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-600 pointer-events-none" />
                </div>
              </motion.div>

              {/* Image Upload */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 text-red-600" />
                  Product Image {!isEditMode && "*"}
                  {isEditMode && (
                    <span className="text-xs font-normal text-gray-500">
                      (Leave empty to keep current image)
                    </span>
                  )}
                </label>

                {/* Image Preview or Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
                    errors.image
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-red-400"
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative aspect-video">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {/* Badge to show if it's existing or new image */}
                      {imagePreview === existingImageUrl &&
                        imageFile === null && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                            Current Image
                          </div>
                        )}
                      {imageFile && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                          New Image
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={loading}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 group-hover: cursor-pointer"
                      >
                        <X className="w-4 h-4 hover:curosr-pointer" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center py-12 cursor-pointer group">
                      <div className="p-4 bg-linear-to-br from-red-100 to-purple-100 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-8 h-8 text-red-600" />
                      </div>
                      <p className="text-gray-600 font-medium mb-1">
                        Click to upload image
                      </p>
                      <p className="text-sm text-gray-400">
                        PNG, JPG up to 5MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={loading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Footer */}
        {!loadingData && (
          <div className="bg-linear-to-r from-gray-50 to-gray-100 border-t border-gray-200 p-6">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-semibold text-white bg-linear-to-r ${
                  isEditMode
                    ? "from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-700"
                    : "from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-700"
                } shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover: cursor-pointer`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    {isEditMode ? "Update Product" : "Create Product"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default AddProductPopup;
