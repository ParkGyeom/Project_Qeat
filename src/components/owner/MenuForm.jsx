import React, { useState, useEffect } from "react";

const MenuForm = ({ initialData, onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("메인");
  const [image, setImage] = useState(null); // 이미지 데이터 (Base64)
  const [preview, setPreview] = useState(null); // 미리보기 URL

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPrice(initialData.price);
      setCategory(initialData.category);
      setImage(initialData.image);
      setPreview(initialData.image);
    }
  }, [initialData]);

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일을 읽어서 미리보기 URL 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // 데이터 저장
        setPreview(reader.result); // 미리보기 보여주기
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: initialData ? initialData.id : Date.now(),
      name,
      price: Number(price),
      category,
      image, // 이미지 데이터 포함
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
                  // 이미지가 있으면 꽉 차게 보여줌
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // 이미지가 없으면 업로드 안내
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="text-4xl text-gray-300 mb-2">+</div>
                    <p className="text-sm text-gray-400 font-bold">
                      사진을 등록해주세요
                    </p>
                  </div>
                )}

                {/* 실제 파일 인풋 (숨김) */}
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

          {/* 2. 기존 입력 필드들 */}
          <div>
            <label className="block text-sm font-bold text-toss-dark mb-1">
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 bg-toss-grey rounded-xl outline-none focus:ring-2 focus:ring-toss-blue/50"
            >
              <option value="메인">메인 메뉴</option>
              <option value="사이드">사이드 메뉴</option>
              <option value="음료">음료/주류</option>
              <option value="직원호출">직원호출</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-toss-dark mb-1">
              메뉴 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 후라이드 치킨"
              className="w-full p-3 bg-toss-grey rounded-xl outline-none focus:ring-2 focus:ring-toss-blue/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-toss-dark mb-1">
              가격
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="숫자만 입력 (예: 18000)"
              className="w-full p-3 bg-toss-grey rounded-xl outline-none focus:ring-2 focus:ring-toss-blue/50"
              required
            />
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
