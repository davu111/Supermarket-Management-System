import { Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import LoginPage from "./pages/all/LoginPage";
import ProtectedRoute from "./pages/all/ProtectedRoute";
import POSCheckout from "./pages/cashier/POSCheckout";
import Catalog from "./pages/warehouse/Catalog";
import Transaction from "./pages/warehouse/Transaction";
import TransactionHistory from "./pages/warehouse/TransactionHistory";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import Customer from "./pages/marketing/Customer";
import Coupon from "./pages/marketing/Coupon";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route
        path="/warehouse"
        element={<Navigate to="/warehouse/products" />}
      />
      <Route path="/admin" element={<Navigate to="/admin/employees" />} />
      <Route
        path="/marketing"
        element={<Navigate to="/marketing/customers" />}
      />

      <Route path="/home" element={<LoginPage />} />
      <Route
        path="/cash"
        element={
          <ProtectedRoute requiredRole="CASHIER">
            <POSCheckout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouse/products"
        element={
          <ProtectedRoute requiredRole="WAREHOUSE">
            <Catalog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouse/transactions"
        element={
          <ProtectedRoute requiredRole="WAREHOUSE">
            <Transaction />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouse/history"
        element={
          <ProtectedRoute requiredRole="WAREHOUSE">
            <TransactionHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <EmployeeManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketing/customers"
        element={
          <ProtectedRoute requiredRole="MARKETING">
            <Customer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketing/coupons"
        element={
          <ProtectedRoute requiredRole="MARKETING">
            <Coupon />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
