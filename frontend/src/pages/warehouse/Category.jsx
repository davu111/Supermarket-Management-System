import { useState, useEffect } from "react";
import { Trash2, Edit2, Plus, X, Check } from "lucide-react";
import axios from "../../contexts/axios";
import Header from "../../components/all/Header";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  // Lấy danh sách danh mục
  const fetchCategories = () => {
    axios
      .get(`/categories/all`)
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Thêm danh mục mới
  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const newCategory = await axios.post(`/categories/create`, {
          name: newCategoryName.trim(),
        });
        setCategories([...categories, newCategory.data]);
        setNewCategoryName("");
      } catch (err) {
        console.log(err);
      }
    }
  };

  // Bắt đầu chỉnh sửa
  const handleStartEdit = (category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  // Lưu chỉnh sửa
  const handleSaveEdit = async (id) => {
    if (editingName.trim()) {
      try {
        await axios.put(`/categories/update/${id}`, {
          name: editingName.trim(),
        });
        setCategories(
          categories.map((cat) =>
            cat.id === id ? { ...cat, name: editingName } : cat
          )
        );
        setEditingId(null);
        setEditingName("");
      } catch (err) {
        console.log(err);
      }
    }
  };

  // Hủy chỉnh sửa
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  // Xóa danh mục
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        axios.delete(`/categories/delete/${id}`);
        setCategories(categories.filter((cat) => cat.id !== id));
      } catch (err) {
        console.log(err);
      }
    }
  };

  // Xử lý Enter khi thêm mới
  const handleKeyPressAdd = (e) => {
    if (e.key === "Enter") {
      handleAddCategory();
    }
  };

  // Xử lý Enter khi chỉnh sửa
  const handleKeyPressEdit = (e, id) => {
    if (e.key === "Enter") {
      handleSaveEdit(id);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <>
      <Header currentPage="Category" menu="warehouse" />
      <div className="min-h-screen bg-linear-to-br from-red-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-white px-8 py-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Product Categories Management
              </h1>
              <p className="text-gray-600 mt-2">
                Add, edit, delete categories easily
              </p>
            </div>

            {/* Form thêm mới */}
            <div className="p-8 border-b border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={handleKeyPressAdd}
                    placeholder="Enter name new category..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <button
                  onClick={handleAddCategory}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition shadow-md hover:shadow-lg cursor-pointer"
                >
                  <Plus size={20} />
                  Add new category
                </button>
              </div>
            </div>

            {/* Bảng danh mục */}
            <div className="p-8">
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        No
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categories.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          There are no categories yet. Please add a new
                          category!
                        </td>
                      </tr>
                    ) : (
                      categories.map((category, index) => (
                        <tr
                          key={category.id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 text-gray-700">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4">
                            {editingId === category.id ? (
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) =>
                                  handleKeyPressEdit(e, category.id)
                                }
                                className="w-full px-3 py-2 border border-red-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                autoFocus
                              />
                            ) : (
                              <span className="text-gray-900 font-medium">
                                {category.name}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              {editingId === category.id ? (
                                <>
                                  <button
                                    onClick={() => handleSaveEdit(category.id)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition cursor-pointer"
                                    title="Done"
                                  >
                                    <Check size={20} />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X size={20} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStartEdit(category)}
                                    className="p-2 text-blue-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit2 size={20} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(category.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 size={20} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
