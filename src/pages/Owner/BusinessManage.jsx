import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getBoothInfo, getStoreName, setBoothInfo } from "../../utils/storeInfo";
import { getTables, bulkCreateTables, deactivateTable, activateTable } from "../../api/tableApi";
import { getMyApprovedBooths, updateBoothOpenStatus, updateBoothOperatingTime, deleteBoothOperatingTime, deleteBooth } from "../../api/boothApi";
import TossTimePicker from "../../components/common/TossTimePicker.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const BusinessManage = () => {
  const [isClosed, setIsClosed] = useState(false);
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [savedOpenTime, setSavedOpenTime] = useState(null);
  const [savedCloseTime, setSavedCloseTime] = useState(null);
  const [closingSoon, setClosingSoon] = useState(false);
  const [minLeft, setMinLeft] = useState(null);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState(null); // "open" | "close"

  // 테이블 관련 State
  const [tables, setTables] = useState([]);
  const [addCount, setAddCount] = useState("");
  const [isAddingTable, setIsAddingTable] = useState(false);

  const currentBooth = getBoothInfo();
  const currentStoreName = getStoreName();
  const navigate = useNavigate();

  const handleDeleteBooth = async () => {
    const targetId = currentBooth?.boothId || currentBooth?.id;
    if (!targetId) return;
    if (!window.confirm("부스를 정말 삭제하시겠습니까?\n삭제 후 복구할 수 없으며 영업이 즉시 중단됩니다.")) return;
    
    try {
      await deleteBooth(targetId);
      alert("부스가 삭제되었습니다.");
      navigate("/owner/select");
    } catch (err) {
      alert(err.response?.data?.message || "부스 삭제에 실패했습니다.");
    }
  };

  // 테이블 목록 불러오기
  const fetchTables = async () => {
    const targetId = currentBooth?.boothId || currentBooth?.id;
    if (!targetId) return;
    try {
      const data = await getTables(targetId);
      setTables(data);
    } catch (err) {
      console.error("Failed to fetch tables", err);
    }
  };

  // 부스 세부 정보(상태) 불러오기
  const fetchBoothStatus = async () => {
    const targetId = currentBooth?.boothId || currentBooth?.id;
    if (!targetId) return;
    try {
      // getBoothDetail (GET /api/booths/{id}) API가 백엔드에 없을 수 있으므로
      // 안전하게 getMyApprovedBooths를 호출해서 승인된 내 부스 목록 중 현재 부스를 찾습니다.
      const booths = await getMyApprovedBooths();
      const data = booths.find((b) => b.id === targetId || b.boothId === targetId);
      
      if (!data) return;

      const ot = data.openTime ? data.openTime.substring(0, 5) : null;
      const ct = data.closeTime ? data.closeTime.substring(0, 5) : null;
      setSavedOpenTime(ot);
      setSavedCloseTime(ct);
      if (ot && !openTime) setOpenTime(ot);
      if (ct && !closeTime) setCloseTime(ct);

      // 마감 임박 및 프론트엔드 자동 마감/오픈 계산
      // (백엔드 스케줄러가 없을 때를 대비해 로컬 시간에 기반하여 임시 처리)
      if (ot && ct) {
        const now = new Date();
        const [oh, om] = ot.split(":").map(Number);
        const [ch, cm] = ct.split(":").map(Number);
        
        const openDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), oh, om, 0);
        const closeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ch, cm, 0);
        
        // 자정을 넘기는 영업시간 지원 (예: 18:00 ~ 02:00)
        if (closeDate <= openDate) {
          if (now.getHours() < ch) {
            openDate.setDate(openDate.getDate() - 1);
          } else {
            closeDate.setDate(closeDate.getDate() + 1);
          }
        }

        const isTimeBetween = now.getTime() >= openDate.getTime() && now.getTime() < closeDate.getTime();
        
        if (!isTimeBetween) {
          // 시간이 아닐 때는 무조건 마감 처리
          setIsClosed(true);
          setClosingSoon(false);
          setMinLeft(null);
        } else {
          // 시간이 맞을 때 백엔드 open이 false면 (수동 마감), 수동 마감 존중
          if (data.open !== undefined && data.open === false) {
            setIsClosed(true);
            setClosingSoon(false);
            setMinLeft(null);
          } else {
            // 수동 마감이 아니면 정상 영업중
            setIsClosed(false);
            
            const diffMs = closeDate.getTime() - now.getTime();
            const diffMin = Math.floor(diffMs / 60000);
            if (diffMin > 0 && diffMin <= 60) {
              setClosingSoon(true);
              setMinLeft(diffMin);
            } else {
              setClosingSoon(false);
              setMinLeft(null);
            }
          }
        }
      } else if (ct) {
        // 오픈 시간 없이 마감 시간만 있는 경우 기존 로직 유지
        const now = new Date();
        const [ch, cm] = ct.split(":").map(Number);
        const closeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ch, cm, 0);
        
        const diffMs = closeDate.getTime() - now.getTime();
        const diffMin = Math.floor(diffMs / 60000);

        if (diffMs <= 0) {
          setIsClosed(true);
          setClosingSoon(false);
          setMinLeft(null);
        } else {
          if (data.open !== undefined && data.open === false) {
            setIsClosed(true);
          } else {
            setIsClosed(false);
            if (diffMin > 0 && diffMin <= 60) {
              setClosingSoon(true);
              setMinLeft(diffMin);
            } else {
              setClosingSoon(false);
              setMinLeft(null);
            }
          }
        }
      } else {
        // 영업 시간 설정이 없는 경우
        if (data.open !== undefined) {
          setIsClosed(!data.open);
        }
        setClosingSoon(false);
        setMinLeft(null);
      }
    } catch (err) {
      console.error("Failed to fetch booth status", err);
    }
  };

  useEffect(() => {
    fetchBoothStatus();
    fetchTables();
    
    // 매 분마다 마감 임박 업데이트
    const id = setInterval(fetchBoothStatus, 60000);
    return () => clearInterval(id);
  }, []);

  const handleToggleClose = async () => {
    const targetId = currentBooth?.boothId || currentBooth?.id;
    if (!targetId) return;
    const ok = window.confirm(
      isClosed ? "오늘 영업을 다시 재개하시겠습니까?" : "오늘 영업을 마감하시겠습니까?\n손님 주문이 즉시 불가능해집니다."
    );
    if (!ok) return;

    try {
      const updatedData = await updateBoothOpenStatus(targetId, isClosed);
      
      // 즉시 상태 반영 (GET api가 없더라도 동작하도록)
      if (updatedData && updatedData.open !== undefined) {
        setIsClosed(!updatedData.open);
      }
      
      // 마감 시간이 지났는데 영업 재개를 누른 경우, 강제 마감을 피하기 위해 설정된 마감시간을 삭제합니다.
      if (isClosed && savedCloseTime) {
        const now = new Date();
        const [ch, cm] = savedCloseTime.split(":").map(Number);
        const closeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ch, cm, 0);
        
        // 자정을 넘기는 영업시간 처리 (예: 18:00 ~ 02:00)
        if (savedOpenTime) {
          const [oh, om] = savedOpenTime.split(":").map(Number);
          const openDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), oh, om, 0);
          if (closeDate <= openDate) {
             if (now.getHours() < ch) {
               openDate.setDate(openDate.getDate() - 1);
             } else {
               closeDate.setDate(closeDate.getDate() + 1);
             }
          }
        }

        if (now.getTime() >= closeDate.getTime()) {
          await deleteBoothOperatingTime(targetId);
        }
      }
      
      // 상태 변경 후 서버에서 최신 상태를 다시 불러와서 정확하게 동기화 시도
      await fetchBoothStatus();
    } catch (err) {
      alert("영업 상태 변경에 실패했습니다.");
    }
  };

  const handleSaveTime = async () => {
    if (!openTime || !closeTime) {
      alert("오픈 시간과 마감 시간을 모두 설정해주세요.");
      return;
    }
    const targetId = currentBooth?.boothId || currentBooth?.id;
    if (!targetId) return;

    try {
      const openTimePayload = openTime.length === 5 ? openTime + ":00" : openTime;
      const closeTimePayload = closeTime.length === 5 ? closeTime + ":00" : closeTime;
      
      const data = await updateBoothOperatingTime(targetId, openTimePayload, closeTimePayload);
      const ot = data.openTime ? data.openTime.substring(0, 5) : null;
      const ct = data.closeTime ? data.closeTime.substring(0, 5) : null;
      setSavedOpenTime(ot);
      setSavedCloseTime(ct);
      alert("영업시간이 저장되었습니다.");
      fetchBoothStatus();
    } catch (err) {
      alert("영업시간 저장에 실패했습니다.");
    }
  };

  const handleClearTime = async () => {
    const targetId = currentBooth?.boothId || currentBooth?.id;
    if (!targetId) return;
    const ok = window.confirm("오늘 영업시간 설정을 삭제할까요?");
    if (!ok) return;

    try {
      await deleteBoothOperatingTime(targetId);
      setOpenTime("");
      setCloseTime("");
      setSavedOpenTime(null);
      setSavedCloseTime(null);
      fetchBoothStatus();
    } catch (err) {
      alert("영업시간 삭제에 실패했습니다.");
    }
  };

  const handleTimeConfirm = (newTime) => {
    if (timePickerTarget === "open") {
      setOpenTime(newTime);
    } else {
      setCloseTime(newTime);
    }
  };

  const handleBulkAdd = async () => {
    const count = Number(addCount);
    if (!count || count < 1) {
      alert("추가할 테이블 개수를 입력해주세요.");
      return;
    }
    const targetId = currentBooth?.boothId || currentBooth?.id;
    if (!targetId) return;

    setIsAddingTable(true);
    try {
      await bulkCreateTables(targetId, count);
      setAddCount("");
      await fetchTables();
    } catch (err) {
      alert(err.response?.data?.message || "테이블 추가에 실패했습니다.");
    } finally {
      setIsAddingTable(false);
    }
  };

  const handleDeactivateTable = async (tableId) => {
    const targetId = currentBooth?.boothId || currentBooth?.id;
    if (!window.confirm("이 테이블을 비활성화하시겠습니까?")) return;
    try {
      await deactivateTable(targetId, tableId);
      await fetchTables();
    } catch (err) {
      alert("비활성화에 실패했습니다.");
    }
  };

  const handleActivateTable = async (tableId) => {
    const targetId = currentBooth?.boothId || currentBooth?.id;
    if (!window.confirm("이 테이블을 다시 활성화하시겠습니까?\nQR 코드는 기존 그대로 유지됩니다.")) return;
    try {
      await activateTable(targetId, tableId);
      await fetchTables();
    } catch (err) {
      alert("활성화에 실패했습니다.");
    }
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

  const activeTables = tables.filter(t => t.active);

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
          {isClosed ? "영업 재개" : "영업 마감"}
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

      {/* 3. 영업시간 설정 영역 */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50 mb-8">
        <p className="text-toss-light text-[15px] font-bold mb-3">
          오늘 영업시간 설정
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTimePickerTarget("open");
                setIsTimePickerOpen(true);
              }}
              className="flex items-center bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl px-5 py-3 transition-colors group flex-1 justify-center sm:flex-none"
            >
              <span className="text-sm font-bold text-gray-500 mr-3">
                오픈시간
              </span>
              <span
                className={`text-xl font-bold ${
                  openTime
                    ? "text-gray-800 group-hover:text-toss-blue"
                    : "text-gray-400"
                }`}
              >
                {formatDisplayTime(openTime)}
              </span>
            </button>
            <span className="text-gray-400 font-bold mx-1">-</span>
            <button
              onClick={() => {
                setTimePickerTarget("close");
                setIsTimePickerOpen(true);
              }}
              className="flex items-center bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl px-5 py-3 transition-colors group flex-1 justify-center sm:flex-none"
            >
              <span className="text-sm font-bold text-gray-500 mr-3">
                마감시간
              </span>
              <span
                className={`text-xl font-bold ${
                  closeTime
                    ? "text-gray-800 group-hover:text-toss-blue"
                    : "text-gray-400"
                }`}
              >
                {formatDisplayTime(closeTime)}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveTime}
              className="px-4 py-3 rounded-2xl font-bold text-sm text-toss-blue bg-blue-50 hover:bg-blue-100 transition whitespace-nowrap flex-1"
            >
              설정 저장
            </button>
            <button
              onClick={handleClearTime}
              className="px-4 py-3 rounded-2xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition whitespace-nowrap flex-1"
            >
              초기화
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          {savedOpenTime && savedCloseTime
            ? `현재 저장된 영업시간: ${savedOpenTime} ~ ${savedCloseTime}`
            : "설정 없음 (자동 영업/마감 비활성)"}
        </p>
      </div>

      {/* 4. 테이블 관리 (백엔드 연동) */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg font-bold text-toss-dark flex items-center gap-2">
              테이블 관리 📋
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              테이블 개수를 입력하면 자동으로 QR 코드가 생성됩니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={addCount}
              onChange={(e) => setAddCount(e.target.value)}
              placeholder="추가할 개수"
              min="1"
              className="w-28 p-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-toss-blue"
            />
            <button
              onClick={handleBulkAdd}
              disabled={isAddingTable}
              className="px-5 py-3 bg-toss-blue text-white font-bold rounded-xl hover:bg-blue-600 transition shadow-sm disabled:opacity-50 whitespace-nowrap"
            >
              {isAddingTable ? "추가 중..." : "+ 테이블 추가"}
            </button>
          </div>
        </div>

        {/* 테이블 현황 요약 */}
        {tables.length > 0 && (
          <div className="flex items-center gap-3 mb-4 text-sm font-bold">
            <span className="text-toss-dark">
              전체 <span className="text-toss-blue">{tables.length}</span>개
            </span>
            <span className="text-green-600">
              활성 {tables.filter(t => t.active).length}개
            </span>
            {tables.filter(t => !t.active).length > 0 && (
              <span className="text-red-400">
                비활성 {tables.filter(t => !t.active).length}개
              </span>
            )}
          </div>
        )}

        {/* 테이블 목록 */}
        {tables.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400 font-medium">
              등록된 테이블이 없습니다.<br/>테이블을 추가해 주세요!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[420px] overflow-y-auto p-1">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`flex flex-col items-center p-4 bg-white border rounded-2xl shadow-sm transition-all ${
                  table.active
                    ? "border-gray-100 hover:shadow-md hover:border-toss-blue/30"
                    : "border-red-100 opacity-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-3 w-full justify-between">
                  <h4 className="font-bold text-toss-dark text-base">
                    {table.tableNumber}번 테이블
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    table.active
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-500"
                  }`}>
                    {table.active ? "활성" : "비활성"}
                  </span>
                </div>

                {/* QR 이미지: 백엔드에서 생성된 이미지 사용 */}
                {table.qrImageUrl ? (
                  <div className="bg-white p-1.5 rounded-lg border border-gray-100 mb-3">
                    <img
                      src={`${API_BASE_URL}${table.qrImageUrl}`}
                      alt={`Table ${table.tableNumber} QR`}
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-xs text-gray-400">QR 없음</span>
                  </div>
                )}

                {/* 테이블 토큰 */}
                <p className="text-[10px] text-gray-400 font-mono mb-3 truncate max-w-full">
                  {table.tableToken || "—"}
                </p>

                {table.active ? (
                  <button
                    onClick={() => handleDeactivateTable(table.id)}
                    className="w-full text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 py-1.5 rounded-lg transition"
                  >
                    비활성화
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivateTable(table.id)}
                    className="w-full text-xs font-bold text-toss-blue hover:text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition"
                  >
                    다시 활성화
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. QR 인쇄 영역 */}
      {activeTables.length > 0 && (
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-toss-dark flex items-center gap-2">
              QR 코드 인쇄 🖨️
            </h3>
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>인쇄하기</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto p-2 border border-dashed border-gray-300 rounded-xl">
            {activeTables.map((table) => (
              <div
                key={table.id}
                className="flex flex-col items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
              >
                <h4 className="font-bold text-toss-dark mb-2">
                  {table.tableNumber}번 테이블
                </h4>
                {table.qrImageUrl && (
                  <img
                    src={`${API_BASE_URL}${table.qrImageUrl}`}
                    alt={`Table ${table.tableNumber} QR`}
                    className="w-20 h-20 object-contain"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. 부스 삭제 영역 (위험 구역) */}
      <div className="mt-8 pt-8 border-t border-gray-200/60 flex justify-end">
        <button
          onClick={handleDeleteBooth}
          className="px-4 py-2 text-sm font-bold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          부스 삭제하기
        </button>
      </div>

      <TossTimePicker
        isOpen={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        onConfirm={handleTimeConfirm}
        initialTime={timePickerTarget === "open" ? (openTime || "09:00") : (closeTime || "22:00")}
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

      {/* 인쇄 전용 영역 */}
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
          {activeTables.map((table) => (
            <div key={table.id} className="print-item">
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "900",
                  marginBottom: "10px",
                }}
              >
                {table.tableNumber}번 테이블
              </h2>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "10px",
                }}
              >
                {table.qrImageUrl && (
                  <img
                    src={`${API_BASE_URL}${table.qrImageUrl}`}
                    alt={`Table ${table.tableNumber} QR`}
                    style={{ width: "150px", height: "150px" }}
                  />
                )}
              </div>
              <p style={{ fontSize: "12px", color: "#666" }}>
                {currentStoreName} <br />
                카메라로 스캔하여 주문해주세요🍺
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessManage;
