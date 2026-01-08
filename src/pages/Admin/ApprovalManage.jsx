import React, { useState } from "react";

// 승인 대기 목록 (더미 데이터)
const PENDING_STORES = [
  {
    id: 1,
    name: "백종원의 요리비책",
    owner: "백종원",
    phone: "010-1234-5678",
    date: "2026-01-09",
    desc: "한식 전문점입니다.",
  },
  {
    id: 2,
    name: "성수동 핫플",
    owner: "김힙합",
    phone: "010-9876-5432",
    date: "2026-01-09",
    desc: "감성 카페 및 펍",
  },
  {
    id: 3,
    name: "탕후루 왕가",
    owner: "설탕왕",
    phone: "010-5555-5555",
    date: "2026-01-10",
    desc: "과일 탕후루 전문",
  },
];

const ApprovalManage = () => {
  const [list, setList] = useState(PENDING_STORES);

  const handleApprove = (name) => {
    if (window.confirm(`'${name}' 매장의 가입을 승인하시겠습니까?`)) {
      alert("승인되었습니다. (사장님 계정 활성화)");
      setList(list.filter((item) => item.name !== name)); // 실제론 서버로 전송
    }
  };

  const handleReject = (name) => {
    if (window.confirm(`'${name}' 매장의 가입을 거절하시겠습니까?`)) {
      setList(list.filter((item) => item.name !== name));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-toss-dark mb-6">
        가입 승인 대기 <span className="text-toss-blue">{list.length}</span>건
      </h2>

      {list.length === 0 ? (
        <div className="h-[400px] flex flex-col justify-center items-center text-toss-light bg-white rounded-2xl border border-gray-100">
          <p className="text-xl">대기 중인 가입 요청이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {list.map((item) => (
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
                  <h3 className="font-bold text-toss-dark text-lg">
                    {item.name}
                  </h3>
                </div>
                <p className="text-sm text-toss-light mb-2">
                  대표: {item.owner} <span className="mx-2">|</span>{" "}
                  {item.phone}
                </p>
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg inline-block">
                  "{item.desc}"
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  신청일: {item.date}
                </p>
              </div>

              {/* 오른쪽: 승인/거절 버튼 */}
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => handleReject(item.name)}
                  className="flex-1 md:flex-none px-5 py-3 rounded-xl font-bold text-toss-red bg-red-50 hover:bg-red-100 transition"
                >
                  거절
                </button>
                <button
                  onClick={() => handleApprove(item.name)}
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
