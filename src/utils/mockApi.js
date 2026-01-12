// src/utils/mockApi.js
import { isBusinessClosedToday, ensureAutoCloseToday } from "./businessStatus";
import { getStoreName } from "./storeInfo"; // ✅ 가게 이름 가져오기 추가

/* =========================
   Store-aware Keys (동적 키 생성)
   로그인한 가게 이름에 따라 저장소 키가 바뀝니다.
========================= */
const getMenuKey = () => `qeat_menus_${getStoreName()}`;
const getOrderKey = () => `qeat_orders_${getStoreName()}`;

/* =========================
   메뉴 관련
========================= */
export const getMenus = () => {
  const key = getMenuKey(); // ✅ 현재 가게 키 사용
  const raw = localStorage.getItem(key);
  // 저장된 게 없으면 빈 배열 [] 반환 (초기 데이터 없음)
  return raw ? JSON.parse(raw) : [];
};

export const addMenu = (menu) => {
  const key = getMenuKey(); // ✅
  const current = getMenus();
  const newMenu = {
    ...menu,
    id: Date.now(),
    isSoldOut: false,
  };
  const next = [...current, newMenu];
  localStorage.setItem(key, JSON.stringify(next));
  return newMenu;
};

export const deleteMenu = (id) => {
  const key = getMenuKey(); // ✅
  const next = getMenus().filter((m) => m.id !== id);
  localStorage.setItem(key, JSON.stringify(next));
};

export const updateMenu = (updatedMenu) => {
  const key = getMenuKey(); // ✅
  const next = getMenus().map((m) =>
    m.id === updatedMenu.id ? updatedMenu : m
  );
  localStorage.setItem(key, JSON.stringify(next));
  return updatedMenu;
};

/* =========================
   주문 관련
========================= */
export const getOrders = () => {
  const key = getOrderKey(); // ✅ 현재 가게 키 사용
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
};

// ✅ 주문 생성 (매장별 + 영업 종료 시 차단)
export const createOrder = (orderData) => {
  // 마감시간 자동 체크
  ensureAutoCloseToday();

  if (isBusinessClosedToday()) {
    throw new Error("BUSINESS_CLOSED");
  }

  const key = getOrderKey(); // ✅
  const orders = getOrders();
  const now = new Date();

  const newOrder = {
    ...orderData,

    id: Date.now(),

    // 상태
    status: "접수대기",

    // 화면 표시용
    createdAt: now.toLocaleString(),

    // 매출 집계용 (주문 기준)
    orderTime: now.toISOString(),

    // 완료 기준용 (완료 시 기록)
    doneAt: null,
  };

  const next = [...orders, newOrder];
  localStorage.setItem(key, JSON.stringify(next));
  return newOrder;
};

// ✅ 주문 수정 (상태 변경 포함)
export const updateOrder = (updatedOrder) => {
  const key = getOrderKey(); // ✅
  const orders = getOrders();
  const prev = orders.find((o) => o.id === updatedOrder.id);

  if (!prev) return null;

  const next = {
    ...prev,
    ...updatedOrder,
  };

  // orderTime 보정
  if (!next.orderTime) {
    const d = new Date(next.id);
    next.orderTime = !isNaN(d.getTime())
      ? d.toISOString()
      : new Date().toISOString();
  }

  // 완료 기준 처리
  if (String(next.status).trim() === "처리완료") {
    if (!next.doneAt) next.doneAt = new Date().toISOString();
  } else {
    next.doneAt = null;
  }

  const result = orders.map((o) => (o.id === next.id ? next : o));
  localStorage.setItem(key, JSON.stringify(result));
  return next;
};
