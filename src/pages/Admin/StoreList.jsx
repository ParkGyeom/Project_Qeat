import React, { useState } from "react";
import { formatPrice } from "../../utils/format";

// 깔끔한 데이터 (카테고리/소속 제거)
const ACTIVE_STORES = [
  {
    id: 1,
    name: "맛있는 파스타",
    owner: "이쉐프",
    status: "영업중",
    sales: 1540000,
  },
  {
    id: 2,
    name: "시원한 맥주창고",
    owner: "박사장",
    status: "준비중",
    sales: 82000,
  },
  {
    id: 3,
    name: "한양대 축제부스",
    owner: "총학생회",
    status: "영업중",
    sales: 3370000,
  },
  {
    id: 4,
    name: "철수네 떡볶이",
    owner: "김철수",
    status: "영업중",
    sales: 450000,
  },
];

const StoreList = () => {
  const [stores, setStores] = useState(ACTIVE_STORES);

  const handleDelete = (id, name) => {
    if (
      window.confirm(
        `정말 '${name}' 매장을 시스템에서 삭제하시겠습니까?\n(이 작업은 되돌릴 수 없습니다.)`
      )
    ) {
      setStores(stores.filter((store) => store.id !== id));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-toss-dark mb-6">
        서비스 이용 매장 <span className="text-toss-blue">{stores.length}</span>
        곳
      </h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* 리스트 헤더 */}
        <div className="hidden md:flex bg-gray-50 border-b border-gray-100 p-4 text-xs font-bold text-gray-500">
          <div className="flex-1">매장 정보</div>
          <div className="w-32 text-center">상태</div>
          <div className="w-40 text-right pr-4">누적 매출</div>
          <div className="w-24 text-center">관리</div>
        </div>

        {/* 리스트 아이템 */}
        {stores.map((store) => (
          <div
            key={store.id}
            className="p-5 border-b border-gray-100 last:border-0 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-50 transition gap-4"
          >
            {/* 1. 매장 정보 (군더더기 없이 이름만) */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-toss-dark text-lg whitespace-nowrap truncate mb-1">
                {store.name}
              </h3>
              <p className="text-sm text-toss-light truncate">
                대표: {store.owner}
              </p>
            </div>

            {/* 2. 상태 */}
            <div className="w-full md:w-32 flex md:justify-center flex-none">
              <span
                className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                  store.status === "영업중"
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                ● {store.status}
              </span>
            </div>

            {/* 3. 매출액 */}
            <div className="w-full md:w-40 flex md:justify-end items-center gap-2 flex-none">
              <span className="md:hidden text-sm text-gray-400 whitespace-nowrap">
                누적 매출:
              </span>
              <span className="font-bold text-toss-blue text-lg whitespace-nowrap">
                {formatPrice(store.sales)}원
              </span>
            </div>

            {/* 4. 관리 버튼 */}
            <div className="w-full md:w-24 flex md:justify-center flex-none">
              <button
                onClick={() => handleDelete(store.id, store.name)}
                className="text-sm text-toss-light hover:text-toss-red underline decoration-1 underline-offset-4 transition whitespace-nowrap"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreList;
