// src/utils/businessStatus.js
import { withStoreKey } from "./storeKey";

const SALES_CLOSINGS_KEY = "sales_closings_v1";
const CLOSE_TIME_KEY = "sales_close_time_v1"; // { "YYYY-MM-DD": "HH:mm" }
const SALES_OVERRIDE_KEY = "sales_override_v1"; // ✨ 추가: 강제 영업 여부 저장

const pad2 = (n) => String(n).padStart(2, "0");
const toISO = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const getTodayISO = () => toISO(new Date());

/* -----------------------------
   (추가) 전역키 → 매장키 마이그레이션 (1회성)
------------------------------ */
const migrateIfNeeded = () => {
  try {
    const skClosings = withStoreKey(SALES_CLOSINGS_KEY);
    const skCloseTime = withStoreKey(CLOSE_TIME_KEY);
    const skOverride = withStoreKey(SALES_OVERRIDE_KEY); // ✨

    const globalClosingsRaw = localStorage.getItem(SALES_CLOSINGS_KEY);
    const storeClosingsRaw = localStorage.getItem(skClosings);
    if (globalClosingsRaw && !storeClosingsRaw) {
      localStorage.setItem(skClosings, globalClosingsRaw);
    }

    const globalCloseTimeRaw = localStorage.getItem(CLOSE_TIME_KEY);
    const storeCloseTimeRaw = localStorage.getItem(skCloseTime);
    if (globalCloseTimeRaw && !storeCloseTimeRaw) {
      localStorage.setItem(skCloseTime, globalCloseTimeRaw);
    }

    // 오버라이드 키도 마이그레이션 (혹시 모를 상황 대비)
    const globalOverrideRaw = localStorage.getItem(SALES_OVERRIDE_KEY);
    const storeOverrideRaw = localStorage.getItem(skOverride);
    if (globalOverrideRaw && !storeOverrideRaw) {
      localStorage.setItem(skOverride, globalOverrideRaw);
    }
  } catch {}
};

const loadObj = (key, fallback = {}) => {
  migrateIfNeeded();
  try {
    const raw = localStorage.getItem(withStoreKey(key));
    const parsed = raw ? JSON.parse(raw) : fallback;
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const saveObj = (key, obj) => {
  migrateIfNeeded();
  try {
    localStorage.setItem(withStoreKey(key), JSON.stringify(obj));
  } catch {}
};

/* =========================
   영업 종료 여부
========================= */
export const isBusinessClosedToday = () => {
  const closings = loadObj(SALES_CLOSINGS_KEY, {});
  const todayISO = getTodayISO();
  return !!closings?.[todayISO];
};

/* =========================
   사장님: 오늘 영업 마감 / 재개
========================= */
export const closeBusinessToday = () => {
  const todayISO = getTodayISO();
  const closings = loadObj(SALES_CLOSINGS_KEY, {});

  closings[todayISO] = {
    ...(typeof closings[todayISO] === "object" ? closings[todayISO] : {}),
    closedAt: new Date().toISOString(),
    manual: true,
  };
  saveObj(SALES_CLOSINGS_KEY, closings);

  // 수동 마감 시, 기존의 '강제 영업' 의지는 삭제 (초기화)
  const overrides = loadObj(SALES_OVERRIDE_KEY, {});
  if (overrides[todayISO]) {
    delete overrides[todayISO];
    saveObj(SALES_OVERRIDE_KEY, overrides);
  }
};

export const reopenBusinessToday = () => {
  const todayISO = getTodayISO();

  // 1. 마감 상태 해제
  const closings = loadObj(SALES_CLOSINGS_KEY, {});
  delete closings[todayISO];
  saveObj(SALES_CLOSINGS_KEY, closings);

  // 2. ✨ 핵심 로직: 현재 시간이 마감 시간을 지났는지 확인
  const closeTime = getCloseTimeToday(); // "HH:mm"
  if (closeTime) {
    const [hh, mm] = closeTime.split(":").map(Number);
    const now = new Date();
    const closeAt = new Date();
    closeAt.setHours(hh, mm, 0, 0);

    // 이미 시간이 지났는데 재개를 눌렀다면 -> "오버라이드(강제 영업)" 설정
    if (now.getTime() >= closeAt.getTime()) {
      const overrides = loadObj(SALES_OVERRIDE_KEY, {});
      overrides[todayISO] = true;
      saveObj(SALES_OVERRIDE_KEY, overrides);
    }
  }
};

/* =========================
   마감 예정 시간 설정 (사장님)
========================= */
export const setCloseTimeToday = (hhmm) => {
  const todayISO = getTodayISO();
  const map = loadObj(CLOSE_TIME_KEY, {});
  map[todayISO] = hhmm;
  saveObj(CLOSE_TIME_KEY, map);

  // 시간을 새로 설정했으면, 기존 강제 영업 설정은 해제 (새 시간 규칙을 따라야 함)
  const overrides = loadObj(SALES_OVERRIDE_KEY, {});
  if (overrides[todayISO]) {
    delete overrides[todayISO];
    saveObj(SALES_OVERRIDE_KEY, overrides);
  }
};

export const getCloseTimeToday = () => {
  const todayISO = getTodayISO();
  const map = loadObj(CLOSE_TIME_KEY, {});
  return map?.[todayISO] || null;
};

export const clearCloseTimeToday = () => {
  const todayISO = getTodayISO();
  const map = loadObj(CLOSE_TIME_KEY, {});
  delete map[todayISO];
  saveObj(CLOSE_TIME_KEY, map);

  // 마감 시간 없앴으니 오버라이드도 필요 없음
  const overrides = loadObj(SALES_OVERRIDE_KEY, {});
  delete overrides[todayISO];
  saveObj(SALES_OVERRIDE_KEY, overrides);
};

/* =========================
   마감 10분 전인지 체크 (손님용)
========================= */
export const isClosingSoon = () => {
  if (isBusinessClosedToday()) return false;

  // 강제 영업 중이면 경고 안 띄움
  const todayISO = getTodayISO();
  const overrides = loadObj(SALES_OVERRIDE_KEY, {});
  if (overrides[todayISO]) return false;

  const time = getCloseTimeToday();
  if (!time) return false;

  const [hh, mm] = time.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return false;

  const now = new Date();
  const closeAt = new Date();
  closeAt.setHours(hh, mm, 0, 0);

  const diff = closeAt.getTime() - now.getTime();
  return diff > 0 && diff <= 10 * 60 * 1000;
};

export const minutesToClose = () => {
  const time = getCloseTimeToday();
  if (!time) return null;

  const [hh, mm] = time.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  const now = new Date();
  const closeAt = new Date();
  closeAt.setHours(hh, mm, 0, 0);

  const diff = closeAt.getTime() - now.getTime();
  if (diff <= 0) return 0;

  return Math.ceil(diff / (60 * 1000));
};

/* =========================
   (중요) 마감시간 지나면 자동 영업 종료
   - BusinessManage에서 주기적으로 호출
========================= */
export const ensureAutoCloseToday = () => {
  if (isBusinessClosedToday()) return;

  const time = getCloseTimeToday();
  if (!time) return;

  const [hh, mm] = time.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return;

  const now = new Date();
  const closeAt = new Date();
  closeAt.setHours(hh, mm, 0, 0);

  if (now.getTime() >= closeAt.getTime()) {
    // ✨ "오늘 강제로 재개 버튼을 눌렀었나?" 확인
    const todayISO = getTodayISO();
    const overrides = loadObj(SALES_OVERRIDE_KEY, {});

    // 오버라이드 설정이 있다면 자동 종료 하지 않음 (PASS)
    if (overrides[todayISO]) {
      return;
    }

    // 오버라이드가 없다면 자동 종료 처리
    const closings = loadObj(SALES_CLOSINGS_KEY, {});
    closings[todayISO] = {
      ...(typeof closings[todayISO] === "object" ? closings[todayISO] : {}),
      closedAt: new Date().toISOString(),
      auto: true,
    };
    saveObj(SALES_CLOSINGS_KEY, closings);
  }
};
