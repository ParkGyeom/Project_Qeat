import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/cartStore";
import { formatPrice } from "../../utils/format";
// 가짜 API
import { createGuestOrder } from "../../api/orderApi";
import { getBoothInfo } from "../../utils/storeInfo";

const OrderBottomSheet = ({
  isOpen,
  onClose,
  tableNumber = "1",
  tableToken,
  isClosed = false,
}) => {
  const { cart, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const totalPrice = useMemo(() => {
    return (cart || []).reduce((acc, item) => acc + item.price * item.count, 0);
  }, [cart]);

  const canSubmit =
    !isClosed && !submitting && Array.isArray(cart) && cart.length > 0;

  const handleOrderSubmit = async () => {
    if (!Array.isArray(cart) || cart.length === 0) return;

    if (isClosed) {
      alert("영업이 종료되어 주문이 불가능합니다.");
      return;
    }

    if (!tableToken) {
      alert("유효하지 않은 QR 접근입니다.");
      return;
    }

    try {
      setSubmitting(true);

      // 백엔드 명세에 맞춰 변환 (수량 최소 1 이상 보장)
      const orderRequest = {
        items: cart.map(item => ({
          menuId: item.id,
          quantity: Math.max(1, item.count)
        }))
      };

      await createGuestOrder(tableToken, orderRequest);

      // 3. 후속 처리
      clearCart();
      onClose?.();
      navigate(`/guest/order-complete?table=${tableNumber}`);
    } catch (e) {
      // ✅ 흰화면 방지 + 안내
      if (String(e?.response?.data?.message || "") === "BUSINESS_CLOSED") {
        alert("영업이 종료되어 주문이 불가능합니다.");
        return;
      }
      console.error(e);
      alert("주문 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const boothInfo = getBoothInfo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !submitting && onClose?.()}
      />

      <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl p-6 shadow-2xl animate-slide-up text-left">
        <h2 className="text-xl font-bold text-toss-dark mb-6">
          주문 내역 확인
        </h2>

        {/* ✅ 영업 종료 안내 (기존 UI 톤 유지하면서만 추가) */}
        {isClosed && (
          <div className="mb-5 bg-red-50 border border-red-100 text-red-700 rounded-2xl px-4 py-3">
            <p className="text-sm font-extrabold">🔒 영업 종료</p>
            <p className="text-xs font-semibold mt-1">
              현재 주문이 불가능합니다. 영업 재개 후 다시 이용해주세요.
            </p>
          </div>
        )}

        <div className="max-h-[30vh] overflow-y-auto mb-6 space-y-3">
          {(cart || []).map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center text-toss-dark"
            >
              <span>
                {item.name}{" "}
                <span className="text-toss-blue font-bold">x{item.count}</span>
              </span>

              {/* 직원호출은 금액 대신 '호출' 표시 (기존 유지) */}
              <span>
                {item.category === "직원호출"
                  ? "호출"
                  : `${formatPrice(item.price * item.count)}원`}
              </span>
            </div>
          ))}
        </div>

        <div className="h-[1px] bg-toss-grey w-full mb-4"></div>

        <div className="flex justify-between items-center mb-8">
          <span className="text-lg font-bold text-toss-light">총 결제금액</span>
          <span className="text-2xl font-bold text-toss-blue">
            {formatPrice(totalPrice)}원
          </span>
        </div>

        <div className="bg-toss-grey p-4 rounded-xl mb-4">
          <p className="text-sm text-toss-light mb-1">
            입금 계좌 ({boothInfo.bank || "사장님 계좌"})
          </p>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-toss-dark text-lg">
              {boothInfo.accountNumber || "정보 없음"}
            </span>
            <button
              onClick={() => {
                if (boothInfo.accountNumber) {
                  navigator.clipboard.writeText(boothInfo.accountNumber);
                  alert("계좌번호가 복사되었습니다.");
                } else {
                  alert("등록된 계좌번호가 없습니다.");
                }
              }}
              className="text-xs bg-white border border-gray-300 px-2 py-1 rounded text-toss-dark active:bg-gray-100 transition"
            >
              복사
            </button>
          </div>

          {/* ✅ 테이블 번호 문구도 연동 */}
          <p className="text-xs text-toss-red font-bold">
            ※ 입금자명을 반드시 '테이블 번호({tableNumber}번)'로 해주세요!
          </p>
        </div>

        {/* ✅ 영업 종료/제출중/장바구니 비었을 때 버튼 비활성 (UI 스타일 유지) */}
        <button
          onClick={handleOrderSubmit}
          disabled={!canSubmit}
          className={`w-full py-4 rounded-xl font-bold text-lg transition ${
            canSubmit
              ? "bg-toss-blue text-white hover:bg-blue-600"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isClosed
            ? "영업 종료 (주문 불가)"
            : submitting
            ? "주문 처리 중..."
            : "입금 완료 및 주문하기"}
        </button>
      </div>
    </div>
  );
};

export default OrderBottomSheet;
