import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "owners";

const loadOwners = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveOwners = (owners) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(owners));
};

const formatDate = (iso) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "-";
  }
};

const ApprovalManage = () => {
  const [owners, setOwners] = useState(() => loadOwners());

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setOwners(loadOwners());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ✅ 승인 대기 목록만
  const pending = useMemo(() => owners.filter((o) => !o.approved), [owners]);

  const handleApprove = (id) => {
    const target = owners.find((o) => o.id === id);
    if (!target) return;

    if (
      window.confirm(`'${target.name || id}' 계정의 가입을 승인하시겠습니까?`)
    ) {
      const next = owners.map((o) =>
        o.id === id
          ? { ...o, approved: true, approvedAt: new Date().toISOString() }
          : o
      );
      saveOwners(next);
      setOwners(next);
      alert("승인되었습니다. (사장님 계정 활성화)");
    }
  };

  const handleReject = (id) => {
    const target = owners.find((o) => o.id === id);
    if (!target) return;

    if (
      window.confirm(`'${target.name || id}' 계정의 가입을 거절하시겠습니까?`)
    ) {
      // ✅ 거절 = 목록에서 제거(원하면 approved:false 유지로 바꿀 수도 있음)
      const next = owners.filter((o) => o.id !== id);
      saveOwners(next);
      setOwners(next);
    }
  };

  return (
    <div className="pb-10 font-sans px-2">
      <h2 className="text-2xl font-bold text-toss-dark mb-6">
        가입 승인 대기 <span className="text-toss-blue">{pending.length}</span>
        건
      </h2>

      {pending.length === 0 ? (
        <div className="h-[400px] flex flex-col justify-center items-center text-toss-light bg-white rounded-2xl border border-gray-100">
          <p className="text-xl font-bold">대기 중인 가입 요청이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pending.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              {/* 왼쪽: 신청 정보 */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-50 text-toss-blue text-xs font-bold px-2 py-1 rounded">
                    신규신청
                  </span>

                  {/* ✅ 여기: 아이디 대신 학과 표시 */}
                  <h3 className="font-bold text-toss-dark text-lg">
                    {item.department || "학과 미입력"}
                  </h3>
                </div>

                {/* 대표(이름) + 전화번호는 유지 */}
                <p className="text-sm text-toss-light mb-2">
                  대표: {item.name || "-"} <span className="mx-2">|</span>{" "}
                  {item.phone || "-"}
                </p>

                {/* ✅ 학과를 위로 올렸으니 학번만 표시 */}
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg inline-block">
                  학번: {item.studentId || "-"}
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  신청일: {formatDate(item.createdAt)}
                </p>
              </div>

              {/* 오른쪽: 승인/거절 버튼 */}
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => handleReject(item.id)}
                  className="flex-1 md:flex-none px-5 py-3 rounded-xl font-bold text-toss-red bg-red-50 hover:bg-red-100 transition"
                >
                  거절
                </button>
                <button
                  onClick={() => handleApprove(item.id)}
                  className="flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-white bg-toss-blue hover:bg-blue-600 shadow-lg shadow-blue-100 transition"
                >
                  승인하기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalManage;
