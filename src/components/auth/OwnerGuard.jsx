import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const SESSION_KEY = "owner_session";

const loadOwnerSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const OwnerGuard = () => {
  const session = loadOwnerSession();

  // ✅ 로그인 세션 없으면 사장님 로그인으로
  if (!session?.approved) {
    return <Navigate to="/owner/login" replace />;
  }

  return <Outlet />;
};

export default OwnerGuard;
