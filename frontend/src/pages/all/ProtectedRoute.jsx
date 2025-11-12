import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { authenticated, loading, dataLoaded, user, roles } = useAuth();

  // Đang load
  if (loading || !dataLoaded) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!authenticated) {
    return <Navigate to="/home" replace />;
  }

  // Chưa có user data
  if (!user) {
    return <Navigate to="/home" replace />;
  }

  // Kiểm tra role nếu có yêu cầu
  if (requiredRole && !roles.includes(requiredRole)) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
