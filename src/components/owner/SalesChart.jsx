import React, { useState } from "react";
import { formatPrice } from "../../utils/format";

const SalesChart = ({ data, onDateClick, selectedDate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return <div className="p-10 text-center">데이터가 없습니다.</div>;
  }

  // 최대값 계산
  const maxValue = Math.max(...data.map((d) => d.amount)) || 1;
  const MAX_BAR_HEIGHT = 200;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-6">일자별 매출 추이</h3>

      <div
        style={{
          display: "flex",
          height: "250px",
          alignItems: "stretch",
          gap: "12px",
        }}
      >
        {data.map((day, index) => {
          const barHeight = (day.amount / maxValue) * MAX_BAR_HEIGHT;
          const isSelected = selectedDate === day.date; // 현재 선택된 날짜인가?
          const isHovered = hoveredIndex === index; // 마우스가 올라가 있는가?

          // 색상 결정 로직 (우선순위: 선택됨 > 호버 > 기본)
          let barColor = "#E8F3FF"; // 기본: 연한 파랑
          if (isSelected) barColor = "#3182F6"; // 선택됨: 진한 파랑 (토스 블루)
          else if (isHovered) barColor = "#3182F6"; // 호버: 진한 파랑

          return (
            <div
              key={index}
              onClick={() => onDateClick(day.date)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                cursor: "pointer", // 클릭 가능 표시
              }}
            >
              {/* 금액 (호버하거나 선택됐을 때만 진하게 표시) */}
              <div
                style={{
                  marginBottom: "6px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: isSelected || isHovered ? "#3182F6" : "#999",
                  opacity: isSelected || isHovered ? 1 : 0, // 평소엔 숨김(깔끔하게)
                  transition: "opacity 0.2s",
                }}
              >
                {formatPrice(day.amount)}
              </div>

              {/* 막대 바 */}
              <div
                style={{
                  width: "30px", // 막대 두께
                  height: `${barHeight}px`,
                  backgroundColor: barColor,
                  borderRadius: "6px 6px 0 0",
                  transition: "all 0.2s ease", // 부드러운 애니메이션
                  minHeight: "6px",
                }}
              ></div>

              {/* 날짜 */}
              <div
                style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  fontWeight: isSelected || isHovered ? "bold" : "normal",
                  color: isSelected || isHovered ? "#333" : "#999",
                  height: "20px",
                }}
              >
                {day.date.split(" ")[0]}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400 mt-2">
        날짜를 클릭하면 상세 내역을 볼 수 있습니다.
      </p>
    </div>
  );
};

export default SalesChart;
