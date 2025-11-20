import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Grid3x3,
  LayoutGrid,
  Loader2,
  Package,
  ChevronDown,
  Plus,
  EyeIcon,
  EyeOff,
} from "lucide-react";
import axios from "../../contexts/axios";
import { useAuth } from "../../contexts/AuthContext";

import Card from "../../components/warehouse/Card";
import PopUp from "../../components/warehouse/PopUp";
import AddProductPopup from "../../components/warehouse/AddProductPopup";
import Item from "../../components/warehouse/Item";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../components/all/Header";

function Catalog() {
  const [Items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isUnDelete, setIsUnDelete] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [gridView, setGridView] = useState("large"); // 'large' or 'compact'
  const [sortBy, setSortBy] = useState("newest");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isSeeDeleted, setIsSeeDeleted] = useState(false);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    setLoading(true);
    // Fetch products
    axios
      .get(`/products/all`)
      .then((res) => {
        setItems(res.data);
        setFilteredItems(res.data.filter((item) => !item.deleted));
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });

    // Fetch categories
    axios
      .get(`/categories/all`)
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // Search and filter
  useEffect(() => {
    let result = [...Items];

    // Filter by active
    if (!isSeeDeleted) {
      result = result.filter((item) => !item.deleted);
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((item) => item.categoryId === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      result = result.filter((item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredItems(result);
  }, [searchQuery, sortBy, isSeeDeleted, selectedCategory, Items]);

  const handleDelete = (id) => {
    try {
      axios.delete(`/products/delete/${id}`).then(() => {
        // Refresh products list
        axios.get(`/products/all`).then((res) => {
          setItems(res.data);
          setFilteredItems(res.data);
        });
      });
      setIsDelete(false);
      toast.success("Product deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete product!");
    }
  };

  const handleUnDelete = (id) => {
    try {
      axios.delete(`/products/unDelete/${id}`).then(() => {
        // Refresh products list
        axios.get(`/products/all`).then((res) => {
          setItems(res.data);
          setFilteredItems(res.data);
        });
      });
      setIsUnDelete(false);
      toast.success("Product undo deleted successfully!");
    } catch (err) {
      toast.error("Failed to undo delete product!");
    }
  };

  const gridCols =
    gridView === "large"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

  return (
    <>
      <Header currentPage="Product" menu="warehouse" />
      <div className="flex flex-col w-full min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative bg-linear-to-br from-red-700 via-red-600 to-red-500 overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-white px-2 py-6 md:py-6">
            {/* Search Bar in Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-2xl"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/95 backdrop-blur-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-xl"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
          {/* Controls Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Results Info */}
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-red-600" />
                <span className="text-gray-700 font-medium">
                  {filteredItems.length} Products
                </span>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {/* Active */}
                <div className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
                  {isSeeDeleted ? (
                    <EyeIcon
                      onClick={() => setIsSeeDeleted(false)}
                      className="w-5 h-5 text-red-600"
                    />
                  ) : (
                    <EyeOff
                      onClick={() => setIsSeeDeleted(true)}
                      className="w-5 h-5 text-red-600"
                    />
                  )}
                </div>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-linear-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer hover:border-red-300 transition-colors"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-600 pointer-events-none" />
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-linear-to-br from-red-50 to-purple-50 border-2 border-red-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer hover:border-red-300 transition-colors"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-600 pointer-events-none" />
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setGridView("large")}
                    className={`p-2 rounded transition-all ${
                      gridView === "large"
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setGridView("compact")}
                    className={`p-2 rounded transition-all ${
                      gridView === "compact"
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
          {/* Add Product Button - Admin Only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 hover:cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Add New Product
            </button>
          </motion.div>

          {/* Products Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-16 h-16 text-red-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium text-lg">
                  Loading products...
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="bg-linear-to-br from-red-100 to-purple-100 rounded-full p-8 mb-4">
                  <Package className="w-16 h-16 text-red-600" />
                </div>
                <p className="text-gray-600 font-medium text-xl mb-2">
                  No products found
                </p>
                <p className="text-gray-400">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className={`grid ${gridCols} gap-6`}>
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        delay: index * 0.03,
                        layout: { duration: 0.3 },
                      }}
                    >
                      <Card
                        item={item}
                        setIsDelete={setIsDelete}
                        setIsUpdate={setIsUpdate}
                        setIsUnDelete={setIsUnDelete}
                        setItem={setItem}
                        onClick={() => {
                          setIsUpdate(true);
                          setItem(item);
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Load More Button (Optional) */}
          {filteredItems.length > 20 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mt-12"
            >
              <button className="px-8 py-3 bg-linear-to-r from-red-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-red-700 hover:to-purple-700 transition-all duration-300">
                Load More Products
              </button>
            </motion.div>
          )}
        </div>

        {/* Modals */}
        {isOpen && <Item item={item} onClose={() => setIsOpen(false)} />}

        {isDelete && (
          <PopUp
            title={"Delete Product?"}
            message={"Are you sure you want to delete this product?"}
            onClose={() => setIsDelete(false)}
            onConfirm={() => handleDelete(item?.id)}
          />
        )}

        {isUnDelete && (
          <PopUp
            title={"Undo Delete Product?"}
            message={"Are you sure you want to undo delete this product?"}
            onClose={() => setIsUnDelete(false)}
            onConfirm={() => handleUnDelete(item?.id)}
          />
        )}

        {/* Update Product Popup */}
        {isUpdate && (
          <AddProductPopup
            productId={item?.id}
            initialData={item}
            onClose={() => setIsUpdate(false)}
            onSuccess={() => {
              // Refresh products list
              axios.get(`/products/all`).then((res) => {
                setItems(res.data);
                setFilteredItems(res.data);
              });
            }}
          />
        )}
        {/* Add Product Popup */}
        {isAddProductOpen && (
          <AddProductPopup
            onClose={() => setIsAddProductOpen(false)}
            onSuccess={() => {
              // Refresh products list
              axios.get(`/products/all`).then((res) => {
                setItems(res.data);
                setFilteredItems(res.data);
              });
            }}
          />
        )}
      </div>
    </>
  );
}

export default Catalog;
