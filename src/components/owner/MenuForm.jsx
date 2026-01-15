import React, { useState, useEffect } from "react";
import { MENU_CATEGORIES } from "../../constants/categories";

const MenuForm = ({ initialData, defaultCategory, onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(defaultCategory || "메인");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const isStaffCall = category === "직원호출";

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setPrice(initialData.price);
      setCategory(initialData.category);
      setImage(initialData.image);
      setPreview(initialData.image);
    } else if (defaultCategory) {
      // 새 메뉴 등록 시 현재 탭의 카테고리를 따름
      setCategory(defaultCategory);
      if (defaultCategory === "직원호출") {
        setPrice(0);
      }
    }
  }, [initialData, defaultCategory]);

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    if (selectedCategory === "직원호출") {
      setPrice(0); // 내부 데이터상으로는 0원으로 저장
      setDescription(""); // 직원호출일 때 설명 필요없으면 초기화 (선택사항)
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: initialData ? initialData.id : Date.now(),
      name,
      description,
      price: isStaffCall ? 0 : Number(price),
      category,
      image,
      isSoldOut: initialData ? initialData.isSoldOut : false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-[400px] p-6 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold text-toss-dark mb-6">
          {initialData ? "메뉴 수정하기" : "새 메뉴 등록하기"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. 이미지 업로드 영역 */}
          <div>
            <label className="block text-sm font-bold text-toss-dark mb-2">
              메뉴 사진
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-toss-blue transition bg-gray-50 overflow-hidden relative">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="text-4xl text-gray-300 mb-2">+</div>
                    <p className="text-sm text-gray-400 font-bold">
                      사진을 등록해주세요
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            {preview && (
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setImage(null);
                }}
                className="text-xs text-toss-red underline mt-2 font-medium"
              >
                사진 삭제하기
              </button>
            )}
          </div>

          {/* 2. 카테고리 선택 */}
          <div>
            <label className="block text-sm font-bold text-toss-dark mb-1">
              카테고리
            </label>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="w-full p-3 bg-toss-grey rounded-xl outline-none focus:ring-2 focus:ring-toss-blue/50"
            >
              {MENU_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 3. 메뉴 이름 */}
          <div>
            <label className="block text-sm font-bold text-toss-dark mb-1">
              메뉴 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                isStaffCall
                  ? "예: 물 좀 주세요, 불판 갈아주세요"
                  : "예: 후라이드 치킨"
              }
              className="w-full p-3 bg-toss-grey rounded-xl outline-none focus:ring-2 focus:ring-toss-blue/50"
              required
            />
          </div>

          {!isStaffCall && (
            <div>
              <label className="block text-sm font-bold text-toss-dark mb-1">
                메뉴 설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="메뉴에 대한 설명을 적어주세요"
                className="w-full p-3 bg-toss-grey rounded-xl outline-none focus:ring-2 focus:ring-toss-blue/50 min-h-[80px] text-sm resize-none"
              />
            </div>
          )}

          {/* 4. 가격 영역 (직원호출 시 텍스트로 변경) */}
          <div>
            <label className="block text-sm font-bold text-toss-dark mb-1">
              가격
            </label>
            {isStaffCall ? (
              // 직원호출 카테고리일 때 보여지는 커스텀 박스
              <div className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl text-toss-blue font-bold text-center">
                호출 (비결제 항목)
              </div>
            ) : (
              // 일반 메뉴일 때 보여지는 숫자 입력창
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="숫자만 입력 (예: 18000)"
                className="w-full p-3 bg-toss-grey rounded-xl outline-none focus:ring-2 focus:ring-toss-blue/50"
                required
              />
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-toss-grey text-toss-light font-bold rounded-xl hover:bg-gray-200 transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-toss-blue text-white font-bold rounded-xl hover:bg-blue-600 transition"
            >
              완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuForm;
