import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_PIN_KEY = "admin_pin";
const DEFAULT_ADMIN_PIN = "0000";

const getAdminPin = () =>
  localStorage.getItem(ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;

const onlyDigits = (v) => v.replace(/[^\d]/g, "").slice(0, 4);

const AdminPinManage = () => {
  const navigate = useNavigate();

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPin2, setNewPin2] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const savedPin = getAdminPin();

  /* =========================
     현재 비밀번호 검증 상태
  ========================= */
  const isCurrentPinWrong = currentPin.length === 4 && currentPin !== savedPin;

  /* =========================
     새 비밀번호 일치 여부
  ========================= */
  const pinMatchState = useMemo(() => {
    if (newPin.length < 4 || newPin2.length < 4) return null;
    return newPin === newPin2;
  }, [newPin, newPin2]);

  const handleChange = (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (isCurrentPinWrong)
      return setError("현재 비밀번호가 올바르지 않습니다.");

    if (newPin.length !== 4)
      return setError("새 비밀번호는 4자리 숫자여야 합니다.");

    if (newPin !== newPin2)
      return setError("새 비밀번호가 서로 일치하지 않습니다.");

    localStorage.setItem(ADMIN_PIN_KEY, newPin);

    setOk("비밀번호가 변경되었습니다.");
    setCurrentPin("");
    setNewPin("");
    setNewPin2("");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex justify-center pt-6 pb-10 px-2">
      <div className="w-full max-w-[520px]">
        {/* 헤더 */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-toss-dark tracking-tight">
            관리자 설정
          </h2>
          <p className="text-sm text-toss-light mt-2">
            관리자 비밀번호(PIN)를 변경합니다.
          </p>
        </div>

        {/* 카드 */}
        <div className="bg-white p-7 rounded-[24px] shadow-sm border border-gray-50">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-bold">
              {error}
            </div>
          )}
          {ok && (
            <div className="mb-4 px-4 py-3 rounded-2xl bg-blue-50 text-toss-blue text-sm font-bold">
              {ok}
            </div>
          )}

          <form onSubmit={handleChange} className="space-y-4">
            {/* 현재 비밀번호 */}
            <div>
              <label className="block text-sm font-bold text-toss-dark mb-1">
                현재 비밀번호
              </label>
              <input
                type="password"
                value={currentPin}
                onChange={(e) => setCurrentPin(onlyDigits(e.target.value))}
                inputMode="numeric"
                placeholder="4자리"
                className={`w-full p-4 rounded-xl outline-none transition
                  ${
                    isCurrentPinWrong
                      ? "bg-red-50 border border-red-300 focus:ring-2 focus:ring-red-200"
                      : "bg-toss-grey focus:ring-2 focus:ring-toss-blue/50"
                  }`}
              />
              {isCurrentPinWrong && (
                <p className="mt-2 text-sm font-bold text-toss-red">
                  현재 비밀번호가 올바르지 않습니다.
                </p>
              )}
            </div>

            {/* 새 비밀번호 */}
            <div>
              <label className="block text-sm font-bold text-toss-dark mb-1">
                새 비밀번호 (4자리)
              </label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(onlyDigits(e.target.value))}
                inputMode="numeric"
                placeholder="숫자 4자리"
                className="w-full p-4 bg-toss-grey rounded-xl outline-none focus:ring-2 focus:ring-toss-blue/50 transition"
              />
            </div>

            {/* 새 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-bold text-toss-dark mb-1">
                새 비밀번호 확인
              </label>
              <input
                type="password"
                value={newPin2}
                onChange={(e) => setNewPin2(onlyDigits(e.target.value))}
                inputMode="numeric"
                placeholder="한 번 더 입력"
                className={`w-full p-4 rounded-xl outline-none transition
                  ${
                    pinMatchState === false
                      ? "bg-red-50 border border-red-300 focus:ring-2 focus:ring-red-200"
                      : pinMatchState === true
                      ? "bg-blue-50 border border-blue-300 focus:ring-2 focus:ring-blue-200"
                      : "bg-toss-grey focus:ring-2 focus:ring-toss-blue/50"
                  }`}
              />

              {pinMatchState === true && (
                <p className="mt-2 text-sm font-bold text-toss-blue">
                  비밀번호가 일치합니다.
                </p>
              )}
              {pinMatchState === false && (
                <p className="mt-2 text-sm font-bold text-toss-red">
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
            </div>

            {/* 저장 버튼 */}
            <button
              disabled={
                isCurrentPinWrong ||
                pinMatchState !== true ||
                newPin.length !== 4
              }
              className={`w-full py-4 rounded-xl font-bold text-lg transition
                ${
                  !isCurrentPinWrong &&
                  pinMatchState === true &&
                  newPin.length === 4
                    ? "bg-toss-blue text-white hover:bg-blue-600"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              비밀번호 변경
            </button>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => navigate("/admin/approval")}
                className="flex-1 py-3 rounded-xl bg-white border border-gray-100 text-gray-700 font-bold hover:bg-gray-50 transition"
              >
                돌아가기
              </button>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setOk("");
                  setCurrentPin("");
                  setNewPin("");
                  setNewPin2("");
                }}
                className="flex-1 py-3 rounded-xl bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 transition"
              >
                초기화
              </button>
            </div>

            <p className="text-xs text-toss-light mt-2">
              * 비밀번호는 숫자 4자리로만 설정 가능합니다.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPinManage;
