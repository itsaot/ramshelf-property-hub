import { Navigate } from "react-router-dom";
import { isAuthenticated, getUser } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireLandlord?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin, requireLandlord }: ProtectedRouteProps) => {
  const authenticated = isAuthenticated();
  const user = getUser();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (requireLandlord && user?.role !== 'landlord') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
