import React, { useEffect, useMemo, useState } from "react";

const OWNERS_KEY = "owners";

const loadOwners = () => {
  try {
    const raw = localStorage.getItem(OWNERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveOwners = (owners) => {
  localStorage.setItem(OWNERS_KEY, JSON.stringify(owners));
};

const formatDateTime = (iso) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "-";
  }
};

// 표시만 보기 좋게(원하면 제거 가능)
const prettyAccount = (digits) => {
  if (!digits) return "-";
  const d = String(digits);
  if (d.length <= 6) return d;
  return `${d.slice(0, 3)}-${d.slice(3)}`;
};

const pillBase =
  "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold";
const pillBlue = `${pillBase} bg-blue-50 text-toss-blue`;
const pillRed = `${pillBase} bg-red-50 text-toss-red hover:bg-red-100 transition`;

const StoreList = () => {
  const [owners, setOwners] = useState(() => loadOwners());
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null); // 상세 모달용 owner 객체

  // 다른 탭/페이지 변경 자동 반영
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === OWNERS_KEY) setOwners(loadOwners());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const approvedOwners = useMemo(() => {
    const list = owners.filter((o) => o.approved);
    const query = q.trim().toLowerCase();
    if (!query) return list;

    // 검색은 이름/학과만
    return list.filter((o) => {
      const name = (o.name || "").toLowerCase();
      const dept = (o.department || "").toLowerCase();
      return name.includes(query) || dept.includes(query);
    });
  }, [owners, q]);

  const totalApproved = owners.filter((o) => o.approved).length;
  const totalPending = owners.filter((o) => !o.approved).length;

  const hasQuery = q.trim().length > 0;

  const refresh = () => setOwners(loadOwners());

  // 승인 취소 = approved:false (가입승인 탭으로 다시 넘어가게 됨)
  const revokeApproval = (ownerId) => {
    const target = owners.find((o) => o.id === ownerId);
    if (!target) return;

    if (
      window.confirm(
        `'${
          target.name || target.id
        }' 계정의 승인을 취소하시겠습니까?\n(다시 승인 전까지 로그인 불가)`
      )
    ) {
      const next = owners.map((o) =>
        o.id === ownerId ? { ...o, approved: false } : o
      );
      saveOwners(next);
      setOwners(next);

      // 혹시 상세 모달 열려있으면 닫아주기(승인취소 후 목록에서 사라지니 UX)
      setSelected((prev) => (prev?.id === ownerId ? null : prev));
    }
  };

  return (
    <div className="pb-10 font-sans px-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-toss-dark tracking-tight">
            서비스 이용자 목록
          </h2>
          <p className="text-sm text-toss-light mt-1">
            승인 완료된 계정만 표시됩니다. (행 클릭 시 상세 정보)
          </p>
        </div>

        <button
          onClick={refresh}
          className="px-4 py-2 rounded-xl bg-white border border-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
        >
          새로고침
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50">
          <p className="text-toss-light text-[15px] font-bold mb-2">
            승인 완료(이용 가능)
          </p>
          <h3 className="text-3xl font-black text-toss-blue tracking-tight">
            {totalApproved}건
          </h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50">
          <p className="text-toss-light text-[15px] font-bold mb-2">
            승인 대기
          </p>
          <h3 className="text-3xl font-black text-toss-dark tracking-tight">
            {totalPending}건
          </h3>
        </div>
      </div>

      {/* 검색 */}
      <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-50 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <label className="block text-sm font-bold text-toss-dark mb-2">
              검색 (이름 / 학과)
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="이름 또는 학과로 검색"
              className="w-full p-4 bg-toss-grey rounded-xl outline-none focus:ring-2 focus:ring-toss-blue/50 transition"
            />
          </div>

          {/* ✅ 검색어 있을 때만 표시 + 검색어 포함 문구 */}
          {hasQuery && (
            <div className="md:pt-7">
              <div className="px-4 py-3 rounded-xl bg-blue-50 text-toss-blue font-extrabold text-sm">
                '{q}' 검색 결과 {approvedOwners.length}건
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 테이블 */}
      {approvedOwners.length === 0 ? (
        <div className="h-[340px] flex flex-col justify-center items-center text-toss-light bg-white rounded-[24px] border border-gray-100">
          <p className="text-lg font-bold">승인 완료된 계정이 없습니다.</p>
          <p className="text-sm mt-2">가입 승인에서 먼저 승인해주세요.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                    상태
                  </th>
                  <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                    이름
                  </th>
                  <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                    학과
                  </th>
                  <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                    전화번호
                  </th>
                  <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                    관리
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {approvedOwners.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelected(o)}
                  >
                    <td className="p-5 align-middle text-center">
                      <span className={pillBlue}>승인 완료</span>
                    </td>

                    <td className="p-5 align-middle text-center">
                      <div className="text-sm text-toss-dark font-extrabold">
                        {o.name || "-"}
                      </div>
                      <div className="text-xs text-gray-400 font-bold mt-1">
                        {o.id}
                      </div>
                    </td>

                    <td className="p-5 align-middle text-center text-sm text-gray-700 font-medium">
                      {o.department || "-"}
                    </td>

                    <td className="p-5 align-middle text-center text-sm text-gray-700 font-medium">
                      {o.phone || "-"}
                    </td>

                    {/* ✅ 승인취소 버튼: 승인완료 뱃지랑 같은 느낌의 pill 스타일 */}
                    <td className="p-5 align-middle text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          revokeApproval(o.id);
                        }}
                        className={pillRed}
                      >
                        승인취소
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-5 text-xs text-gray-400">
            * 행을 클릭하면 상세 정보를 확인할 수 있습니다.
          </div>
        </div>
      )}

      {/* ✅ 상세 모달: 회원가입 입력 "모든 정보" 표시 / 승인취소 버튼은 제거 */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
          style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
        >
          <div className="w-full max-w-[560px] bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* 헤더 */}
            <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-toss-dark">
                    {selected.name || "-"}
                  </h3>
                  <span className={pillBlue}>승인 완료</span>
                </div>
                <p className="text-sm text-gray-500 font-bold mt-1">
                  아이디: {selected.id}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="px-3 py-2 rounded-xl bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 transition"
              >
                닫기
              </button>
            </div>

            {/* 바디 */}
            <div className="p-6 space-y-4">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="text-xs font-bold text-gray-500 mb-1">
                    이름
                  </div>
                  <div className="text-sm font-extrabold text-gray-900">
                    {selected.name || "-"}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="text-xs font-bold text-gray-500 mb-1">
                    아이디
                  </div>
                  <div className="text-sm font-extrabold text-gray-900">
                    {selected.id || "-"}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="text-xs font-bold text-gray-500 mb-1">
                    학과
                  </div>
                  <div className="text-sm font-extrabold text-gray-900">
                    {selected.department || "-"}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="text-xs font-bold text-gray-500 mb-1">
                    학번
                  </div>
                  <div className="text-sm font-extrabold text-gray-900">
                    {selected.studentId || "-"}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="text-xs font-bold text-gray-500 mb-1">
                    전화번호
                  </div>
                  <div className="text-sm font-extrabold text-gray-900">
                    {selected.phone || "-"}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="text-xs font-bold text-gray-500 mb-1">
                    가입일
                  </div>
                  <div className="text-sm font-extrabold text-gray-900">
                    {formatDateTime(selected.createdAt)}
                  </div>
                </div>
              </div>

              {/* 정산 정보 */}
              <div className="p-5 rounded-2xl bg-white border border-gray-100">
                <div className="text-sm font-extrabold text-toss-dark mb-3">
                  계좌 정보
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="text-xs font-bold text-gray-500 mb-1">
                      은행
                    </div>
                    <div className="text-sm font-extrabold text-gray-900">
                      {selected.bank || "-"}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="text-xs font-bold text-gray-500 mb-1">
                      계좌번호
                    </div>
                    <div className="text-sm font-extrabold text-gray-900">
                      {prettyAccount(selected.accountNumber)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 푸터: ✅ 승인취소 제거, 확인만 */}
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setSelected(null)}
                className="w-full py-3 rounded-xl bg-toss-blue text-white font-extrabold hover:bg-blue-600 transition"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreList;
