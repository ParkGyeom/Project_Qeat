const KEY_BOOTH_INFO = "qeat_booth_detail_v1";

// ✅ 1. 부스 상세 정보 저장하기 (이름, 은행, 계좌번호 전체 객체)
export const setBoothInfo = (booth) => {
  localStorage.setItem(KEY_BOOTH_INFO, JSON.stringify(booth));
};

// ✅ 2. 부스 상세 정보 가져오기
export const getBoothInfo = () => {
  const raw = localStorage.getItem(KEY_BOOTH_INFO);
  return raw ? JSON.parse(raw) : { name: "컴퓨터공학과", bank: "", accountNumber: "" };
};

// ✅ 3. 기존 코드 호환용: 가게 이름만 가져오기
export const getStoreName = () => {
  return getBoothInfo().name;
};

// ✅ 4. 기존 코드 호환용: 가게 이름만 저장하기 (필요시)
export const setStoreName = (name) => {
  const current = getBoothInfo();
  setBoothInfo({ ...current, name });
};
