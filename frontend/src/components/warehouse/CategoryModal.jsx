function CategoryModal({
  setIsCategoryModalOpen,
  setIsAddCategory,
  setSelectedCategoryData,
  categories,
  setIsEditCategory,
  setIsDeleteCategory,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Manage Categories</h2>
          <button
            onClick={() => setIsCategoryModalOpen(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Add Category Button */}
          <button
            onClick={() => {
              setIsAddCategory(true);
              setSelectedCategoryData(null);
            }}
            className="w-full mb-4 px-4 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Category
          </button>

          {/* Categories List */}
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <span className="font-medium text-gray-800">
                  {category.name}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategoryData(category);
                      setIsEditCategory(true);
                    }}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategoryData(category);
                      setIsDeleteCategory(true);
                    }}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CategoryModal;
