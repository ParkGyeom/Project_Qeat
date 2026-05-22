import React, { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import { getPendingBooths, approveBooth, rejectBooth } from "../../api/boothApi";

const BoothApprovalManage = () => {
  const [pendingBooths, setPendingBooths] = useState([]);

  const fetchPendingBooths = async () => {
    try {
      const data = await getPendingBooths();
      setPendingBooths(data || []);
    } catch (err) {
      console.error("Failed to fetch pending booths", err);
      alert("대기 중인 부스 목록을 불러오는데 실패했습니다: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchPendingBooths();
  }, []);

  const refresh = () => {
    fetchPendingBooths();
  };

  const handleApprove = async (boothId, boothName) => {
    if (!window.confirm(`'${boothName}' 부스를 승인하시겠습니까?`)) return;

    try {
      await approveBooth(boothId);
      alert("부스가 승인되었습니다.");
      fetchPendingBooths();
    } catch (err) {
      alert("승인 처리에 실패했습니다.");
    }
  };

  const handleReject = async (boothId, boothName) => {
    if (!window.confirm(`'${boothName}' 부스 등록을 거절하시겠습니까?`)) return;

    try {
      await rejectBooth(boothId);
      alert("부스가 거절되었습니다.");
      fetchPendingBooths();
    } catch (err) {
      alert("거절 처리에 실패했습니다.");
    }
  };

  return (
    <div className="pb-10 font-sans px-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-toss-dark tracking-tight">
            부스 가입 승인 <span className="text-toss-blue">{pendingBooths.length}</span>건
          </h2>
          <p className="text-sm text-toss-light mt-1">
            새로 등록된 부스들의 영업 허가를 관리합니다.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          새로고침
        </Button>
      </div>

      {pendingBooths.length === 0 ? (
        <div className="h-[400px] flex flex-col justify-center items-center text-toss-light bg-white rounded-2xl border border-gray-100">
          <p className="text-xl font-bold">승인 대기 중인 부스가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingBooths.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2 py-1 rounded">
                    승인 대기
                  </span>
                  <h3 className="font-bold text-toss-dark text-lg">
                    {item.name}
                  </h3>
                </div>

                <p className="text-sm text-toss-light mb-2">
                  부스 ID: {item.boothId} <span className="mx-2">|</span> 학년: {item.grade || "-"}
                </p>

                <div className="text-xs text-gray-500 font-bold bg-gray-50 px-3 py-2 rounded-lg inline-flex gap-2">
                  <span>은행: {item.bank || "-"}</span>
                  <span className="text-gray-300">|</span>
                  <span>계좌: {item.accountNumber || "-"}</span>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="secondary"
                  onClick={() => handleReject(item.boothId, item.name)}
                  className="flex-1 md:flex-none text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600"
                >
                  거절
                </Button>
                <Button
                  onClick={() => handleApprove(item.boothId, item.name)}
                  className="flex-1 md:flex-none px-8 font-bold shadow-lg shadow-blue-100"
                >
                  승인하기
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoothApprovalManage;
