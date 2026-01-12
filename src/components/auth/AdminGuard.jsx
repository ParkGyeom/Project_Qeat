import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const KEY = "admin_session";

const AdminGuard = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const session = raw ? JSON.parse(raw) : null;
    if (!session?.ok) return <Navigate to="/admin/login" replace />;
    return <Outlet />;
  } catch {
    return <Navigate to="/admin/login" replace />;
  }
};

export default AdminGuard;
