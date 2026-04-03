import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setBoothInfo } from "../../utils/storeInfo";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";

const STORAGE_KEY = "owner_booths_v1";
const SESSION_KEY = "owner_session";

const BANK_OPTIONS = [
  "국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "농협",
  "기업은행",
  "카카오뱅크",
  "토스뱅크",
  "새마을금고",
  "우체국",
  "기타(직접입력)",
];

/* -----------------------------
  Helpers
------------------------------ */
const onlyDigits = (v) => (v || "").replace(/\D/g, "");
const formatAccountDisplay = (digits) => {
  const d = (digits || "").slice(0, 20);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 10)}-${d.slice(10)}`;
};

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

  useEffect(() => {
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (!sessionRaw) {
      navigate("/owner/login");
      return;
    }
    const session = JSON.parse(sessionRaw);
    setOwnerId(session.id);

    // 부스 목록 로드
    const allBooths = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const list = allBooths[session.id] || [];
    
    // 데이터 구조 호환성 유지
    const normalized = list.map(item => {
      if (typeof item === "string") return { name: item, bank: "", accountNumber: "" };
      return { bank: "", ...item };
    });
    setBooths(normalized);
  }, [navigate]);

  const saveBooths = (newList) => {
    setBooths(newList);
    const allBooths = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    allBooths[ownerId] = newList;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allBooths));
  };

  const isBankCustom = newBankSelect === "기타(직접입력)";
  const bankValue = isBankCustom ? newBankCustom.trim() : newBankSelect;

  const handleAddBooth = () => {
    const name = newBoothName.trim();
    const bank = bankValue.trim();
    const account = newAccountNumber.trim();
    
    if (!name || !bank || !account) {
      alert("부스 이름, 은행, 계좌번호를 모두 입력해주세요.");
      return;
    }
    if (booths.some(b => b.name === name)) {
      alert("이미 존재하는 부스 이름입니다.");
      return;
    }
    
    saveBooths([...booths, { name, bank, accountNumber: account }]);
    setNewBoothName("");
    setNewBankSelect("");
    setNewBankCustom("");
    setNewAccountNumber("");
    setIsAddModalOpen(false);
  };

  const handleAccountChange = (val, isEdit = false) => {
    const digits = onlyDigits(val);
    const formatted = formatAccountDisplay(digits);
    if (isEdit) {
      setEditForm(prev => ({ ...prev, accountNumber: formatted }));
    } else {
      setNewAccountNumber(formatted);
    }
  };

  const handleDeleteBooth = (name, e) => {
    e.stopPropagation();
    if (!window.confirm(`'${name}' 부스를 삭제하시겠습니까? 관련 데이터가 모두 삭제될 수 있습니다.`)) return;
    saveBooths(booths.filter((b) => b.name !== name));
  };

  const handleSelectBooth = (booth) => {
    if (editingIndex !== null) return; // 수정 중에는 선택 이동 방지
    setBoothInfo(booth);
    navigate("/owner/orders");
  };

  const handleStartEdit = (index, e, booth) => {
    e.stopPropagation();
    setEditingIndex(index);
    setEditForm({ ...booth });
  };

  const handleSaveEdit = (index, e) => {
    e.stopPropagation();
    const oldName = booths[index].name;
    const newName = editForm.name.trim();
    
    if (!newName || !editForm.bank.trim() || !editForm.accountNumber.trim()) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    // 이름이 바뀌었는데 이미 존재하는 이름인 경우 (자기 자신 제외)
    if (oldName !== newName && booths.some((b, i) => i !== index && b.name === newName)) {
      alert("이미 존재하는 부스 이름입니다.");
      return;
    }

    const newList = [...booths];
    newList[index] = { ...editForm, name: newName };
    saveBooths(newList);
    setEditingIndex(null);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingIndex(null);
  };

  const handleLogout = () => {
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
                  {!isBankCustom ? (
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
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        value={newBankCustom}
                        onChange={(e) => setNewBankCustom(e.target.value)}
                        placeholder="은행명 직접 입력"
                        autoFocus
                        className="w-full p-4 bg-white border border-toss-blue/30 rounded-xl outline-none focus:ring-2 focus:ring-toss-blue/30 transition text-sm pr-12 shadow-sm"
                      />
                      <button
                        onClick={() => {
                          setNewBankSelect("");
                          setNewBankCustom("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-toss-blue hover:text-blue-600 transition"
                      >
                        목록
                      </button>
                    </div>
                  )}
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
                운영 중인 부스 <span className="text-toss-blue ml-1">{booths.length}</span>
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
                            <Input
                              value={editForm.bank}
                              onChange={(e) => setEditForm({ ...editForm, bank: e.target.value })}
                              className="bg-white"
                            />
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
                                <span className="text-toss-blue bg-blue-50 px-2 py-0.5 rounded-md">
                                  {booth.bank || "은행미설정"}
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
                              onClick={(e) => handleDeleteBooth(booth.name, e)}
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
