import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Save, Search, Tag } from "lucide-react";
import axios from "../../contexts/axios";
import Header from "../../components/all/Header";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    cardPattern: "",
    isActive: true,
    startDate: "",
    endDate: "",
    priority: 0,
  });

  // get coupons
  const fetchCoupons = async () => {
    try {
      const response = await axios.get("/coupons/getAll");
      setCoupons(response.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // create coupon
  const handleCreate = async (data) => {
    try {
      const response = await axios.post("/coupons/create", data);
      const newCoupon = response.data;

      setCoupons([...coupons, newCoupon]);
      toast.success("Coupon created successfully!");
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error("Failed to create coupon!");
    }
  };

  // TODO: Thay thế bằng API call: PUT /api/coupons/{id}
  const handleUpdate = async (id, data) => {
    try {
      const response = await axios.put(`/coupons/update/${id}`, data);
      const updatedCoupon = response.data;

      setCoupons(coupons.map((c) => (c.id === id ? updatedCoupon : c)));
      toast.success("Coupon updated successfully!");
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error("Failed to update coupon!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await axios.delete(`/coupons/delete/${id}`);

      setCoupons(coupons.filter((c) => c.id !== id));
      toast.success("Coupon deleted successfully!");
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon!");
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
        cardPattern: "",
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
      alert("Please enter applicable product codes!");
      return;
    }

    if (
      formData.type === "TOTAL" &&
      (!formData.minOrderAmount || formData.minOrderAmount <= 0)
    ) {
      alert("Please enter a valid minimum order amount!");
      return;
    }

    if (formData.type === "HOLIDAY") {
      if (!formData.holidayCode.trim()) {
        alert("Please enter a holiday code!");
        return;
      }
      if (!formData.holidayStartDate || !formData.holidayEndDate) {
        alert("Please select holiday start and end dates!");
        return;
      }
    }

    if (
      formData.type === "PRODUCT" &&
      !formData.applicableProductCodes.trim() &&
      !formData.productCodePattern.trim()
    ) {
      alert(
        "Please enter either applicable product codes or a product code pattern!"
      );
      return;
    }

    // Validate giá trị giảm giá
    if (
      (!formData.amount || formData.amount <= 0) &&
      (!formData.percentageDiscount || formData.percentageDiscount <= 0)
    ) {
      alert("Please enter either an amount or a percentage discount!");
      return;
    }

    // Validate ngày hiệu lực
    if (!formData.startDate || !formData.endDate) {
      alert("Please select start and end dates!");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert("Start date must be before end date!");
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
      PRODUCT: "Product",
      COMBO: "Combo",
      TOTAL: "Total",
      HOLIDAY: "Holiday",
      CUSTOMER: "Customer",
    };
    return labels[type] || type;
  };

  const getCouponTypeBadgeColor = (type) => {
    const colors = {
      PRODUCT: "bg-blue-100 text-blue-800",
      COMBO: "bg-purple-100 text-purple-800",
      TOTAL: "bg-slate-100 text-slate-800",
      HOLIDAY: "bg-orange-100 text-orange-800",
      CUSTOMER: "bg-amber-100 text-amber-800",
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
                  placeholder="Search..."
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
                <option value="ALL">All</option>
                <option value="PRODUCT">Product</option>
                <option value="COMBO">Combo</option>
                <option value="TOTAL">Total</option>
                <option value="HOLIDAY">Holiday</option>
                <option value="CUSTOMER">Customer</option>
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
                        {coupon.isActive ? "Active" : "Inactive"}
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
                          Discount {coupon.amount.toLocaleString("vi-VN")}đ
                        </p>
                      )}
                      {coupon.percentageDiscount > 0 && (
                        <p className="text-red-600 font-bold text-lg">
                          Discount {coupon.percentageDiscount}%
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(coupon)}
                        className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
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
                  {editingCoupon ? "Edit Coupon" : "Create Coupon"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-red-700 p-2 rounded-full transition-all cursor-pointer"
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
                    Coupon Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                  >
                    <option value="PRODUCT">Product</option>
                    <option value="COMBO">Combo</option>
                    <option value="TOTAL">Total</option>
                    <option value="HOLIDAY">Holiday</option>
                    <option value="CUSTOMER">Customer</option>
                  </select>
                </div>

                {/* Thông tin cơ bản */}
                <div className="mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Coupon Name *
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
                    Description
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
                      Discount amount (đ)
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
                      Discount percentage (%)
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
                      Combo product codes (separated by commas)
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
                      Minimum order amount (đ)
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
                        Holiday code
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
                          Holiday start date
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
                          Holiday end date
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
                        Product code (separated by commas)
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
                        Product code pattern (separated by commas)
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
                {formData.type === "CUSTOMER" && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Card pattern (separated by commas)
                      </label>
                      <input
                        type="text"
                        name="cardPattern"
                        value={formData.cardPattern}
                        onChange={handleInputChange}
                        placeholder="CCARD.*, GCARD.*"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Thời gian hiệu lực */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date
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
                      End Date
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
                      Active
                    </span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-600 transition-all shadow-lg cursor-pointer"
                  >
                    <Save className="w-5 h-5" />
                    {editingCoupon ? "Update" : "Create"}
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
