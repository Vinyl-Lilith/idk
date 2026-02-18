import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, adminOnly = false, headAdminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user?.role !== 'admin' && user?.role !== 'head_admin') {
    return <Navigate to="/" />;
  }

  if (headAdminOnly && user?.role !== 'head_admin') {
    return <Navigate to="/" />;
  }

  return children;
};
