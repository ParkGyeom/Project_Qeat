import React, { useMemo, useRef, useState, useEffect } from "react";
import SalesChart from "../../components/owner/SalesChart";
import { formatPrice } from "../../utils/format";
import { getOrders } from "../../utils/mockApi";

/* -----------------------------
   Toss-Style Date Range Picker (기존 유지)
------------------------------ */

const pad2 = (n) => String(n).padStart(2, "0");
const toISO = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const fromISO = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

function buildCalendarGrid(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const start = new Date(year, month, 1 - startDay);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return { year, month, days };
}

function TossDateRangePicker({
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
}) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);

  const [pStart, setPStart] = useState(startDate);
  const [pEnd, setPEnd] = useState(endDate);

  const [picking, setPicking] = useState("end"); // "start" | "end"
  const [viewDate, setViewDate] = useState(() =>
    startDate ? fromISO(startDate) : new Date()
  );

  const [swapPulse, setSwapPulse] = useState(null);
  const pulseTimerRef = useRef(null);

  const triggerSwapPulse = (target) => {
    setSwapPulse(target);
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = setTimeout(() => setSwapPulse(null), 220);
  };

  useEffect(() => {
    return () => {
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setPStart(startDate);
    setPEnd(endDate);
    setPicking("end");
    setViewDate(
      endDate ? fromISO(endDate) : startDate ? fromISO(startDate) : new Date()
    );
  }, [open, startDate, endDate]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const { year, month, days } = useMemo(
    () => buildCalendarGrid(viewDate),
    [viewDate]
  );

  const [aISO, bISO] = useMemo(() => {
    if (!pStart && !pEnd) return ["", ""];
    if (pStart && !pEnd) return [pStart, pStart];
    if (!pStart && pEnd) return [pEnd, pEnd];
    return pStart <= pEnd ? [pStart, pEnd] : [pEnd, pStart];
  }, [pStart, pEnd]);

  const a = aISO ? startOfDay(fromISO(aISO)) : null;
  const b = bISO ? startOfDay(fromISO(bISO)) : null;

  const inRange = (d) => {
    if (!a || !b) return false;
    const t = startOfDay(d).getTime();
    return t >= a.getTime() && t <= b.getTime();
  };

  const isSameMonth = (d) => d.getMonth() === month;

  const formatPill = (iso, fallback) =>
    iso ? iso.replace(/-/g, ". ") + "." : fallback;

  const title = `${year}년 ${month + 1}월`;
  const TOSS_BLUE = "#3182F6";

  const pickDate = (d) => {
    const iso = toISO(d);

    if (picking === "start") {
      if (pEnd && iso > pEnd) {
        setPStart(pEnd);
        setPEnd(iso);
        triggerSwapPulse("start");
        triggerSwapPulse("end");
      } else {
        setPStart(iso);
        if (!pEnd) setPEnd(iso);
      }
      setPicking("end");
      return;
    }

    if (!pStart) {
      setPStart(iso);
      setPEnd(iso);
      setPicking("end");
      return;
    }

    if (iso < pStart) {
      setPEnd(pStart);
      setPStart(iso);
      triggerSwapPulse("start");
      triggerSwapPulse("end");
    } else {
      setPEnd(iso);
    }
  };

  const apply = () => {
    let s = pStart || pEnd;
    let e = pEnd || pStart;
    if (s && e && s > e) {
      const tmp = s;
      s = e;
      e = tmp;
    }
    onChangeStart(s);
    onChangeEnd(e);
    setOpen(false);
  };

  const cancel = () => setOpen(false);

  const DayCell = ({ d }) => {
    const iso = toISO(d);
    const muted = !isSameMonth(d);

    const isToday = sameDay(d, new Date());
    const isStart = aISO && iso === aISO;
    const isEnd = bISO && iso === bISO;
    const inMid = inRange(d) && !isStart && !isEnd;

    const prev = new Date(d);
    prev.setDate(d.getDate() - 1);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);

    const connectLeft = inRange(prev);
    const connectRight = inRange(next);

    const leftHalf =
      isEnd && connectLeft
        ? "bg-blue-50"
        : inMid
        ? "bg-blue-50"
        : "bg-transparent";
    const rightHalf =
      isStart && connectRight
        ? "bg-blue-50"
        : inMid
        ? "bg-blue-50"
        : "bg-transparent";

    return (
      <button
        type="button"
        onClick={() => pickDate(d)}
        className="relative h-10"
      >
        <div className="absolute inset-0 flex items-center">
          <div
            className={[
              "h-8 flex-1",
              leftHalf,
              connectLeft || inMid ? "rounded-l-full" : "",
            ].join(" ")}
          />
          <div
            className={[
              "h-8 flex-1",
              rightHalf,
              connectRight || inMid ? "rounded-r-full" : "",
            ].join(" ")}
          />
        </div>

        <div
          className={[
            "relative z-10 mx-auto w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors",
            muted ? "text-gray-300" : "text-gray-900",
            !isStart && !isEnd ? "hover:bg-gray-50" : "",
            isToday && !isStart && !isEnd ? "ring-1 ring-blue-200" : "",
          ].join(" ")}
          style={
            isStart || isEnd
              ? { backgroundColor: TOSS_BLUE, color: "white", borderRadius: 14 }
              : undefined
          }
        >
          {d.getDate()}
        </div>
      </button>
    );
  };

  const pillPulseStyle = (active) =>
    active
      ? {
          transform: "scale(1.045)",
          boxShadow: "0 6px 18px rgba(49,130,246,0.18)",
        }
      : { transform: "scale(1)", boxShadow: "none" };

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center bg-white px-2 py-1.5 rounded-xl border border-gray-100 shadow-sm">
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            setPicking("start");
          }}
          className="h-9 px-3 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
          style={{
            transition: "transform 140ms ease, box-shadow 180ms ease",
            ...pillPulseStyle(swapPulse === "start"),
          }}
        >
          <span className="text-[14px] font-bold text-toss-blue">
            {formatPill(startDate, "시작일")}
          </span>
        </button>

        <span className="mx-2 text-gray-300 text-sm font-medium">~</span>

        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            setPicking("end");
          }}
          className="h-9 px-3 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
          style={{
            transition: "transform 140ms ease, box-shadow 180ms ease",
            ...pillPulseStyle(swapPulse === "end"),
          }}
        >
          <span className="text-[14px] font-bold text-toss-blue">
            {formatPill(endDate, "종료일")}
          </span>
        </button>
      </div>

      {open && (
        <div className="absolute right-0 mt-3 w-[360px] bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="w-9 h-9 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-600"
              aria-label="이전 달"
            >
              ‹
            </button>

            <div className="flex flex-col items-center">
              <div className="text-[15px] font-extrabold text-gray-900">
                {title}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPicking("start")}
                  className={[
                    "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors",
                    picking === "start"
                      ? "bg-blue-50 text-toss-blue"
                      : "text-gray-500 hover:bg-gray-50",
                  ].join(" ")}
                >
                  시작일
                </button>
                <button
                  type="button"
                  onClick={() => setPicking("end")}
                  className={[
                    "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors",
                    picking === "end"
                      ? "bg-blue-50 text-toss-blue"
                      : "text-gray-500 hover:bg-gray-50",
                  ].join(" ")}
                >
                  종료일
                </button>
              </div>

              <div className="mt-2 text-xs font-bold text-gray-500">
                {aISO ? aISO.replace(/-/g, ". ") : "----. --. --"} ~{" "}
                {bISO ? bISO.replace(/-/g, ". ") : "----. --. --"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="w-9 h-9 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-600"
              aria-label="다음 달"
            >
              ›
            </button>
          </div>

          <div className="px-4 pb-2">
            <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-500">
              {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
                <div key={w} className="py-2">
                  {w}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 pb-3">
              {days.map((d) => (
                <DayCell key={toISO(d)} d={d} />
              ))}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-end">
            <button
              type="button"
              onClick={cancel}
              className="px-3 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={apply}
              className="ml-2 px-3 py-2 rounded-xl text-sm font-bold text-white rounded-xl hover:opacity-90"
              style={{ backgroundColor: "#3182F6" }}
            >
              적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -----------------------------
   SalesManage (매출 전용: 운영 기능 제거)
   정책:
   - closings[iso]가 "스냅샷(totalSales/totalOrders)"이면 확정값으로 덮어쓰기
   - 그렇지 않으면(예: true, {closedAt, auto/manual} 등) 실시간 집계 유지
------------------------------ */

const SALES_RANGE_KEY = "sales_range_v1";
const SALES_BASE_KEY = "sales_base_v1";
const SALES_CLOSINGS_KEY = "sales_closings_v1";

const loadSavedRange = () => {
  try {
    const raw = localStorage.getItem(SALES_RANGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed?.startDate && parsed?.endDate) return parsed;
  } catch {}
  return null;
};
const saveRange = (startDate, endDate) => {
  try {
    localStorage.setItem(
      SALES_RANGE_KEY,
      JSON.stringify({ startDate, endDate })
    );
  } catch {}
};

const loadSalesBase = () => {
  const v = localStorage.getItem(SALES_BASE_KEY);
  return v === "order" ? "order" : "done";
};
const saveSalesBase = (v) => {
  try {
    localStorage.setItem(SALES_BASE_KEY, v);
  } catch {}
};

const loadClosings = () => {
  try {
    const raw = localStorage.getItem(SALES_CLOSINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const isCompletedStatus = (status) => {
  const s = String(status || "").trim();
  return s === "처리완료" || s.toLowerCase() === "done";
};

const kWeek = ["일", "월", "화", "수", "목", "금", "토"];

const getTimeKeyByBase = (o, salesBase) => {
  const tryIdAsTime = () => {
    if (!o?.id) return null;
    const d = new Date(o.id);
    if (!isNaN(d.getTime())) return d.toISOString();
    return null;
  };

  if (salesBase === "order") {
    return o?.orderTime || tryIdAsTime();
  }

  // ✅ done 기준: doneAt이 없으면 "집계 제외"가 맞음
  return o?.doneAt || null;
};

// ✅ 스냅샷 판별: totalSales/totalOrders가 있는 "object"만 확정으로 취급
const hasSnapshot = (v) => {
  if (!v || typeof v !== "object") return false;
  const hasSales = Object.prototype.hasOwnProperty.call(v, "totalSales");
  const hasOrders = Object.prototype.hasOwnProperty.call(v, "totalOrders");
  return hasSales || hasOrders;
};

const SalesManage = () => {
  const todayISO = toISO(new Date());
  const saved = loadSavedRange();

  const [startDate, setStartDate] = useState(saved?.startDate || todayISO);
  const [endDate, setEndDate] = useState(saved?.endDate || todayISO);
  const [selectedDate, setSelectedDate] = useState(null);

  const [salesBase, setSalesBase] = useState(loadSalesBase); // "done" | "order"
  const [orders, setOrders] = useState([]);

  // closings는 "스냅샷/마감 정보"가 섞여 있을 수 있음
  const [closings, setClosings] = useState(loadClosings);

  // ✅ 주문 실시간 반영(매출 즉시 반영)
  useEffect(() => {
    const fetch = () => setOrders(getOrders() || []);
    fetch();
    const t = setInterval(fetch, 700);
    return () => clearInterval(t);
  }, []);

  // ✅ 날짜 범위/토글 저장(탭 이동해도 유지)
  useEffect(() => saveRange(startDate, endDate), [startDate, endDate]);
  useEffect(() => {
    saveSalesBase(salesBase);
    setSelectedDate(null);
  }, [salesBase]);

  // ✅ 다른 탭(영업관리 등)에서 closings가 바뀌면 1초마다 반영
  useEffect(() => {
    const t = setInterval(() => setClosings(loadClosings()), 1000);
    return () => clearInterval(t);
  }, []);

  // ✅ 매출 기준에 따라 집계 대상 주문이 달라짐
  // - order 기준: 전체 주문
  // - done 기준: 처리완료 주문만
  const baseOrders = useMemo(() => {
    const all = orders || [];
    if (salesBase === "order") return all;
    return all.filter((o) => isCompletedStatus(o.status));
  }, [orders, salesBase]);

  // 날짜 범위 안의 "완료 주문"만
  const rangedOrdersRaw = useMemo(() => {
    return baseOrders
      .map((o) => {
        const t = getTimeKeyByBase(o, salesBase);
        const d = t ? new Date(t) : null;
        if (!d || isNaN(d.getTime())) return null;

        const iso = toISO(d);
        if (iso < startDate || iso > endDate) return null;

        return { ...o, __dateISO: iso, __dateObj: d };
      })
      .filter(Boolean);
  }, [baseOrders, startDate, endDate, salesBase]);

  // ✅ 일자별 집계
  // - 기본: 실시간 집계
  // - 단, closings[iso]가 "스냅샷(totalSales/totalOrders)"이면 그 날은 확정값으로 덮어쓰기
  const dailyAgg = useMemo(() => {
    const map = new Map(); // iso -> {amount, count, closedAt?, closed?}

    // 1) 실시간 집계
    for (const o of rangedOrdersRaw) {
      const iso = o.__dateISO;
      const price = Number(o.totalAmount ?? o.totalPrice ?? o.price ?? 0) || 0;

      const prev = map.get(iso) || { amount: 0, count: 0 };
      map.set(iso, { amount: prev.amount + price, count: prev.count + 1 });
    }

    // 2) 스냅샷이 있으면 그 날만 확정으로 덮어쓰기
    for (const iso of Object.keys(closings || {})) {
      const c = closings[iso];

      // 범위 밖이면 무시
      if (iso < startDate || iso > endDate) continue;

      // ✅ 스냅샷이 "있는 경우"에만 덮어쓰기
      if (!hasSnapshot(c)) continue;

      map.set(iso, {
        amount: Number(c.totalSales || 0),
        count: Number(c.totalOrders || 0),
        closedAt: c.closedAt,
        closed: true,
      });
    }

    return map;
  }, [rangedOrdersRaw, closings, startDate, endDate]);

  const totalSales = useMemo(() => {
    let sum = 0;
    for (const v of dailyAgg.values()) sum += v.amount;
    return sum;
  }, [dailyAgg]);

  const totalOrders = useMemo(() => {
    let cnt = 0;
    for (const v of dailyAgg.values()) cnt += v.count;
    return cnt;
  }, [dailyAgg]);

  // 범위 내 날짜를 연속으로 생성해서 차트로 (0원도 표시)
  const chartData = useMemo(() => {
    const s = fromISO(startDate);
    const e = fromISO(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return [];

    const out = [];
    const cur = new Date(s);
    while (cur.getTime() <= e.getTime()) {
      const iso = toISO(cur);
      const agg = dailyAgg.get(iso) || { amount: 0, count: 0 };
      const label = `${cur.getMonth() + 1}/${cur.getDate()} (${
        kWeek[cur.getDay()]
      })`;

      out.push({ date: label, amount: agg.amount, fullDate: iso });
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }, [startDate, endDate, dailyAgg]);

  // 상세: 선택 날짜의 주문 리스트
  const selectedOrders = useMemo(() => {
    if (!selectedDate) return [];
    return rangedOrdersRaw
      .filter((o) => o.__dateISO === selectedDate)
      .sort(
        (a, b) =>
          (b.__dateObj?.getTime?.() || 0) - (a.__dateObj?.getTime?.() || 0)
      )
      .map((o) => {
        const d = o.__dateObj;
        const time = d
          ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "-";

        const menus = Array.isArray(o.menus)
          ? o.menus
          : Array.isArray(o.menu)
          ? o.menu
          : [];

        const menuText =
          menus.length > 0
            ? `${menus[0]?.name || "메뉴"} x${menus[0]?.count || 1}${
                menus.length > 1 ? ` 외 ${menus.length - 1}건` : ""
              }`
            : "주문";

        const price =
          Number(o.totalAmount ?? o.totalPrice ?? o.price ?? 0) || 0;
        return { id: o.id, time, menu: menuText, price };
      });
  }, [selectedDate, rangedOrdersRaw]);

  // 선택 날짜가 범위 밖이면 해제
  useEffect(() => {
    if (!selectedDate) return;
    if (selectedDate < startDate || selectedDate > endDate) {
      setSelectedDate(null);
    }
  }, [selectedDate, startDate, endDate]);

  // ✅ 오늘 현재 집계(표시용)
  const todayAgg = useMemo(() => {
    const v = dailyAgg.get(todayISO);
    return { amount: v?.amount || 0, count: v?.count || 0 };
  }, [dailyAgg, todayISO]);

  // ✅ 선택 날짜가 "확정 스냅샷"인지 여부
  const isSelectedDateFinalized = useMemo(() => {
    const c = closings?.[selectedDate];
    return hasSnapshot(c);
  }, [closings, selectedDate]);

  return (
    <div className="pb-10 font-sans px-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-toss-dark tracking-tight">
              매출 현황
            </h2>
          </div>

          {/* ✅ 매출 기준 토글 */}
          <div className="inline-flex bg-gray-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setSalesBase("done")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                salesBase === "done"
                  ? "bg-white text-toss-blue shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              완료 기준
            </button>
            <button
              type="button"
              onClick={() => setSalesBase("order")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                salesBase === "order"
                  ? "bg-white text-toss-blue shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              주문 기준
            </button>
          </div>

          <p className="text-xs text-toss-light">
            {salesBase === "done"
              ? "조리 완료(처리완료)된 시점 기준으로 매출을 집계합니다."
              : "주문이 들어온 시점(orderTime) 기준으로 매출을 집계합니다."}
          </p>

          <p className="text-xs text-gray-400">
            오늘({todayISO}) 현재 집계: {formatPrice(todayAgg.amount)}원 ·{" "}
            {todayAgg.count}건
          </p>
        </div>

        {/* ✅ 달력 UI 그대로 */}
        <TossDateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChangeStart={(iso) => setStartDate(iso)}
          onChangeEnd={(iso) => setEndDate(iso)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="bg-white p-7 rounded-[24px] shadow-sm border border-gray-50">
          <p className="text-toss-light text-[15px] font-bold mb-2">
            선택 기간 총 매출
          </p>
          <h3 className="text-3xl font-black text-toss-blue tracking-tight">
            {formatPrice(totalSales)}원
          </h3>
        </div>

        <div className="bg-white p-7 rounded-[24px] shadow-sm border border-gray-50">
          <p className="text-toss-light text-[15px] font-bold mb-2">
            총 주문 건수
          </p>
          <h3 className="text-3xl font-black text-toss-dark tracking-tight">
            {totalOrders}건
          </h3>
        </div>
      </div>

      <div className="bg-white p-7 rounded-[24px] shadow-sm border border-gray-50 mb-8">
        <SalesChart
          data={chartData}
          selectedDate={selectedDate}
          onDateClick={(fullDate) => setSelectedDate(fullDate)}
        />
      </div>

      {selectedDate && (
        <div className="animate-fade-in">
          <h3 className="text-xl font-bold text-toss-dark mb-4 flex items-center">
            <span className="text-toss-blue mr-2">
              {chartData.find((d) => d.fullDate === selectedDate)?.date ||
                selectedDate}
            </span>
            주문 내역
            {isSelectedDateFinalized ? (
              <span className="ml-3 px-2 py-1 rounded-lg bg-blue-50 text-toss-blue text-xs font-bold">
                확정(스냅샷)
              </span>
            ) : null}
          </h3>

          <div className="bg-white rounded-[24px] shadow-sm border border-gray-50 overflow-hidden">
            {selectedOrders.length === 0 ? (
              <div className="p-10 text-center text-toss-light font-medium">
                해당 날짜에 기록된 주문이 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        시간
                      </th>
                      <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        주문 내용
                      </th>
                      <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                        결제 금액
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-5 text-sm text-toss-light font-medium">
                          {order.time}
                        </td>
                        <td className="p-5 text-sm text-toss-dark font-bold">
                          {order.menu}
                        </td>
                        <td className="p-5 text-sm text-toss-blue font-bold text-right">
                          {formatPrice(order.price)}원
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesManage;
