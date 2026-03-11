import React, { useMemo, useState } from "react";
import { formatPrice } from "../../utils/format";

const SalesChart = ({ data, onDateClick, selectedDate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return <div className="p-10 text-center">데이터가 없습니다.</div>;
  }

  // ✅ maxValue가 0이면 막대가 NaN 되는 문제 방지
  const maxValue = useMemo(() => {
    const m = Math.max(...data.map((d) => Number(d.amount) || 0));
    return m > 0 ? m : 1;
  }, [data]);

  const MAX_BAR_HEIGHT = 200;

  // ✅ 라벨에서 "1/4"만 추출 (SalesManage에서 "1/4 (토)" 형태)
  const displayDate = (d) => {
    const label = String(d?.date ?? "");
    // "1/4 (토)" → "1/4"
    const beforeSpace = label.split(" ")[0];
    return beforeSpace || label;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-6">일자별 매출 추이</h3>

      {/* [수정] 가로 스크롤 컨테이너 추가 */}
      <div className="overflow-x-auto no-scrollbar pb-4">
        <div
          style={{
            display: "flex",
            height: "250px",
            alignItems: "stretch",
            gap: "12px",
            minWidth: `${Math.max(100, data.length * 60)}px`, // 막대 최소 너비 보장
          }}
        >
          {data.map((day, index) => {
            const amount = Number(day.amount) || 0;
            const barHeight = (amount / maxValue) * MAX_BAR_HEIGHT;

            const keyDate = day.fullDate || day.date; // ✅ YYYY-MM-DD 우선
            const isSelected = selectedDate === keyDate;
            const isHovered = hoveredIndex === index;

            let barColor = "#E8F3FF";
            if (isSelected || isHovered) barColor = "#3182F6";

            return (
              <div
                key={keyDate}
                onClick={() => onDateClick(keyDate)} // ✅ fullDate로 클릭 전달 유지
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  cursor: "pointer",
                  minWidth: "40px", // 막대 하나당 최소 너비
                }}
              >
                <div
                  style={{
                    marginBottom: "6px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: isSelected || isHovered ? "#3182F6" : "#999",
                    opacity: isSelected || isHovered ? 1 : 0,
                    transition: "opacity 0.2s",
                    whiteSpace: "nowrap", // 금액 텍스트 줄바꿈 방지
                  }}
                >
                  {formatPrice(amount)}
                </div>

                <div
                  style={{
                    width: "30px", // 막대 자체의 고정 너비 (혹은 퍼센트로 유동적으로 줘도 됨)
                    height: `${barHeight}px`,
                    backgroundColor: barColor,
                    borderRadius: "6px 6px 0 0",
                    transition: "all 0.2s ease",
                    minHeight: "6px",
                  }}
                />

                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "12px",
                    fontWeight: isSelected || isHovered ? "bold" : "normal",
                    color: isSelected || isHovered ? "#333" : "#999",
                    height: "20px",
                    whiteSpace: "nowrap", // 날짜 텍스트 줄바꿈 방지
                  }}
                >
                  {displayDate(day)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-2">
        날짜를 클릭하면 상세 내역을 볼 수 있습니다.
      </p>
    </div>
  );
};

export default SalesChart;
