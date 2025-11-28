import { useState, useEffect } from "react";
import { Search, Plus, Edit2, UserX } from "lucide-react";
import CustomerModal from "../../components/marketing/CutomerModal";
import axios from "../../contexts/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../components/all/Header";

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    cardNumber: "",
    gender: "MALE",
    dateOfBirth: "",
    rewardPoints: 0,
    tierPoints: 100,
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get("/customers");
        setCustomers(response.data);
        setFilteredCustomers(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách khách hàng:", error.message);
        // Có thể thêm toast notification hoặc alert ở đây
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter((customer) =>
      customer.cardNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingCustomer) {
      // Update existing customer
      try {
        const response = await axios.put(
          `/customers/update/${editingCustomer.id}`,
          formData
        );
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === editingCustomer.id
              ? response.data // Dùng data từ backend thay vì formData
              : c
          )
        );
        toast.success("Customer updated successfully!");
      } catch (err) {
        console.log(err);
        toast.error("Failed to update customer!");
      }
    } else {
      // Add new customer
      try {
        const response = await axios.post("/customers/create", formData);
        setCustomers((prev) => [...prev, response.data]); // Dùng data từ backend
        toast.success("Customer created successfully!");
      } catch (err) {
        console.log(err);
        toast.error("Failed to create customer!");
      }
    }
    resetForm();
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      fullName: customer.fullName,
      email: customer.email,
      cardNumber: customer.cardNumber,
      gender: customer.gender,
      dateOfBirth: customer.dateOfBirth,
      rewardPoints: customer.rewardPoints, // Sửa từ points
      tierPoints: customer.tierPoints, // Thêm tierPoints
    });
    setShowModal(true);
  };

  const handleDeactivate = (customerId) => {
    if (window.confirm("Are you sure you want to disable this card?")) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, active: false } : c))
      );
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      cardNumber: "",
      gender: "MALE",
      dateOfBirth: "",
      points: 0,
      tierPoints: 100,
    });
    setEditingCustomer(null);
    setShowModal(false);
  };

  const getTierColor = (tier) => {
    const colors = {
      COPPER: "bg-amber-700 text-white",
      SLIVER: "bg-gray-200 text-gray-500",
      GOLD: "bg-yellow-500 text-gray-800",
      PLATINUM: "bg-slate-400 text-gray-800",
      DIAMOND: "bg-blue-500 text-white",
    };
    return colors[tier] || "bg-gray-300 text-gray-800";
  };

  return (
    <>
      <Header currentPage="Customer" menu="marketing" />

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Loyalty Management
              </h1>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer"
              >
                <Plus size={20} />
                Add Member
              </button>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by card number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Full Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Card Code
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Gender
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Birthday
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Reward Points
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Tier Points
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Tier
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Controll
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className={`hover:bg-gray-50 ${
                        !customer.active ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {customer.fullName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {customer.email}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-800">
                        {customer.cardNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {customer.gender}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(customer.dateOfBirth).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-semibold">
                        {customer.rewardPoints}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-semibold">
                        {customer.tierPoints}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getTierColor(
                            customer.membershipTier
                          )}`}
                        >
                          {customer.membershipTier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            customer.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {customer.active ? "Active" : "Disable"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          {customer.active && (
                            <button
                              onClick={() => handleDeactivate(customer.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Disable"
                            >
                              <UserX size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showModal && (
          <CustomerModal
            editingCustomer={editingCustomer}
            resetForm={resetForm}
            handleSubmit={handleSubmit}
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}
      </div>
    </>
  );
};

export default Customer;
