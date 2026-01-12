const KEY_STORE_NAME = "qeat_store_name";

// ✅ 1. 가게 이름 저장하기 (이 함수가 지워져서 에러가 났던 겁니다)
export const setStoreName = (name) => {
  localStorage.setItem(KEY_STORE_NAME, name);
};

// ✅ 2. 가게 이름 가져오기
export const getStoreName = () => {
  // 저장된 이름이 없으면 기본값 표시
  return localStorage.getItem(KEY_STORE_NAME) || "컴퓨터공학과";
};
