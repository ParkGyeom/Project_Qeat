import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";

import {
  isBusinessClosedToday,
  closeBusinessToday,
  reopenBusinessToday,
  getCloseTimeToday,
  setCloseTimeToday,
  clearCloseTimeToday,
  isClosingSoon,
  minutesToClose,
  ensureAutoCloseToday,
} from "../../utils/businessStatus";

// ✅ [1] 가게 이름을 가져오기 위해 import 추가
import { getStoreName } from "../../utils/storeInfo";

import TossTimePicker from "../../components/common/TossTimePicker.jsx";

const BusinessManage = () => {
  const [isClosed, setIsClosed] = useState(false);

  // 처음부터 저장된 시간을 가져와서 시작 (타이머 의존 X)
  const [time, setTime] = useState(getCloseTimeToday() || "");

  const [savedTime, setSavedTime] = useState(null);
  const [closingSoon, setClosingSoon] = useState(false);
  const [minLeft, setMinLeft] = useState(null);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  // QR 코드 관련 State
  const [tableCount, setTableCount] = useState(10);
  const [baseUrl, setBaseUrl] = useState("");

  // ✅ [2] 현재 로그인한 가게 이름 가져오기
  const currentStoreName = getStoreName();

  useEffect(() => {
    const tick = () => {
      ensureAutoCloseToday();
      setIsClosed(isBusinessClosedToday());

      const t = getCloseTimeToday();
      setSavedTime(t);
      setClosingSoon(isClosingSoon());
      setMinLeft(minutesToClose());
    };

    tick();
    const id = setInterval(tick, 1000);

    // QR 코드용 주소 설정
    setBaseUrl(
      `${window.location.protocol}//${window.location.host}/guest/menu`
    );

    return () => clearInterval(id);
  }, []);

  const handleToggleClose = () => {
    if (isClosed) {
      const ok = window.confirm("오늘 영업을 다시 재개하시겠습니까?");
      if (!ok) return;
      reopenBusinessToday();
    } else {
      const ok = window.confirm(
        "오늘 영업을 마감하시겠습니까?\n손님 주문이 즉시 불가능해집니다."
      );
      if (!ok) return;
      closeBusinessToday();
    }
  };

  const handleSaveTime = () => {
    if (!time) {
      alert("시간을 설정해주세요.");
      return;
    }
    setCloseTimeToday(time);
    setSavedTime(time);
    alert("마감시간이 저장되었습니다.");
  };

  const handleClearTime = () => {
    const ok = window.confirm("오늘 마감시간 설정을 삭제할까요?");
    if (!ok) return;
    clearCloseTimeToday();
    setTime("");
    setSavedTime(null);
  };

  const handleTimeConfirm = (newTime) => {
    setTime(newTime);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return "-- : --";
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h < 12 ? "오전" : "오후";
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${ampm} ${String(hour).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="pb-20 font-sans px-2">
      {/* 1. 상단 헤더 & 영업 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-toss-dark tracking-tight">
          영업 관리
        </h2>
        <button
          onClick={handleToggleClose}
          className={
            isClosed
              ? "px-4 py-2 rounded-xl font-bold text-sm border border-blue-200 text-toss-blue bg-blue-50 hover:bg-blue-100 transition"
              : "px-4 py-2 rounded-xl font-bold text-sm text-white bg-toss-blue hover:bg-blue-600 transition shadow-sm"
          }
        >
          {isClosed ? "영업 재개" : "오늘 영업 마감"}
        </button>
      </div>

      {/* 2. 상태 카드 */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50 mb-6">
        <div className="flex items-center gap-2">
          <span
            className={
              isClosed
                ? "px-3 py-1 rounded-xl bg-red-50 text-red-700 text-sm font-bold"
                : closingSoon
                ? "px-3 py-1 rounded-xl bg-yellow-50 text-yellow-900 text-sm font-bold"
                : "px-3 py-1 rounded-xl bg-green-50 text-green-700 text-sm font-bold"
            }
          >
            {isClosed ? "영업 종료" : closingSoon ? "마감 임박" : "영업중"}
          </span>

          {!isClosed && closingSoon && minLeft != null && (
            <span className="text-sm font-bold text-yellow-900/80">
              약 {minLeft}분 남음
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          손님 페이지는 이 상태를 자동 반영합니다.
        </p>
      </div>

      {/* 3. 마감시간 설정 영역 */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50 mb-8">
        <p className="text-toss-light text-[15px] font-bold mb-3">
          오늘 마감시간 설정
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTimePickerOpen(true)}
            className="flex items-center bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl px-5 py-3 transition-colors group"
          >
            <span className="text-sm font-bold text-gray-500 mr-3">
              마감시간
            </span>
            <span
              className={`text-xl font-bold ${
                time
                  ? "text-gray-800 group-hover:text-toss-blue"
                  : "text-gray-400"
              }`}
            >
              {formatDisplayTime(time)}
            </span>
            <svg
              className="w-5 h-5 ml-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </button>
          <button
            onClick={handleSaveTime}
            className="px-4 py-3 rounded-2xl font-bold text-sm text-toss-blue bg-blue-50 hover:bg-blue-100 transition whitespace-nowrap"
          >
            설정 저장
          </button>
          <button
            onClick={handleClearTime}
            className="px-4 py-3 rounded-2xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition whitespace-nowrap"
          >
            삭제
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          {savedTime
            ? `현재 저장된 마감시간: ${savedTime}`
            : "설정 없음 (자동 마감/경고 비활성)"}
        </p>
      </div>

      {/* 4. 테이블 QR 코드 생성기 */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg font-bold text-toss-dark flex items-center gap-2">
              테이블 QR 코드 🖨️
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              테이블마다 다른 QR 코드를 생성합니다.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg flex items-center justify-center gap-2"
          >
            <span>인쇄하기</span>
          </button>
        </div>

        {/* 설정 패널 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-2xl">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">
              주문 페이지 주소 (배포 주소)
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-toss-blue"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">
              테이블 개수
            </label>
            <input
              type="number"
              value={tableCount}
              onChange={(e) => setTableCount(Number(e.target.value))}
              min="1"
              max="100"
              className="w-full p-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-toss-blue"
            />
          </div>
        </div>

        {/* 화면 미리보기 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto p-2 border border-dashed border-gray-300 rounded-xl">
          {Array.from({ length: tableCount }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
            >
              <h4 className="font-bold text-toss-dark mb-2">Table {i + 1}</h4>
              <div className="bg-white p-1">
                {/* ✅ [3] 화면 미리보기 QR: store 파라미터 추가! */}
                <QRCode
                  value={`${baseUrl}?store=${encodeURIComponent(
                    currentStoreName
                  )}&table=${i + 1}`}
                  size={80}
                  level="M"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <TossTimePicker
        isOpen={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        onConfirm={handleTimeConfirm}
        initialTime={time || "22:00"}
      />

      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-area, #print-area * {
              visibility: visible;
            }
            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              display: block !important;
              background: white;
              padding: 20px;
            }
            .print-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 30px;
              text-align: center;
            }
            .print-item {
              border: 2px solid #ddd;
              padding: 20px;
              border-radius: 15px;
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      {/* ✅ [4] 인쇄 영역 수정 */}
      <div id="print-area" style={{ display: "none" }}>
        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          {currentStoreName} QR 코드
        </h1>
        <div className="print-grid">
          {Array.from({ length: tableCount }).map((_, i) => (
            <div key={i} className="print-item">
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "900",
                  marginBottom: "10px",
                }}
              >
                {i + 1}번 테이블
              </h2>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "10px",
                }}
              >
                {/* 인쇄용 QR: store 파라미터 추가! */}
                <QRCode
                  value={`${baseUrl}?store=${encodeURIComponent(
                    currentStoreName
                  )}&table=${i + 1}`}
                  size={150}
                  level="H"
                />
              </div>
              <p style={{ fontSize: "12px", color: "#666" }}>
                {currentStoreName} <br />
                카메라로 스캔하여 주문해주세요 🍺
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessManage;
