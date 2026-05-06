import React, { useEffect, useMemo, useState } from "react";
import Button from "../../components/common/Button";

const OWNERS_KEY = "owners";
const BOOTHS_KEY = "owner_booths_v1";

const loadOwners = () => {
  try {
    const raw = localStorage.getItem(OWNERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const loadBooths = () => {
  try {
    const raw = localStorage.getItem(BOOTHS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const BoothApprovalManage = () => {
  const [owners, setOwners] = useState(() => loadOwners());
  const [allBooths, setAllBooths] = useState(() => loadBooths());

  useEffect(() => {
    const onStorage = () => {
      setOwners(loadOwners());
      setAllBooths(loadBooths());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const refresh = () => {
    setOwners(loadOwners());
    setAllBooths(loadBooths());
  };

  // 대기 중인 부스 목록 추출
  const pendingBooths = useMemo(() => {
    const list = [];
    Object.keys(allBooths).forEach((ownerId) => {
      const owner = owners.find((o) => o.id === ownerId) || { name: "알 수 없음", department: "알 수 없음" };
      const ownerBoothList = allBooths[ownerId] || [];
      
      ownerBoothList.forEach((booth, index) => {
        if (booth.status === "pending") {
          list.push({
            ownerId,
            ownerName: owner.name,
            ownerDept: owner.department,
            boothIndex: index,
            ...booth,
          });
        }
      });
    });
    return list;
  }, [owners, allBooths]);

  const handleApprove = (ownerId, boothName) => {
    if (!window.confirm(`'${boothName}' 부스를 승인하시겠습니까?`)) return;

    const newBooths = { ...allBooths };
    if (newBooths[ownerId]) {
      newBooths[ownerId] = newBooths[ownerId].map((b) => 
        b.name === boothName ? { ...b, status: "approved" } : b
      );
      localStorage.setItem(BOOTHS_KEY, JSON.stringify(newBooths));
      setAllBooths(newBooths);
      alert("부스가 승인되었습니다.");
    }
  };

  const handleReject = (ownerId, boothName) => {
    if (!window.confirm(`'${boothName}' 부스 등록을 거절(삭제)하시겠습니까?`)) return;

    const newBooths = { ...allBooths };
    if (newBooths[ownerId]) {
      newBooths[ownerId] = newBooths[ownerId].filter((b) => b.name !== boothName);
      localStorage.setItem(BOOTHS_KEY, JSON.stringify(newBooths));
      setAllBooths(newBooths);
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
                  신청자: {item.ownerName} ({item.ownerDept}) <span className="mx-2">|</span> ID: {item.ownerId}
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
                  onClick={() => handleReject(item.ownerId, item.name)}
                  className="flex-1 md:flex-none text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600"
                >
                  거절
                </Button>
                <Button
                  onClick={() => handleApprove(item.ownerId, item.name)}
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
