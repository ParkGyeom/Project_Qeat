import React from "react";
import { Routes, Route } from "react-router-dom";

// 레이아웃
import GuestLayout from "./layouts/GuestLayout";
import AdminLayout from "./layouts/AdminLayout";

// 페이지 (손님)
import MenuPage from "./pages/Guest/MenuPage";

// 페이지 (사장님)
import OwnerLogin from "./pages/Owner/OwnerLogin";
import OrderManage from "./pages/Owner/OrderManage";
import MenuManage from "./pages/Owner/MenuManage";
import SalesManage from "./pages/Owner/SalesManage";

// 페이지 (관리자)
import AdminLogin from "./pages/Admin/AdminLogin";
import ApprovalManage from "./pages/Admin/ApprovalManage";
import StoreList from "./pages/Admin/StoreList";

const App = () => {
  return (
    <Routes>
      {/* 1. 손님 화면 */}
      <Route element={<GuestLayout />}>
        <Route path="/" element={<MenuPage />} />
      </Route>

      {/* 2. 사장님 (Login & Pages) */}
      <Route path="/owner/login" element={<OwnerLogin />} />
      <Route element={<AdminLayout />}>
        <Route path="/owner/orders" element={<OrderManage />} />
        <Route path="/owner/menu" element={<MenuManage />} />
        <Route path="/owner/sales" element={<SalesManage />} />
      </Route>

      {/* 3. 관리자 (Login & Pages) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route path="/admin/approval" element={<ApprovalManage />} />
        <Route path="/admin/stores" element={<StoreList />} />
      </Route>
    </Routes>
  );
};

export default App;
