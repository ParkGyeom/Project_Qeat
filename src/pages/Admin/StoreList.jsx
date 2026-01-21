import React, { useEffect, useMemo, useState } from "react";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

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

const BOOTHS_KEY = "owner_booths_v1";
const loadOwnerBooths = (ownerId) => {
  try {
    const allBooths = JSON.parse(localStorage.getItem(BOOTHS_KEY) || "{}");
    return allBooths[ownerId] || [];
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

        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
        >
          새로고침
        </Button>
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
          <Input
            label="검색 (이름 / 학과)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="이름 또는 학과로 검색"
            containerClassName="flex-1"
          />

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
                    운영 부스
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

                    <td className="p-5 align-middle text-center text-sm text-toss-blue font-bold">
                      {loadOwnerBooths(o.id).length}개
                    </td>

                    {/* ✅ 승인취소 버튼: 승인완료 뱃지랑 같은 느낌의 pill 스타일 */}
                    <td className="p-5 align-middle text-center">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          revokeApproval(o.id);
                        }}
                      >
                        승인취소
                      </Button>
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

      {/* ✅ 상세 모달: 공통 Modal 컴포넌트 적용 */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected && (
          <div className="flex items-center gap-2">
            <span>{selected.name || "-"}</span>
            <span className={pillBlue}>승인 완료</span>
          </div>
        )}
        footer={
          <Button
            fullWidth
            size="lg"
            onClick={() => setSelected(null)}
          >
            확인
          </Button>
        }
      >
        {selected && (
          <div className="space-y-6">
            <div className="text-sm text-gray-500 font-bold -mt-4 mb-4">
              아이디: {selected.id}
            </div>

            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: '이름', value: selected.name },
                { label: '아이디', value: selected.id },
                { label: '학과', value: selected.department },
                { label: '학번', value: selected.studentId },
                { label: '가입일', value: formatDateTime(selected.createdAt) }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="text-xs font-bold text-gray-500 mb-1">{item.label}</div>
                  <div className="text-sm font-extrabold text-gray-900">{item.value || "-"}</div>
                </div>
              ))}
            </div>

            {/* 운영 부스 및 정산 정보 */}
            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="text-sm font-extrabold text-toss-dark mb-3">
                운영 부스 목록 ({loadOwnerBooths(selected.id).length})
              </div>
              <div className="space-y-3">
                {loadOwnerBooths(selected.id).length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400 font-bold bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    운영 중인 부스가 없습니다.
                  </div>
                ) : (
                  loadOwnerBooths(selected.id).map((booth, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-toss-blue mb-0.5">부스명</p>
                        <p className="text-sm font-extrabold text-toss-dark">{booth.name}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-[10px] font-bold text-gray-400 mb-0.5">계좌 정보</p>
                        <p className="text-xs font-bold text-gray-600">
                          {booth.bank || "은행 미설정"} | {prettyAccount(booth.accountNumber)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StoreList;
