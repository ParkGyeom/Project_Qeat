import React, { useState } from "react";
import SalesChart from "../../components/owner/SalesChart";
import { formatPrice } from "../../utils/format";

// 1. 매출 데이터 (그래프용)
const DAILY_SALES = [
  { date: "2/5 (목)", amount: 450000 },
  { date: "2/6 (금)", amount: 620000 },
  { date: "2/7 (토)", amount: 980000 },
  { date: "2/8 (일)", amount: 850000 },
  { date: "2/9 (월)", amount: 320000 },
  { date: "2/10 (화)", amount: 150000 },
];

// 2. 상세 주문 내역 데이터 (날짜별 더미 데이터)
const SALES_DETAIL_DATA = {
  "2/5 (목)": [
    { id: 101, time: "14:20", menu: "후라이드 치킨 외 2건", price: 23000 },
    { id: 102, time: "15:10", menu: "생맥주 500cc", price: 4500 },
  ],
  "2/6 (금)": [
    { id: 201, time: "18:00", menu: "양념 치킨", price: 19000 },
    { id: 202, time: "19:30", menu: "치즈볼 외 1건", price: 12000 },
    { id: 203, time: "20:15", menu: "콜라", price: 2000 },
  ],
  // ... 다른 날짜 데이터도 있다고 가정
};

const SalesManage = () => {
  const totalSales = DAILY_SALES.reduce((acc, cur) => acc + cur.amount, 0);
  const totalOrders = 142;

  // [New] 선택된 날짜 상태 관리
  const [selectedDate, setSelectedDate] = useState(null);

  // 선택된 날짜의 주문 목록 가져오기 (없으면 빈 배열)
  const selectedOrders = selectedDate
    ? SALES_DETAIL_DATA[selectedDate] || []
    : [];

  return (
    <div className="pb-10">
      <h2 className="text-2xl font-bold text-toss-dark mb-6">매출 현황</h2>

      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-toss-light text-sm font-bold mb-1">
            이번 축제 총 매출
          </p>
          <h3 className="text-3xl font-bold text-toss-blue">
            {formatPrice(totalSales)}원
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-toss-light text-sm font-bold mb-1">총 주문 건수</p>
          <h3 className="text-3xl font-bold text-toss-dark">{totalOrders}건</h3>
        </div>
      </div>

      {/* 그래프 영역 */}
      <div className="mb-6">
        <SalesChart
          data={DAILY_SALES}
          selectedDate={selectedDate}
          onDateClick={setSelectedDate}
        />
      </div>

      {/* [New] 하단 상세 내역 영역 (날짜 선택 시에만 보임) */}
      {selectedDate && (
        <div className="animate-fade-in">
          <h3 className="text-xl font-bold text-toss-dark mb-4 flex items-center">
            <span className="text-toss-blue mr-2">{selectedDate}</span>
            주문 내역
          </h3>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {selectedOrders.length === 0 ? (
              <div className="p-10 text-center text-toss-light">
                해당 날짜에 기록된 상세 내역이 없습니다. (더미데이터 부족)
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-500">
                      시간
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-500">
                      주문 내용
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-500 text-right">
                      결제 금액
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="p-4 text-sm text-toss-light font-medium">
                        {order.time}
                      </td>
                      <td className="p-4 text-sm text-toss-dark font-bold">
                        {order.menu}
                      </td>
                      <td className="p-4 text-sm text-toss-blue font-bold text-right">
                        {formatPrice(order.price)}원
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesManage;
