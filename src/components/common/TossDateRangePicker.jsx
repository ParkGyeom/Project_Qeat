import React, { useEffect, useMemo, useRef, useState } from "react";

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

const clampOrder = (a, b) => (a <= b ? [a, b] : [b, a]);

function buildCalendarGrid(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0(Sun)~6
  const start = new Date(year, month, 1 - startDay);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return { year, month, days };
}

export default function TossDateRangePicker({
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
  className = "",
}) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);

  const start = startDate ? fromISO(startDate) : null;
  const end = endDate ? fromISO(endDate) : null;

  // “지금 보고있는 달”은 startDate 기준(없으면 오늘)
  const [viewDate, setViewDate] = useState(() => start ?? new Date());

  // range 선택 흐름: start 먼저, 그 다음 end
  const [picking, setPicking] = useState("end"); // "start" | "end"
  useEffect(() => {
    // 열릴 때는 보통 end를 고르게(유저는 기간 조정이 많으니까)
    if (open) setPicking("end");
  }, [open]);

  const { year, month, days } = useMemo(
    () => buildCalendarGrid(viewDate),
    [viewDate]
  );

  const close = () => setOpen(false);

  // 바깥 클릭 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) close();
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const range = useMemo(() => {
    if (!start || !end) return null;
    const [a, b] = clampOrder(start, end);
    return { a, b };
  }, [start, end]);

  const inRange = (d) => {
    if (!range) return false;
    const t = d.getTime();
    return t >= range.a.getTime() && t <= range.b.getTime();
  };

  const isSameMonth = (d) => d.getMonth() === month;

  const pickDate = (d) => {
    const iso = toISO(d);

    // start를 고르는 모드
    if (picking === "start") {
      onChangeStart(iso);

      // end가 start보다 빠르면 end를 start로 맞춰줌 (기능 안정)
      if (endDate && endDate < iso) onChangeEnd(iso);

      setPicking("end");
      return;
    }

    // end를 고르는 모드
    if (!startDate) {
      // start가 없으면 start부터 잡아주고 end는 동일하게
      onChangeStart(iso);
      onChangeEnd(iso);
      setPicking("end");
      return;
    }

    // start가 있는 상태에서 end 선택
    onChangeEnd(iso);
  };

  const setToday = () => {
    const iso = toISO(new Date());
    onChangeStart(iso);
    onChangeEnd(iso);
    setViewDate(new Date());
    setPicking("end");
  };

  const clear = () => {
    onChangeStart("");
    onChangeEnd("");
    setPicking("start");
  };

  const title = `${year}. ${pad2(month + 1)}.`;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {/* 기존 토스 스타일 pill UI는 유지 */}
      <div className="flex items-center bg-white px-2 py-1.5 rounded-xl border border-gray-100 shadow-sm">
        {/* start pill */}
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            setPicking("start");
            setViewDate(start ?? new Date());
          }}
          className="h-9 px-3 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
        >
          <span className="text-[14px] font-bold text-toss-blue">
            {startDate ? startDate.replace(/-/g, ". ") + "." : "시작일"}
          </span>
        </button>

        <span className="mx-2 text-gray-300 text-sm font-medium">~</span>

        {/* end pill */}
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            setPicking("end");
            setViewDate(end ?? start ?? new Date());
          }}
          className="h-9 px-3 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
        >
          <span className="text-[14px] font-bold text-toss-blue">
            {endDate ? endDate.replace(/-/g, ". ") + "." : "종료일"}
          </span>
        </button>
      </div>

      {/* 팝오버 */}
      {open && (
        <div className="absolute right-0 mt-3 w-[340px] bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50">
          {/* 헤더 */}
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
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPicking("start")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    picking === "start"
                      ? "bg-blue-50 text-toss-blue"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  시작일
                </button>
                <button
                  type="button"
                  onClick={() => setPicking("end")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    picking === "end"
                      ? "bg-blue-50 text-toss-blue"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  종료일
                </button>
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

          {/* 요일 */}
          <div className="px-4 pb-2">
            <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-500">
              {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
                <div key={w} className="py-2">
                  {w}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1 pb-3">
              {days.map((d) => {
                const iso = toISO(d);
                const isToday = sameDay(d, new Date());
                const isStart = startDate && iso === startDate;
                const isEnd = endDate && iso === endDate;
                const mid = inRange(d) && !isStart && !isEnd;

                const base =
                  "h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors";

                const muted = !isSameMonth(d);

                const cls = [
                  base,
                  muted ? "text-gray-300" : "text-gray-900",
                  "hover:bg-gray-50",
                  mid ? "bg-blue-50 text-toss-blue" : "",
                  isStart || isEnd
                    ? "bg-toss-blue text-white hover:bg-toss-blue"
                    : "",
                  isToday && !(isStart || isEnd) ? "ring-1 ring-blue-200" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    type="button"
                    key={iso}
                    className={cls}
                    onClick={() => pickDate(d)}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={clear}
              className="px-3 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50"
            >
              삭제
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={setToday}
                className="px-3 py-2 rounded-xl text-sm font-bold text-toss-blue hover:bg-blue-50"
              >
                오늘
              </button>
              <button
                type="button"
                onClick={close}
                className="px-3 py-2 rounded-xl text-sm font-bold text-white bg-toss-blue hover:opacity-90 rounded-xl"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
