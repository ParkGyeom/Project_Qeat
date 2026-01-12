import React from "react";
// ✅ Navigate 추가 (자동 이동 기능)
import { Routes, Route, Navigate } from "react-router-dom";

import GuestLayout from "./layouts/GuestLayout";
import AdminLayout from "./layouts/AdminLayout";
import OwnerGuard from "./components/auth/OwnerGuard";

import MenuPage from "./pages/Guest/MenuPage";
import OwnerLogin from "./pages/Owner/OwnerLogin";
import OwnerSignup from "./pages/Owner/OwnerSignup";
import OrderManage from "./pages/Owner/OrderManage";
import MenuManage from "./pages/Owner/MenuManage";
import SalesManage from "./pages/Owner/SalesManage";
import BusinessManage from "./pages/Owner/BusinessManage";

import AdminLogin from "./pages/Admin/AdminLogin";
import ApprovalManage from "./pages/Admin/ApprovalManage";
import StoreList from "./pages/Admin/StoreList";
import AdminPinManage from "./pages/Admin/AdminPinManage";

const App = () => {
  return (
    <Routes>
      {/* 1. 손님 화면 */}
      <Route element={<GuestLayout />}>
        {/* ✅ [추가] 그냥 '/'로 들어오면 '/guest/menu'로 토스해라! */}
        <Route path="/" element={<Navigate to="/guest/menu" replace />} />

        <Route path="/guest/menu" element={<MenuPage />} />
      </Route>

      {/* 2. 사장님 (Login & Signup) */}
      <Route path="/owner/login" element={<OwnerLogin />} />
      <Route path="/owner/signup" element={<OwnerSignup />} />

      {/* 2-1. 사장님 보호 라우트 */}
      <Route element={<OwnerGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/owner/orders" element={<OrderManage />} />
          <Route path="/owner/menu" element={<MenuManage />} />
          <Route path="/owner/sales" element={<SalesManage />} />
          <Route path="/owner/business" element={<BusinessManage />} />
        </Route>
      </Route>

      {/* 3. 관리자 */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route path="/admin/approval" element={<ApprovalManage />} />
        <Route path="/admin/stores" element={<StoreList />} />
        <Route path="/admin/settings" element={<AdminPinManage />} />
      </Route>
    </Routes>
  );
};

export default App;
