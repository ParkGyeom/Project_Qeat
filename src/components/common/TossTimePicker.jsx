import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const TossTimePicker = ({
  isOpen,
  onClose,
  onConfirm,
  initialTime = "22:00",
}) => {
  if (!isOpen) return null;

  const [initHour, initMin] = initialTime.split(":").map(Number);

  // 선택된 시간 상태
  const [selectedHour, setSelectedHour] = useState(initHour || 0);
  const [selectedMinute, setSelectedMinute] = useState(initMin || 0);

  // 데이터 생성
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const hourRef = useRef(null);
  const minRef = useRef(null);

  // --- 스타일 상수 (이걸로 정확한 위치 계산) ---
  const ITEM_HEIGHT = 54; // 항목 하나 높이 (px)
  const CONTAINER_HEIGHT = 250; // 전체 스크롤 영역 높이 (px)
  const PADDING_Y = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2; // 상하 여백

  // 1. 초기 진입 시 해당 위치로 즉시 이동
  useEffect(() => {
    if (isOpen) {
      // setTimeout을 써야 렌더링 후 DOM에 접근 가능
      setTimeout(() => {
        if (hourRef.current) {
          hourRef.current.scrollTop = selectedHour * ITEM_HEIGHT;
        }
        if (minRef.current) {
          minRef.current.scrollTop = selectedMinute * ITEM_HEIGHT;
        }
      }, 0);
    }
  }, [isOpen]);

  // 2. 스크롤 이벤트 핸들러 (스크롤 할 때마다 자동 선택)
  const handleScroll = (e, type) => {
    const scrollTop = e.target.scrollTop;
    // 현재 스크롤 위치에서 가장 가까운 인덱스 계산 (반올림)
    const index = Math.round(scrollTop / ITEM_HEIGHT);

    if (type === "hour") {
      // 범위 벗어나지 않게 방어 코드
      const validIndex = Math.max(0, Math.min(index, 23));
      if (selectedHour !== validIndex) setSelectedHour(validIndex);
    } else {
      const validIndex = Math.max(0, Math.min(index, 59));
      if (selectedMinute !== validIndex) setSelectedMinute(validIndex);
    }
  };

  // 3. 클릭 시 해당 위치로 '부드럽게' 스크롤 이동
  const handleClickItem = (index, type) => {
    const targetRef = type === "hour" ? hourRef : minRef;
    if (targetRef.current) {
      targetRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: "smooth",
      });
    }
    // state 업데이트는 handleScroll이 알아서 처리함
  };

  const handleConfirm = () => {
    const formattedTime = `${String(selectedHour).padStart(2, "0")}:${String(
      selectedMinute
    ).padStart(2, "0")}`;
    onConfirm(formattedTime);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 animate-slide-up">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">마감 시간 설정</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* 시간 선택 영역 */}
        <div
          className="flex justify-center gap-4 relative"
          style={{ height: `${CONTAINER_HEIGHT}px` }}
        >
          {/* 중앙 파란색 하이라이트 바 (절대 위치 고정) */}
          <div
            className="absolute top-1/2 left-0 w-full -translate-y-1/2 bg-blue-50 rounded-lg -z-10 pointer-events-none border border-blue-100/50"
            style={{ height: `${ITEM_HEIGHT}px` }}
          />

          {/* 시간 (Hour) */}
          <ul
            className="flex-1 overflow-y-auto scrollbar-hide text-center snap-y snap-mandatory"
            ref={hourRef}
            onScroll={(e) => handleScroll(e, "hour")}
            style={{ padding: `${PADDING_Y}px 0` }}
          >
            {hours.map((hour) => (
              <li
                key={hour}
                onClick={() => handleClickItem(hour, "hour")}
                className={`flex items-center justify-center cursor-pointer snap-center transition-all duration-200 ${
                  selectedHour === hour
                    ? "font-bold text-blue-600 scale-110"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                style={{ height: `${ITEM_HEIGHT}px` }}
              >
                {hour < 12
                  ? `오전 ${hour === 0 ? 12 : hour}`
                  : `오후 ${hour === 12 ? 12 : hour - 12}`}
                시
              </li>
            ))}
          </ul>

          {/* 구분선 */}
          <div className="flex items-center justify-center text-gray-300 font-bold text-xl pb-1 z-10">
            :
          </div>

          {/* 분 (Minute) */}
          <ul
            className="flex-1 overflow-y-auto scrollbar-hide text-center snap-y snap-mandatory"
            ref={minRef}
            onScroll={(e) => handleScroll(e, "minute")}
            style={{ padding: `${PADDING_Y}px 0` }}
          >
            {minutes.map((min) => (
              <li
                key={min}
                onClick={() => handleClickItem(min, "minute")}
                className={`flex items-center justify-center cursor-pointer snap-center transition-all duration-200 ${
                  selectedMinute === min
                    ? "font-bold text-blue-600 scale-110"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                style={{ height: `${ITEM_HEIGHT}px` }}
              >
                {String(min).padStart(2, "0")}분
              </li>
            ))}
          </ul>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TossTimePicker;
