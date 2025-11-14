import { Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import LoginPage from "./pages/all/LoginPage";
import ProtectedRoute from "./pages/all/ProtectedRoute";
import POSCheckout from "./pages/cashier/POSCheckout";
import Catalog from "./pages/warehouse/Catalog";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
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
        path="/warehouse"
        element={
          <ProtectedRoute requiredRole="WAREHOUSE">
            <Catalog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="MANAGER">
            {/* Your admin component */}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
