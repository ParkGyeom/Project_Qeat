# 🍢 Qeat — 축제 부스 주문 관리 서비스

> QR 코드로 테이블에서 바로 주문하고, 부스 운영자는 실시간으로 주문·메뉴·매출을 관리하는 웹 서비스

축제나 행사장의 부스는 주문을 대부분 종이와 구두로 처리합니다. 대기열이 길어지고, 주문 누락이 생기고, 정산할 때가 되면 매출을 정확히 알기 어렵습니다. **Qeat**는 이 과정을 웹으로 옮겨 손님·부스 운영자·행사 관리자 세 주체를 하나의 흐름으로 연결합니다.

이 저장소는 그중 **프론트엔드(React + Vite)** 파트입니다.

---

## 📖 목차

- [주요 기능](#-주요-기능)
- [서비스 흐름](#-서비스-흐름)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [라우팅](#-라우팅)
- [API 연동](#-api-연동)
- [시작하기](#-시작하기)
- [환경 변수](#-환경-변수)
- [배포](#-배포)
- [프로젝트 정보](#-프로젝트-정보)

---

## ✨ 주요 기능

### 🙋 손님 (Guest)

QR 코드를 찍으면 로그인 없이 바로 주문할 수 있습니다.

- **QR 테이블 접속** — `/qr/:tableToken`으로 접속하면 해당 테이블이 자동 식별됩니다. 별도 로그인·회원가입 없음
- **카테고리별 메뉴 탐색** — 메인 / 사이드 / 음료 / 직원호출 탭으로 분류
- **장바구니** — 담기·수량 조절·삭제를 하단 플로팅 바에서 즉시 확인
- **품절 처리** — 부스가 품절 처리한 메뉴는 주문 불가로 표시
- **주문 완료 화면** — 주문 접수 후 확인 페이지로 이동

### 👨‍🍳 부스 운영자 (Owner)

로그인 후 본인이 승인받은 부스를 선택해 운영합니다.

- **주문 관리** — `접수대기 → 조리중 → 처리완료` 3단계 워크플로우, 단계별 상태 변경 및 주문 취소
- **메뉴 관리** — 메뉴 등록·수정·삭제, 이미지 업로드(`multipart/form-data`), 품절 토글
- **테이블 관리** — 테이블 개별/일괄 생성, 비활성화·재활성화
- **영업 관리** — 영업 상태(영업중/마감) 전환, 영업 시작·종료 시간 설정, 마감 임박 알림
- **매출 관리** — 기간 조회(날짜 범위 선택), 일자별 매출 그래프(가로 스크롤). 처리완료(`DONE`) 주문만 집계

### 🛡️ 행사 관리자 (Admin)

부스 개설 요청을 심사하고 전체 부스를 관리합니다.

- **부스 승인 관리** — 승인 대기(`PENDING`) 목록 조회 후 승인 / 반려
- **부스 목록** — 등록된 전체 부스 및 운영자 정보 조회
- **운영 정지** — 문제가 있는 부스를 정지(`suspend`) 처리

---

## 🔄 서비스 흐름

```
[운영자] 부스 개설 신청
              │
              ▼
[관리자] 승인 심사 ──── 반려 ──▶ 종료
              │
            승인
              ▼
[운영자] 메뉴 등록 · 테이블 생성 · 영업 시작
              │
              ▼
[손님] QR 스캔 ─▶ 메뉴 탐색 ─▶ 장바구니 ─▶ 주문
              │
              ▼
[운영자] 접수대기 ─▶ 조리중 ─▶ 처리완료
                              │
                              ▼
                         매출에 집계
```

---

## 🛠 기술 스택

| 구분 | 기술 | 비고 |
|---|---|---|
| **Core** | React 19 | 함수형 컴포넌트 + Hooks |
| **Build** | Vite 7 | HMR, 개발 서버 프록시 |
| **Routing** | React Router 7 | 중첩 라우트 + 레이아웃 라우트 |
| **State** | Zustand 5 | 장바구니 전역 상태 |
| **HTTP** | Axios 1.x | 인스턴스 분리, 인터셉터로 401 처리 |
| **Styling** | Tailwind CSS 3 | PostCSS + Autoprefixer |
| **Lint** | ESLint 9 | react-hooks, react-refresh 플러그인 |
| **Deploy** | Vercel | SPA rewrite 설정 |

---

## 📁 프로젝트 구조

```
src/
├── api/                     # 백엔드 API 통신 레이어
│   ├── axios.js             #   공통 인스턴스 (withCredentials, 401 인터셉터)
│   ├── authApi.js           #   로그인 / 내 정보 / 로그아웃
│   ├── boothApi.js          #   부스 CRUD, 승인·반려·정지, 영업시간
│   ├── menuApi.js           #   메뉴 CRUD, 품절 토글 (이미지 업로드 포함)
│   ├── orderApi.js          #   주문 생성·조회·상태변경·취소, 매출 요약
│   └── tableApi.js          #   테이블 생성(단일/일괄), 활성화 토글
│
├── components/
│   ├── auth/                # OwnerGuard, AdminGuard (보호 라우트)
│   ├── common/              # Button, Input, Modal(Portal), 날짜/시간 피커
│   ├── guest/               # MenuCard, CategoryTab, CartFloatingBar, OrderBottomSheet
│   └── owner/               # MenuForm, OrderCard, SalesChart
│
├── layouts/
│   ├── GuestLayout.jsx      # 손님용 모바일 레이아웃
│   └── AdminLayout.jsx      # 운영자·관리자 공용 사이드바 레이아웃
│
├── pages/
│   ├── Guest/               # MenuPage, OrderComplete
│   ├── Owner/               # OwnerLogin, BoothSelect, OrderManage,
│   │                        # MenuManage, SalesManage, BusinessManage
│   └── Admin/               # AdminLogin, BoothApprovalManage, StoreList
│
├── store/                   # Zustand 스토어 (cartStore)
├── utils/                   # 포맷터, 영업상태 계산, 부스 정보 로컬 저장
└── constants/               # 메뉴 카테고리 등 상수
```

### 설계 포인트

- **API 레이어 분리** — 컴포넌트는 도메인별 API 모듈만 호출하고, HTTP 세부사항을 알지 못합니다. 백엔드 응답 필드명(`orderId`, `totalPrice`, `menuName` …)을 프론트 모델(`id`, `totalAmount`, `name` …)로 변환하는 작업도 이 레이어가 담당합니다.
- **레이아웃 라우트** — `AdminLayout`을 부모 라우트로 두어 운영자·관리자 페이지가 사이드바를 공유합니다.
- **보호 라우트** — `OwnerGuard`가 `Outlet`을 감싸 로그인 세션이 없으면 로그인 페이지로 리다이렉트합니다.
- **모달 Portal** — `Modal`을 React Portal로 렌더링해 부모의 `overflow`/`z-index`에 갇히는 문제를 해결했습니다.
- **공개 API 분리** — 손님용 주문·테이블 조회는 인증이 필요 없으므로 `/api/public/*` 경로와 별도 axios 인스턴스를 사용합니다.

---

## 🗺 라우팅

| 경로 | 화면 | 접근 |
|---|---|---|
| `/` | `/guest/menu`로 리다이렉트 | 공개 |
| `/qr/:tableToken` | 메뉴 페이지 (QR 테이블 식별) | 공개 |
| `/guest/menu` | 메뉴 페이지 | 공개 |
| `/guest/order-complete` | 주문 완료 | 공개 |
| `/owner/login` | 운영자 로그인 | 공개 |
| `/owner/booth-select` | 운영할 부스 선택 | 🔒 Owner |
| `/owner/orders` | 주문 관리 | 🔒 Owner |
| `/owner/menu` | 메뉴 관리 | 🔒 Owner |
| `/owner/sales` | 매출 관리 | 🔒 Owner |
| `/owner/business` | 영업·테이블 관리 | 🔒 Owner |
| `/admin/login` | 관리자 로그인 | 공개 |
| `/admin/booth-approval` | 부스 승인 관리 | ⚠️ 아래 참고 |
| `/admin/stores` | 부스 목록 | ⚠️ 아래 참고 |

> ⚠️ **알려진 미완성 부분** — `AdminGuard` 컴포넌트는 구현되어 있으나 `App.jsx`의 라우트에 적용되어 있지 않습니다. 따라서 현재 관리자 페이지는 라우트 단에서 보호되지 않습니다. `OwnerGuard`와 동일한 방식으로 `<Route element={<AdminGuard />}>`로 감싸면 해결됩니다.

---

## 🔌 API 연동

백엔드와는 **세션 쿠키 기반 인증**으로 통신합니다. axios 인스턴스에 `withCredentials: true`를 설정해 모든 요청에 세션 쿠키를 포함시키고, 응답 인터셉터에서 `401`을 감지합니다.

| 모듈 | 주요 엔드포인트 |
|---|---|
| `authApi` | `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` |
| `boothApi` | `GET/POST/PUT/DELETE /api/booths`, `PATCH /api/booths/{id}/approve\|reject\|suspend`, `PATCH /api/booths/{id}/open-status`, `PATCH /api/booths/{id}/operating-time` |
| `menuApi` | `GET/POST /api/booths/{boothId}/menus`, `PATCH/DELETE .../menus/{menuId}`, `PATCH .../sold-out` |
| `tableApi` | `GET/POST /api/booths/{boothId}/tables`, `POST .../tables/bulk`, `PATCH .../activate\|deactivate` |
| `orderApi` | `POST /api/public/tables/{token}/orders`, `GET /api/booths/{boothId}/orders`, `PATCH /api/orders/{orderId}/booths/{boothId}/confirm\|complete\|cancel`, `GET .../sales-summary` |

### 주문 상태 매핑

백엔드 enum을 프론트 표시 문구로 변환합니다.

| 백엔드 | 프론트 | 설명 |
|---|---|---|
| `CHECK` | 접수대기 | 주문 직후 초기 상태 |
| `COOKING` | 조리중 | 운영자가 접수(`confirm`) |
| `DONE` | 처리완료 | 조리 완료(`complete`), 매출 집계 대상 |
| `CANCELED` | 주문취소 | 운영자가 취소(`cancel`) |

---

## 🚀 시작하기

### 요구 사항

- Node.js 18 이상
- 실행 중인 [Qeat 백엔드 서버](https://github.com/jhkim2da/qeat-backend)

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/ParkGyeom/Project_Qeat.git
cd Project_Qeat

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
#    .env를 열어 백엔드 주소를 본인 환경에 맞게 수정

# 4. 개발 서버 실행
npm run dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다. `host: '0.0.0.0'` 설정이 되어 있어 **같은 네트워크의 휴대폰에서도 접속**할 수 있습니다 — QR 주문 화면을 실제 모바일에서 테스트하기 위한 설정입니다.

### 스크립트

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 (HMR) |
| `npm run build` | 프로덕션 빌드 → `dist/` |
| `npm run preview` | 빌드 결과 로컬 미리보기 |
| `npm run lint` | ESLint 검사 |

---

## 🔐 환경 변수

프로젝트 루트에 `.env` 파일을 만들고 아래 값을 설정합니다. (`.env.example` 참고)

| 변수 | 설명 | 예시 |
|---|---|---|
| `VITE_API_BASE_URL` | 백엔드 API 서버 주소 | `http://localhost:9090` |

이 값은 두 곳에서 사용됩니다.

1. **개발 서버 프록시** — `vite.config.js`가 `loadEnv`로 읽어 `/api` 요청의 프록시 대상으로 사용
2. **절대 경로 prefix** — 메뉴 이미지 및 손님 주문 요청 등 프록시를 거치지 않는 요청의 주소 앞에 붙음

> ⚠️ `.env`는 `.gitignore`에 포함되어 있습니다. 커밋하지 마세요.

---

## 📦 배포

**Vercel**로 배포합니다. `vercel.json`에 SPA rewrite 규칙이 설정되어 있어, `/owner/orders` 같은 경로로 직접 접속하거나 새로고침해도 404가 발생하지 않고 `index.html`로 라우팅됩니다.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

배포 시 Vercel 프로젝트 설정에서 `VITE_API_BASE_URL` 환경 변수를 등록해야 합니다.

---

## 📌 프로젝트 정보

- **프로젝트명** — Qeat (Queue + Eat)
- **기간** — 2026.01 ~ 2026.08
- **구성** — 팀 프로젝트
- **담당** — 프론트엔드 전반 (화면 설계·구현, API 연동, 상태 관리, 배포)
- **백엔드 저장소** — [jhkim2da/qeat-backend](https://github.com/jhkim2da/qeat-backend) (Spring Boot)

> 이 저장소는 팀 저장소에서 프론트엔드 파트를 분리해 보관한 것으로, 커밋 히스토리에는 다른 팀원의 커밋도 포함되어 있습니다.
