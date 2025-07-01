// src/utils/ProtectedRoutes.tsx
import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface GuardProps {
  children?: ReactNode;           // Optional, lets you nest layouts
}

/* ---------- USER ---------- */
export const UserProtectedRoute = ({ children }: GuardProps) => {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/login" replace />;
  return children ? <>{children}</> : <Outlet />;
};

/* ---------- ADMIN ---------- */
export const AdminProtectedRoute = ({ children }: GuardProps) => {
  const adminToken = localStorage.getItem("adminAccessToken");
  if (!adminToken) return <Navigate to="/adminlogin" replace />;
  return children ? <>{children}</> : <Outlet />;
};
