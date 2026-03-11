import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setBoothInfo } from "../../utils/storeInfo";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

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
    <div className="min-h-screen bg-toss-grey flex justify-center items-center p-4 lg:p-8">
      <div className="bg-white w-full max-w-[1000px] rounded-3xl shadow-xl overflow-hidden flex flex-col">
        {/* 상단 헤더 */}
        <div className="p-8 pb-4 flex justify-between items-start border-b border-gray-50">
          <div>
            <h1 className="text-2xl font-bold text-toss-dark mb-2">부스 관리 센터</h1>
            <p className="text-toss-light text-sm">부스를 등록하거나 운영할 부스를 관리하세요</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
          >
            로그아웃
          </Button>
        </div>

        {/* 메인 콘텐츠 영역 (가로 배치) */}
        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* 왼쪽: 부스 추가 양식 */}
          <div className="w-full lg:w-[400px] p-8 lg:border-r border-gray-100 bg-gray-50/30">
            <h2 className="text-sm font-bold text-toss-dark mb-8 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-toss-blue rounded-full pulse-blue"></span>
              새 부스 등록
            </h2>
            <div className="space-y-5">
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
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={handleAddBooth}
                className="mt-4 shadow-md"
              >
                부스 등록하기
              </Button>
            </div>

          {/* 오른쪽: 부스 목록 */}
          <div className="flex-1 p-8 flex flex-col min-h-0 bg-white">
            <h2 className="text-sm font-bold text-toss-dark mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                운영 중인 부스 <span className="text-toss-blue ml-1">{booths.length}</span>
              </div>
              <span className="text-[11px] text-toss-light font-medium bg-gray-50 px-2 py-1 rounded-md">
                부스를 클릭하면 대시보드로 이동합니다
              </span>
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 pt-2 custom-scrollbar lg:max-h-[500px]">
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
            </div>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="bg-gray-50/50 p-4 border-t border-gray-50 text-center">
          <p className="text-[11px] text-toss-light font-medium">
            부스를 선택하시면 해당 부스의 실시간 관리 대시보드로 즉시 연결됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BoothSelect;
