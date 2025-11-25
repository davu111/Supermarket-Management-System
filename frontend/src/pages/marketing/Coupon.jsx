import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Save, Search, Tag } from "lucide-react";
import axios from "../../contexts/axios";
import Header from "../../components/all/Header";

const Coupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const [formData, setFormData] = useState({
    type: "PRODUCT",
    name: "",
    description: "",
    amount: "",
    percentageDiscount: "",
    comboProductCodes: "",
    minOrderAmount: "",
    holidayCode: "",
    holidayStartDate: "",
    holidayEndDate: "",
    applicableProductCodes: "",
    productCodePattern: "",
    isActive: true,
    startDate: "",
    endDate: "",
    priority: 0,
  });

  const fetchCoupons = async () => {
    try {
      const response = await axios.get("/coupons/getAll");
      setCoupons(response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách coupon:", error);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (data) => {
    try {
      // const response = await fetch(`${API_BASE_URL}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // const newCoupon = await response.json();

      const response = await axios.post("/coupons/create", data);
      const newCoupon = response.data;

      setCoupons([...coupons, newCoupon]);
    } catch (error) {
      console.error("Lỗi khi tạo coupon:", error);
    }
  };

  // TODO: Thay thế bằng API call: PUT /api/coupons/{id}
  const handleUpdate = async (id, data) => {
    try {
      // const response = await fetch(`${API_BASE_URL}/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // const updatedCoupon = await response.json();

      setCoupons(coupons.map((c) => (c.id === id ? { ...data, id } : c)));
    } catch (error) {
      console.error("Lỗi khi cập nhật coupon:", error);
    }
  };

  // TODO: Thay thế bằng API call: DELETE /api/coupons/{id}
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa coupon này?")) return;

    try {
      // await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });

      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa coupon:", error);
    }
  };

  const openModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        ...coupon,
        startDate: coupon.startDate ? coupon.startDate.split("T")[0] : "",
        endDate: coupon.endDate ? coupon.endDate.split("T")[0] : "",
        holidayStartDate: coupon.holidayStartDate
          ? coupon.holidayStartDate.split("T")[0]
          : "",
        holidayEndDate: coupon.holidayEndDate
          ? coupon.holidayEndDate.split("T")[0]
          : "",
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        type: "PRODUCT",
        name: "",
        description: "",
        amount: "",
        percentageDiscount: "",
        comboProductCodes: "",
        minOrderAmount: "",
        holidayCode: "",
        holidayStartDate: "",
        holidayEndDate: "",
        applicableProductCodes: "",
        productCodePattern: "",
        isActive: true,
        startDate: "",
        endDate: "",
        priority: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate theo từng loại coupon
    if (formData.type === "COMBO" && !formData.comboProductCodes.trim()) {
      alert("Vui lòng nhập mã sản phẩm Combo!");
      return;
    }

    if (
      formData.type === "TOTAL" &&
      (!formData.minOrderAmount || formData.minOrderAmount <= 0)
    ) {
      alert("Vui lòng nhập giá trị đơn hàng tối thiểu!");
      return;
    }

    if (formData.type === "HOLIDAY") {
      if (!formData.holidayCode.trim()) {
        alert("Vui lòng nhập mã ngày lễ!");
        return;
      }
      if (!formData.holidayStartDate || !formData.holidayEndDate) {
        alert("Vui lòng nhập ngày bắt đầu và kết thúc ngày lễ!");
        return;
      }
    }

    if (
      formData.type === "PRODUCT" &&
      !formData.applicableProductCodes.trim() &&
      !formData.productCodePattern.trim()
    ) {
      alert("Vui lòng nhập mã sản phẩm hoặc pattern mã sản phẩm!");
      return;
    }

    // Validate giá trị giảm giá
    if (
      (!formData.amount || formData.amount <= 0) &&
      (!formData.percentageDiscount || formData.percentageDiscount <= 0)
    ) {
      alert("Vui lòng nhập số tiền giảm giá hoặc phần trăm giảm giá!");
      return;
    }

    // Validate ngày hiệu lực
    if (!formData.startDate || !formData.endDate) {
      alert("Vui lòng nhập ngày bắt đầu và kết thúc!");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert("Ngày bắt đầu phải trước ngày kết thúc!");
      return;
    }

    if (editingCoupon) {
      handleUpdate(editingCoupon.id, formData);
    } else {
      handleCreate(formData);
    }

    closeModal();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || coupon.type === filterType;
    return matchesSearch && matchesType;
  });

  const getCouponTypeLabel = (type) => {
    const labels = {
      PRODUCT: "Sản phẩm",
      COMBO: "Combo",
      TOTAL: "Tổng đơn",
      HOLIDAY: "Ngày lễ",
    };
    return labels[type] || type;
  };

  const getCouponTypeBadgeColor = (type) => {
    const colors = {
      PRODUCT: "bg-blue-100 text-blue-800",
      COMBO: "bg-purple-100 text-purple-800",
      TOTAL: "bg-green-100 text-green-800",
      HOLIDAY: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      <Header currentPage="Coupon" menu="marketing" />
      <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-t-2xl shadow-xl p-6 text-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">Coupon Management</h1>
              </div>
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 cursor-pointer transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Add Coupon
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm coupon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
              >
                <option value="ALL">Tất cả loại</option>
                <option value="PRODUCT">Sản phẩm</option>
                <option value="COMBO">Combo</option>
                <option value="TOTAL">Tổng đơn</option>
                <option value="HOLIDAY">Ngày lễ</option>
              </select>
            </div>
          </div>

          {/* Coupon List */}
          <div className="bg-white rounded-b-2xl shadow-xl p-6">
            {filteredCoupons.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Không tìm thấy coupon nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="border-2 border-gray-200 rounded-xl p-5 hover:border-red-400 hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getCouponTypeBadgeColor(
                          coupon.type
                        )}`}
                      >
                        {getCouponTypeLabel(coupon.type)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          coupon.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {coupon.isActive ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {coupon.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {coupon.description}
                    </p>

                    <div className="bg-linear-to-r from-red-50 to-orange-50 rounded-lg p-3 mb-4">
                      {coupon.amount > 0 && (
                        <p className="text-red-600 font-bold text-lg">
                          Giảm {coupon.amount.toLocaleString("vi-VN")}đ
                        </p>
                      )}
                      {coupon.percentageDiscount > 0 && (
                        <p className="text-red-600 font-bold text-lg">
                          Giảm {coupon.percentageDiscount}%
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(coupon)}
                        className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
              <div className="bg-linear-to-r from-red-600 to-red-500 text-white p-6 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingCoupon ? "Chỉnh sửa Coupon" : "Thêm Coupon mới"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-red-700 p-2 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 max-h-[70vh] overflow-y-auto"
              >
                {/* Loại coupon */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loại Coupon *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                  >
                    <option value="PRODUCT">Sản phẩm</option>
                    <option value="COMBO">Combo</option>
                    <option value="TOTAL">Tổng đơn hàng</option>
                    <option value="HOLIDAY">Ngày lễ</option>
                  </select>
                </div>

                {/* Thông tin cơ bản */}
                <div className="mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên Coupon *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Giá trị giảm giá */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giảm số tiền (đ)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giảm phần trăm (%)
                    </label>
                    <input
                      type="number"
                      name="percentageDiscount"
                      value={formData.percentageDiscount}
                      onChange={handleInputChange}
                      step="0.01"
                      max="100"
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Điều kiện theo loại */}
                {formData.type === "COMBO" && (
                  <div className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mã sản phẩm Combo (phân cách bằng dấu phấy)
                    </label>
                    <input
                      type="text"
                      name="comboProductCodes"
                      value={formData.comboProductCodes}
                      onChange={handleInputChange}
                      placeholder="SUA001,BMI001"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                )}

                {formData.type === "TOTAL" && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giá trị đơn hàng tối thiểu (đ)
                    </label>
                    <input
                      type="number"
                      name="minOrderAmount"
                      value={formData.minOrderAmount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="1"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    />
                  </div>
                )}

                {formData.type === "HOLIDAY" && (
                  <div className="mb-6 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mã ngày lễ
                      </label>
                      <input
                        type="text"
                        name="holidayCode"
                        value={formData.holidayCode}
                        onChange={handleInputChange}
                        placeholder="TET, NOEL, etc."
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ngày bắt đầu lễ
                        </label>
                        <input
                          type="date"
                          name="holidayStartDate"
                          value={formData.holidayStartDate}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ngày kết thúc lễ
                        </label>
                        <input
                          type="date"
                          name="holidayEndDate"
                          value={formData.holidayEndDate}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.type === "PRODUCT" && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mã sản phẩm áp dụng (phân cách bằng dấu phấy)
                      </label>
                      <input
                        type="text"
                        name="applicableProductCodes"
                        value={formData.applicableProductCodes}
                        onChange={handleInputChange}
                        placeholder="SUA001,SUA002"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pattern mã sản phẩm (Regex)
                      </label>
                      <input
                        type="text"
                        name="productCodePattern"
                        value={formData.productCodePattern}
                        onChange={handleInputChange}
                        placeholder="SUA.*, BMI.*"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Thời gian hiệu lực */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Trạng thái */}
                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Kích hoạt coupon
                    </span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-600 transition-all shadow-lg"
                  >
                    <Save className="w-5 h-5" />
                    {editingCoupon ? "Cập nhật" : "Tạo mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Coupon;
