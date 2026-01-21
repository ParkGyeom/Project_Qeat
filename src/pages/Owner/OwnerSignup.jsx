import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setStoreName } from "../../utils/storeInfo";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const STORAGE_KEY = "owners";

/* -----------------------------
  localStorage helpers
------------------------------ */
const loadOwners = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveOwners = (owners) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(owners));
};

const onlyDigits = (v) => (v || "").replace(/\D/g, "");

const formatPhone = (raw) => {
  const d = onlyDigits(raw).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
};

const FieldPill = ({ variant = "error", msg }) => {
  if (!msg) return null;
  const base =
    "mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold";
  const styles =
    variant === "ok"
      ? "bg-blue-50 text-toss-blue"
      : variant === "warn"
      ? "bg-yellow-50 text-yellow-700"
      : "bg-red-50 text-red-600";
  return <div className={`${base} ${styles}`}>{msg}</div>;
};

const OwnerSignup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    id: "",
    password: "",
    passwordConfirm: "",
    studentId: "",
    department: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [idChecked, setIdChecked] = useState(false);
  const [idCheckResult, setIdCheckResult] = useState(null);

  // ✅ [추가] 비밀번호 보이기/숨기기 상태
  const [showPassword, setShowPassword] = useState(false);

  useMemo(() => loadOwners(), []);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "id") {
      setIdChecked(false);
      setIdCheckResult(null);
    }
  };

  const pw = form.password;
  const pwc = form.passwordConfirm;
  const pwTouched = pw.length > 0;
  const pwConfirmTouched = pwc.length > 0;

  const pwMinOk = pwTouched ? pw.length >= 4 : false;
  const pwMatch = pwTouched && pwConfirmTouched ? pw === pwc : null;

  const phoneDigits = onlyDigits(form.phone);
  const phoneOk = phoneDigits.length === 11;

  const canSubmit =
    form.name.trim() &&
    form.id.trim() &&
    idChecked &&
    idCheckResult === "ok" &&
    pwMinOk &&
    pwMatch === true &&
    form.studentId.trim() &&
    form.department.trim() &&
    phoneOk;

  const handleIdCheck = () => {
    const id = form.id.trim();
    if (!id) {
      setErrors((prev) => ({
        ...prev,
        id: "아이디를 입력한 뒤 중복 확인을 해주세요.",
      }));
      setIdChecked(false);
      setIdCheckResult(null);
      return;
    }

    const list = loadOwners();
    const dup = list.some((o) => o.id === id);

    setIdChecked(true);
    setIdCheckResult(dup ? "dup" : "ok");
    setErrors((prev) => ({ ...prev, id: "" }));
  };

  const validateOnSubmit = () => {
    const e = {};

    if (!form.name.trim()) e.name = "이름을 입력해주세요.";
    if (!form.id.trim()) e.id = "아이디를 입력해주세요.";

    if (!form.password) e.password = "비밀번호를 입력해주세요.";
    if (!form.passwordConfirm)
      e.passwordConfirm = "비밀번호 확인을 입력해주세요.";
    if (form.password && form.password.length < 4)
      e.password = "비밀번호는 4자리 이상으로 설정해주세요.";
    if (
      form.password &&
      form.passwordConfirm &&
      form.password !== form.passwordConfirm
    )
      e.passwordConfirm = "비밀번호가 일치하지 않습니다.";

    if (!form.studentId.trim()) e.studentId = "학번을 입력해주세요.";
    if (!form.department.trim()) e.department = "학과를 입력해주세요.";

    if (!phoneDigits) e.phone = "전화번호를 입력해주세요.";
    else if (phoneDigits.length !== 11)
      e.phone = "전화번호 11자리를 입력해주세요.";

    if (!idChecked || idCheckResult !== "ok") {
      e.id = e.id || "아이디 중복 확인을 해주세요.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!canSubmit) {
      validateOnSubmit();
      return;
    }
    if (!validateOnSubmit()) return;

    const list = loadOwners();
    if (list.some((o) => o.id === form.id.trim())) {
      setErrors((prev) => ({ ...prev, id: "이미 사용 중인 아이디입니다." }));
      setIdChecked(true);
      setIdCheckResult("dup");
      return;
    }

    const newOwner = {
      id: form.id.trim(),
      password: form.password,
      name: form.name.trim(),
      studentId: form.studentId.trim(),
      department: form.department.trim(),
      phone: formatPhone(form.phone),
      approved: false,
      createdAt: new Date().toISOString(),
    };

    saveOwners([newOwner, ...list]);
    setStoreName(form.department.trim());

    alert("회원가입이 완료되었습니다.\n관리자 승인 후 로그인할 수 있습니다.");
    navigate("/owner/login");
  };

  const pwConfirmRingClass =
    pwTouched && pwConfirmTouched
      ? pwMatch
        ? "ring-2 ring-blue-200"
        : "ring-2 ring-red-200"
      : "";

  return (
    <div className="min-h-screen bg-toss-grey flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-[420px] p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-toss-dark mb-2">
            사장님 회원가입
          </h1>
          <p className="text-toss-light text-sm">
            아래 정보를 입력해 계정을 생성해주세요
          </p>
        </div>

        {/* 상태 카드 */}
        <div className="mb-5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-gray-900">
              입력 상태
            </span>
            <span className="text-xs font-bold text-gray-400">
              {canSubmit ? "완료" : "진행 중"}
            </span>
          </div>

          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${(() => {
                  let score = 0;
                  if (form.name.trim()) score++;
                  if (form.id.trim() && idChecked && idCheckResult === "ok")
                    score++;
                  if (pwMinOk) score++;
                  if (pwMatch === true) score++;
                  if (form.studentId.trim()) score++;
                  if (form.department.trim()) score++;
                  if (phoneOk) score++;
                  return Math.round((score / 7) * 100);
                })()}%`,
                backgroundColor: "#3182F6",
              }}
            />
          </div>

          <div className="mt-2 text-xs font-bold text-gray-500">
            {canSubmit
              ? "모든 조건을 만족했어요. 회원가입을 진행할 수 있습니다."
              : "필수 정보를 입력하고 중복 확인을 완료해주세요."}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="이름"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="홍길동"
            error={errors.name}
          />

          <div>
            <div className="flex items-end gap-2">
              <Input
                label="아이디"
                value={form.id}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                  setField("id", val);
                }}
                placeholder="영문, 숫자 조합"
                containerClassName="flex-1"
              />
              <Button
                variant="outline"
                size="md"
                onClick={handleIdCheck}
                className="mb-[1px]"
              >
                중복 확인
              </Button>
            </div>

            {idChecked && idCheckResult === "ok" && (
              <FieldPill variant="ok" msg="사용 가능한 아이디입니다." />
            )}
            {idChecked && idCheckResult === "dup" && (
              <FieldPill variant="error" msg="이미 사용 중인 아이디입니다." />
            )}
            <FieldPill variant="error" msg={errors.id} />
          </div>

          <div>
            <div className="relative">
              <Input
                label="비밀번호"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder="••••••••"
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600 outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
            {pwTouched && (
              <FieldPill variant={pwMinOk ? "ok" : "warn"} msg={pwMinOk ? "사용 가능한 비밀번호입니다." : "비밀번호는 4자리 이상이 좋아요."} />
            )}
            <FieldPill variant="error" msg={errors.password} />
          </div>

          <div>
            <Input
              label="비밀번호 확인"
              type="password"
              value={form.passwordConfirm}
              onChange={(e) => setField("passwordConfirm", e.target.value)}
              placeholder="••••••••"
              error={errors.passwordConfirm}
              className={pwMatch === true ? "ring-2 ring-blue-200" : pwMatch === false ? "ring-2 ring-red-200" : ""}
            />
            {pwConfirmTouched && pwTouched && pwMatch === true && (
              <FieldPill variant="ok" msg="비밀번호가 일치합니다." />
            )}
          </div>

          <Input
            label="학번"
            value={form.studentId}
            onChange={(e) => setField("studentId", e.target.value)}
            placeholder="20231234"
            error={errors.studentId}
          />

          <Input
            label="학과"
            value={form.department}
            onChange={(e) => setField("department", e.target.value)}
            placeholder="컴퓨터공학과"
            error={errors.department}
          />

          <Input
            label="전화번호"
            type="tel"
            value={form.phone}
            onChange={(e) => setField("phone", formatPhone(e.target.value))}
            placeholder="010-1234-5678"
            inputMode="numeric"
            helperText={form.phone.length > 0 && !phoneOk ? "전화번호 11자리를 입력해주세요." : phoneOk ? "전화번호 형식이 올바릅니다." : ""}
            error={errors.phone}
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            variant="primary"
            disabled={!canSubmit}
            className="mt-6"
          >
            회원가입하기
          </Button>

          {!canSubmit && (
            <div className="text-center text-xs font-bold text-gray-400">
              모든 항목 입력 + 아이디 중복 확인 + 비밀번호 일치가 필요합니다.
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-toss-light">
            이미 계정이 있으신가요?{" "}
            <button
              type="button"
              onClick={() => navigate("/owner/login")}
              className="text-toss-blue font-bold hover:underline"
            >
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerSignup;
