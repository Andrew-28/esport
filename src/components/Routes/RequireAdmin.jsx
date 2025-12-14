// наприклад src/containers/Admin/RequireAdmin.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../containers/Navigation/AuthContext";

const RequireAdmin = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return null;

  if (
    !isAuthenticated ||
    !user ||
    (user.role !== "admin" && user.role !== "superadmin")
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAdmin;
