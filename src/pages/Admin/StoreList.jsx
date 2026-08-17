import React, { useEffect, useMemo, useState } from "react";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { rejectBooth, getBoothOperators, getOperatorDetail, suspendBooth, approveBooth } from "../../api/boothApi";

// Local Storage 로직 완전히 제거됨

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

const StoreList = () => {
  const [owners, setOwners] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null); // 상세 모달용 owner 객체
  const [selectedDetail, setSelectedDetail] = useState(null); // API로 받아온 상세 정보 객체

  const handleSelectOwner = async (o) => {
    setSelected(o);
    setSelectedDetail(null);
    try {
      const detail = await getOperatorDetail(o.userId);
      setSelectedDetail(detail);
    } catch (error) {
      console.error("Failed to fetch operator details", error);
    }
  };

  const fetchOperators = async () => {
    try {
      const responseData = await getBoothOperators();
      const dataArray = Array.isArray(responseData) ? responseData : (responseData?.data || []);
      
      const formatted = dataArray.map(op => ({
        id: op.studentNumber, // 로컬스토리지 부스 매핑을 위해 학번을 id로 사용
        userId: op.userId,
        name: op.name,
        studentId: op.studentNumber,
        department: op.major,
        grade: op.grade,
        boothCount: op.boothCount,
        approved: true // 백엔드 API는 승인 완료된 사용자만 반환
      }));
      
      setOwners(formatted);
    } catch (err) {
      console.error("Failed to fetch operators:", err);
      setOwners([]);
    }
  };

  useEffect(() => {
    fetchOperators();
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

  const totalApproved = owners.length;

  const hasQuery = q.trim().length > 0;

  const refresh = () => fetchOperators();



  // 부스 운영 중지
  const suspendBoothApproval = async (booth, ownerId) => {
    if (!window.confirm(`'${booth.name}' 부스의 운영을 강제로 중지하시겠습니까?`)) return;

    try {
      if (booth.boothId || booth.id) {
        // 백엔드의 부스 중지 API 호출
        await suspendBooth(booth.boothId || booth.id);
      }
    } catch (err) {
      console.error("API call failed:", err);
      alert("서버 오류: 부스 운영을 중지하지 못했습니다.");
      return; // 에러 시 상태 변경 중단
    }

    try {
      if (selectedDetail) {
        setSelectedDetail({
          ...selectedDetail,
          booths: selectedDetail.booths.map(b => 
            b.boothId === (booth.boothId || booth.id) 
              ? { ...b, boothStatus: "SUSPENDED" }
              : b
          )
        });
      }
      alert("부스 운영이 중지되었습니다.");
    } catch (err) {
      console.error(err);
      alert("부스 운영 중지 처리 중 문제가 발생했습니다.");
    }
  };

  // 부스 운영 중지 해제
  const resumeBoothApproval = async (booth) => {
    if (!window.confirm(`'${booth.name}' 부스의 운영 중지를 해제하시겠습니까?`)) return;

    try {
      if (booth.boothId || booth.id) {
        await approveBooth(booth.boothId || booth.id);
      }
    } catch (err) {
      console.error("API call failed:", err);
      alert("서버 오류: 부스 중지 해제에 실패했습니다.");
      return;
    }

    try {
      if (selectedDetail) {
        setSelectedDetail({
          ...selectedDetail,
          booths: selectedDetail.booths.map(b =>
            b.boothId === (booth.boothId || booth.id)
              ? { ...b, boothStatus: "APPROVED" }
              : b
          )
        });
      }
      alert("부스 운영이 재개되었습니다.");
    } catch (err) {
      console.error(err);
      alert("부스 중지 해제 처리 중 문제가 발생했습니다.");
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
      <div className="grid grid-cols-1 mb-6">
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50">
          <p className="text-toss-light text-[15px] font-bold mb-2">
            승인 완료(이용 가능)
          </p>
          <h3 className="text-3xl font-black text-toss-blue tracking-tight">
            {totalApproved}건
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
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {approvedOwners.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleSelectOwner(o)}
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
                      {o.boothCount !== undefined ? o.boothCount : 0}개
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
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: '이름', value: selected.name },
                { label: '학과', value: selected.department },
                { label: '학번', value: selected.studentId },
                { label: '학년', value: (selectedDetail?.grade ?? selected.grade) ? `${selectedDetail?.grade ?? selected.grade}학년` : "-" }
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
                운영 부스 목록 ({selectedDetail ? selectedDetail.booths.length : 0})
              </div>
              <div className="space-y-3">
                {!selectedDetail ? (
                  <div className="text-center py-6 text-xs text-gray-400 font-bold bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    불러오는 중...
                  </div>
                ) : selectedDetail.booths.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400 font-bold bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    운영 중인 부스가 없습니다.
                  </div>
                ) : (
                  selectedDetail.booths.map((booth, idx) => {
                    const status = booth.boothStatus;
                    const isDeleted = status === "DELETED";
                    const isSuspended = status === "SUSPENDED" || status === "REJECTED";
                    const isApproved = status === "APPROVED";
                    const isPending = status === "PENDING";

                    // 상태 뱃지 설정
                    let statusBadge = null;
                    if (isApproved) {
                      statusBadge = (
                        <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold">
                          {booth.open ? "영업중" : "영업 마감"}
                        </span>
                      );
                    } else if (isPending) {
                      statusBadge = (
                        <span className="text-[10px] bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded font-bold">
                          승인 대기
                        </span>
                      );
                    } else if (isSuspended) {
                      statusBadge = (
                        <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-bold">
                          운영 중지됨
                        </span>
                      );
                    } else if (isDeleted) {
                      statusBadge = (
                        <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-bold">
                          삭제됨
                        </span>
                      );
                    }

                    return (
                    <div key={idx} className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDeleted ? 'bg-gray-100 border-gray-200 opacity-60' : isPending ? 'bg-yellow-50/30 border-yellow-200' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-toss-blue mb-0.5">부스명</p>
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-extrabold ${(isSuspended || isDeleted) ? 'text-gray-400 line-through' : 'text-toss-dark'}`}>{booth.name}</p>
                          {statusBadge}
                        </div>
                      </div>
                      <div className="sm:text-right flex-1">
                        <p className="text-[10px] font-bold text-gray-400 mb-0.5">계좌 정보</p>
                        <p className="text-xs font-bold text-gray-600">
                          {booth.bank || "은행 미설정"} | {prettyAccount(booth.accountNumber)}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex gap-2">
                        {isDeleted ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              resumeBoothApproval(booth);
                            }}
                          >
                            복구
                          </Button>
                        ) : isPending ? (
                          <>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                resumeBoothApproval(booth);
                              }}
                            >
                              승인
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                suspendBoothApproval(booth, selected.id);
                              }}
                            >
                              거절
                            </Button>
                          </>
                        ) : isSuspended ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              resumeBoothApproval(booth);
                            }}
                          >
                            중지 해제
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              suspendBoothApproval(booth, selected.id);
                            }}
                          >
                            운영 중지
                          </Button>
                        )}
                      </div>
                    </div>
                  )})
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
