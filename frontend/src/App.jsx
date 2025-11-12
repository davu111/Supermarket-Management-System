import { Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import POSCheckout from "./pages/staff/POSCheckout";
import LoginPage from "./pages/all/LoginPage";
import ProtectedRoute from "./pages/all/ProtectedRoute";

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
