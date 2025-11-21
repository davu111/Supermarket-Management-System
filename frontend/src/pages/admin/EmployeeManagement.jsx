import React, { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  X,
  Save,
  KeyRound,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import axios from "../../contexts/axios";
import Header from "../../components/all/Header";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState({
    id: "",
    name: "",
    email: "",
    role: "CASHIER",
  });
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [newCredentials, setNewCredentials] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const roles = ["CASHIER", "WAREHOUSE", "MARKETING", "ADMIN"];

  const roleTranslations = {
    CASHIER: "Cashier",
    WAREHOUSE: "Warehouse",
    MARKETING: "Marketing",
    ADMIN: "Admin",
  };

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Auto hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/employees");
      setEmployees(response.data);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Unable to load employee list",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentEmployee({
      id: "",
      name: "",
      email: "",
      role: "CASHIER",
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setCurrentEmployee(employee);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;

    try {
      await axios.delete(`/employees/${id}`);
      showToast("Employee deleted successfully", "success");
      fetchEmployees();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Unable to delete employee",
        "error"
      );
    }
  };

  const handleResetPassword = async (employee) => {
    if (
      !window.confirm(
        `Are you sure you want to reset the employee's password for "${employee.name}"?`
      )
    )
      return;

    try {
      const response = await axios.post(
        `/employees/${employee.id}/reset-password`
      );
      setNewCredentials(response.data);
      setShowCredentials(true);
      showToast("Password reset successful", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Unable to reset password",
        "error"
      );
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await axios.put(`/employees/${currentEmployee.id}`, currentEmployee);
        showToast("Employee update successful", "success");
        setIsModalOpen(false);
        fetchEmployees();
      } else {
        const response = await axios.post("/employees", currentEmployee);
        setIsModalOpen(false);

        // Fetch credentials for newly created employee
        const credResponse = await axios.get(
          `/employees/${response.data.id}/credentials`
        );
        setNewCredentials(credResponse.data);
        setShowCredentials(true);
        showToast("Create successful employees", "success");

        fetchEmployees();
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Have an error";
      showToast(message, "error");
      console.error("Error saving employee:", error);
    }
  };

  return (
    <>
      <Header currentPage="Employee" menu="admin" />
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-9999 animate-slide-in">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === "success"
                ? "bg-green-50 border border-green-200"
                : toast.type === "error"
                ? "bg-red-50 border border-red-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}
          >
            {toast.type === "success" && (
              <CheckCircle className="text-green-600" size={20} />
            )}
            {toast.type === "error" && (
              <XCircle className="text-red-600" size={20} />
            )}
            {toast.type === "warning" && (
              <AlertCircle className="text-yellow-600" size={20} />
            )}
            <span
              className={`text-sm font-medium ${
                toast.type === "success"
                  ? "text-green-800"
                  : toast.type === "error"
                  ? "text-red-800"
                  : "text-yellow-800"
              }`}
            >
              {toast.message}
            </span>
            <button
              onClick={() => setToast({ show: false, message: "", type: "" })}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Employee Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Information management and employee authorization
                </p>
              </div>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer"
              >
                <Plus size={20} />
                Add employee
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Đang tải...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        Controll
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {employee.name}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                              employee.role === "ADMIN"
                                ? "bg-purple-100 text-purple-800"
                                : employee.role === "MARKETING"
                                ? "bg-green-100 text-green-800"
                                : employee.role === "WAREHOUSE"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {roleTranslations[employee.role]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {employee.email}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(employee)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleResetPassword(employee)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                              title="Reset mật khẩu"
                            >
                              <KeyRound size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(employee.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Xóa"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {employees.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No employees yet. Click "Add Employee" to get started.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? "Edit staff" : "Create new staff"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Name
                  </label>
                  <input
                    type="text"
                    value={currentEmployee.name}
                    onChange={(e) =>
                      setCurrentEmployee({
                        ...currentEmployee,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={currentEmployee.email}
                    onChange={(e) =>
                      setCurrentEmployee({
                        ...currentEmployee,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={currentEmployee.role}
                    onChange={(e) =>
                      setCurrentEmployee({
                        ...currentEmployee,
                        role: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {roleTranslations[role]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    <Save size={18} />
                    {isEditing ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Credentials Modal */}
        {showCredentials && newCredentials && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  Login information
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-4">
                    Please save the following login information:
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Employee name
                      </label>
                      <div className="bg-white px-3 py-2 rounded border border-gray-300">
                        <span className="text-sm font-medium">
                          {newCredentials.name}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Username
                      </label>
                      <div className="bg-white px-3 py-2 rounded border border-gray-300">
                        <span className="text-sm font-mono">
                          {newCredentials.username}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Password
                      </label>
                      <div className="bg-white px-3 py-2 rounded border border-gray-300">
                        <span className="text-sm font-mono">
                          {newCredentials.username}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Role
                      </label>
                      <div className="bg-white px-3 py-2 rounded border border-gray-300">
                        <span className="text-sm">
                          {roleTranslations[newCredentials.role]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Lưu ý:</strong> This information will only be
                    displayed once. Please save before closing.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowCredentials(false);
                    setNewCredentials(null);
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Information saved
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EmployeeManagement;
