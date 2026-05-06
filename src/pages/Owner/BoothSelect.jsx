import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setBoothInfo } from "../../utils/storeInfo";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import { getMe, logoutApi } from "../../api/authApi";
import { getMyBooths, createBooth, updateBooth, deleteBooth } from "../../api/boothApi";

const SESSION_KEY = "owner_session";

const BANK_MAP = {
  "국민은행": "KB",
  "신한은행": "SHINHAN",
  "우리은행": "WOORI",
  "하나은행": "HANA",
  "농협은행": "NH",
  "기업은행": "IBK",
  "카카오뱅크": "KAKAO",
  "토스뱅크": "TOSS"
};

const REVERSE_BANK_MAP = {
  "KB": "국민은행",
  "SHINHAN": "신한은행",
  "WOORI": "우리은행",
  "HANA": "하나은행",
  "NH": "농협은행",
  "IBK": "기업은행",
  "KAKAO": "카카오뱅크",
  "TOSS": "토스뱅크"
};

const BANK_OPTIONS = Object.keys(BANK_MAP);

/* -----------------------------
  Helpers
------------------------------ */
const onlyDigits = (v) => (v || "").replace(/\D/g, "");

const BoothSelect = () => {
  const navigate = useNavigate();
  const [booths, setBooths] = useState([]);
  const [newBoothName, setNewBoothName] = useState("");
  const [newBankSelect, setNewBankSelect] = useState("");
  const [newBankCustom, setNewBankCustom] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 수정 관련 상태
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", bank: "", accountNumber: "" });

  const fetchBooths = async () => {
    try {
      const list = await getMyBooths();
      console.log("Fetched Booths Data:", list); // 확인용 로그
      setBooths(list);
    } catch (err) {
      console.error("Failed to fetch booths", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getMe();
        setOwnerId(user.id);
        
        // 세션 정보 최신화
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            id: user.studentNumber || user.id,
            name: user.name || "사용자",
            role: user.role,
            approved: true,
            loginAt: new Date().toISOString(),
          })
        );
        
        await fetchBooths();
      } catch (err) {
        console.error("getMe error:", err);
        alert("세션 확인 실패: " + (err.response?.data?.message || err.message));
        navigate("/owner/login");
      }
    };
    init();
  }, [navigate]);

  const bankValue = newBankSelect;

  const handleAddBooth = async () => {
    const name = newBoothName.trim();
    const bank = bankValue.trim();
    const account = newAccountNumber.replace(/-/g, "").trim(); // 하이픈 제거
    
    if (!name || !bank || !account) {
      alert("부스 이름, 은행, 계좌번호를 모두 입력해주세요.");
      return;
    }
    
    try {
      await createBooth({
        name,
        bank: BANK_MAP[bank] || bank,
        accountNumber: account,
        description: "새로 등록된 부스입니다."
      });
      
      setNewBoothName("");
      setNewBankSelect("");
      setNewBankCustom("");
      setNewAccountNumber("");
      setIsAddModalOpen(false);
      
      await fetchBooths();
    } catch (err) {
      alert(err.response?.data?.message || "부스 등록에 실패했습니다.");
    }
  };

  const handleAccountChange = (val, isEdit = false) => {
    const digits = onlyDigits(val);
    if (isEdit) {
      setEditForm(prev => ({ ...prev, accountNumber: digits }));
    } else {
      setNewAccountNumber(digits);
    }
  };

  const handleDeleteBooth = async (booth, e) => {
    e.stopPropagation();
    if (!window.confirm(`'${booth.name}' 부스를 삭제하시겠습니까? 관련 데이터가 모두 삭제될 수 있습니다.`)) return;
    
    try {
      await deleteBooth(booth.boothId);
      await fetchBooths();
    } catch (err) {
      alert("삭제에 실패했습니다.");
    }
  };

  const handleSelectBooth = (booth) => {
    if (editingIndex !== null) return; // 수정 중에는 선택 이동 방지
    if (booth.boothStatus === "PENDING" || booth.status === "pending") {
      alert("관리자 승인 대기 중인 부스입니다. 승인 완료 후 이용 가능합니다.");
      return;
    }
    if (booth.boothStatus === "REJECTED" || booth.status === "rejected") {
      alert("관리자에 의해 승인이 거절된 부스입니다.");
      return;
    }
    setBoothInfo(booth);
    navigate("/owner/orders");
  };

  const handleStartEdit = (index, e, booth) => {
    e.stopPropagation();
    setEditingIndex(index);
    setEditForm({ ...booth });
  };

  const handleSaveEdit = async (index, e) => {
    e.stopPropagation();
    const targetBooth = booths[index];
    const newName = editForm.name.trim();
    
    if (!newName || !editForm.bank.trim() || !editForm.accountNumber.trim()) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    try {
      await updateBooth(targetBooth.boothId, {
        name: newName,
        bank: BANK_MAP[editForm.bank.trim()] || editForm.bank.trim(),
        accountNumber: editForm.accountNumber.replace(/-/g, "").trim(), // 하이픈 제거
        description: targetBooth.description || "수정된 부스입니다."
      });
      setEditingIndex(null);
      await fetchBooths();
    } catch (err) {
      alert(err.response?.data?.message || "수정에 실패했습니다.");
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingIndex(null);
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem(SESSION_KEY);
    navigate("/owner/login");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-indigo-900 via-toss-blue to-[#F4F7FB] relative overflow-hidden">
      {/* 자연스러운 톤 연결을 돕는 은은한 빛 번짐 효과 */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-500/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[30vw] h-[30vw] bg-[#F4F7FB]/60 rounded-full blur-[100px] pointer-events-none" />

      {/* 배경 로고 (화면 전체 우측에 거대하게 배치) - 화이트 톤으로 필터 적용 */}
      <img
        src="/sejong_logo.svg"
        alt="Sejong Logo"
        className="absolute top-1/2 right-0 translate-x-[35%] -translate-y-1/2 w-[180vw] sm:w-[150vw] lg:w-[1400px] opacity-[0.15] pointer-events-none z-0 brightness-0 invert mix-blend-overlay"
      />

      {/* Left Panel: Branding & Visuals */}
      <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center p-12 z-10">
        <div className="relative w-full max-w-md">
          <div className="mb-12">
            <span className="text-4xl font-black tracking-tighter text-white">
              Qeat <span className="text-blue-200">Business</span>
            </span>
          </div>
          
          <h1 className="text-[38px] leading-[1.3] font-extrabold text-white tracking-tight mb-6">
            어떤 부스를<br />운영하시나요?
          </h1>
          <p className="text-[17px] text-blue-100/90 font-medium leading-relaxed">
            운영할 부스를 선택하거나 새 부스를 등록하여<br />
            스마트한 관리를 시작하세요.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative z-10 overflow-y-auto">
        {/* Mobile Header Logo */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8 lg:hidden z-20">
          <span className="text-2xl font-black tracking-tighter text-white drop-shadow-md">
            Qeat <span className="text-blue-200 whitespace-nowrap">Business</span>
          </span>
        </div>

        {/* 화이트 글래스 카드 */}
        <div className="w-full max-w-[600px] bg-white/95 backdrop-blur-2xl p-8 sm:p-10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 relative z-10 flex flex-col min-h-[600px]">
          
          <div className="flex justify-between items-start mb-8 pt-10 lg:pt-0">
            <div>
              <h2 className="text-[32px] font-extrabold text-toss-dark tracking-tight mb-2">
                부스 관리 센터
              </h2>
              <p className="text-toss-light text-[15px] font-medium">
                운영할 부스를 선택해 주세요
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="px-4 shadow-sm"
            >
              로그아웃
            </Button>
          </div>

          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title="새 부스 등록"
          >
            <div className="space-y-5 pt-2">
              {/* 관리자 승인 안내 멘트 */}
              <div className="bg-blue-50/80 text-toss-blue text-sm font-bold px-4 py-3 rounded-xl border border-blue-100 flex items-start gap-2 animate-fade-in shadow-sm">
                <span className="text-base leading-none mt-0.5">💡</span>
                <p>새로 등록한 부스는 <span className="text-blue-600 font-extrabold">관리자 승인 후</span> 운영이 가능합니다.</p>
              </div>

              <Input
                label="부스 이름"
                value={newBoothName}
                onChange={(e) => setNewBoothName(e.target.value)}
                placeholder="예: 컴퓨터공학과 주점"
                className="bg-white shadow-sm"
              />
              
              <div className="space-y-5">
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">은행</label>
                  <div className="relative">
                    <select
                      value={newBankSelect}
                      onChange={(e) => setNewBankSelect(e.target.value)}
                      className="w-full p-4 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-toss-blue/30 transition appearance-none text-sm shadow-sm"
                    >
                      <option value="" disabled>은행 선택</option>
                      {BANK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                  <Input
                    label="계좌번호"
                    value={newAccountNumber}
                    onChange={(e) => handleAccountChange(e.target.value)}
                    placeholder="숫자만 입력"
                    inputMode="numeric"
                    className="bg-white shadow-sm"
                  />
                </div>

              <Button
                fullWidth
                size="lg"
                onClick={handleAddBooth}
                className="mt-8 shadow-md"
              >
                부스 등록하기
              </Button>
            </div>
          </Modal>

          {/* 메인: 부스 목록 */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-toss-dark">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                전체 부스 <span className="text-toss-blue ml-1">{booths.length}</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 pt-2 custom-scrollbar lg:max-h-[400px]">
              <div className="grid grid-cols-1 gap-5 pb-8">
                {booths.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-400 font-medium">아직 등록된 부스가 없습니다.<br/>첫 번째 부스를 만들어보세요!</p>
                  </div>
                ) : (
                  booths.map((booth, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectBooth(booth)}
                      className={`group relative p-5 bg-white border rounded-2xl transition-all ${
                        editingIndex === index 
                        ? "border-toss-blue ring-2 ring-toss-blue/10" 
                        : "border-gray-100 hover:border-toss-blue/50 hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
                      }`}
                    >
                      {editingIndex === index ? (
                        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="bg-white font-bold"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                              <select
                                value={REVERSE_BANK_MAP[editForm.bank] || editForm.bank}
                                onChange={(e) => setEditForm({ ...editForm, bank: e.target.value })}
                                className="w-full p-3.5 bg-white border border-gray-100 rounded-xl outline-none text-sm shadow-sm appearance-none"
                              >
                                <option value="" disabled>은행 선택</option>
                                {BANK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                            <Input
                              value={editForm.accountNumber}
                              onChange={(e) => handleAccountChange(e.target.value, true)}
                              className="bg-white"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              fullWidth
                              onClick={(e) => handleSaveEdit(index, e)}
                            >
                              저장
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              fullWidth
                              onClick={handleCancelEdit}
                            >
                              취소
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
                              <span className="text-toss-blue text-2xl">🏬</span>
                            </div> 
                            <div className="min-w-0">
                              <div className="font-bold text-toss-dark text-lg leading-tight mb-1 truncate">{booth.name}</div>
                              <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                                {booth.boothStatus === "PENDING" || booth.status === "pending" ? (
                                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                    승인 대기 중
                                  </span>
                                ) : booth.boothStatus === "REJECTED" || booth.status === "rejected" ? (
                                  <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                                    승인 거절됨
                                  </span>
                                ) : (
                                  <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                                    승인 완료
                                  </span>
                                )}
                                <span className="text-toss-blue bg-blue-50 px-2 py-0.5 rounded-md">
                                  {REVERSE_BANK_MAP[booth.bank] || booth.bank || "은행미설정"}
                                </span>
                                <span className="text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                                  {booth.accountNumber || "계좌미설정"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleStartEdit(index, e, booth)}
                              className="p-2.5 text-toss-blue hover:bg-blue-50 rounded-xl transition-colors"
                              title="수정"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => handleDeleteBooth(booth, e)}
                              className="p-2.5 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                              title="삭제"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {/* 새 부스 추가 버튼 */}
              <div className="mt-8 flex justify-center pt-6 border-t border-gray-100">
                <Button 
                  size="lg" 
                  className="w-full rounded-[16px] shadow-sm hover:shadow-md transition-transform hover:-translate-y-0.5 font-extrabold text-[16px] h-[58px]"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  + 새 부스 추가하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoothSelect;
