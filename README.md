# ESG 대시보드

![Next.js](https://img.shields.io/badge/Next.js-14.0-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)

ESG 대시보드는 기업의 환경, 사회, 지배구조(ESG) 데이터를 시각화하고 관리할 수 있는 인터랙티브 대시보드 플랫폼입니다. 다양한 차트 유형을 통해 데이터를 직관적으로 분석할 수 있습니다.

## 주요 기능

- **다양한 차트 시각화**: 막대 차트, 라인 차트, 파이 차트 등을 통한 데이터 시각화
- **인터랙티브 대시보드**: 사용자가 직접 차트를 추가/삭제하여 커스터마이징 가능
- **대시보드 잠금 기능**: 편집 모드를 잠그고 해제하여 실수로 인한 변경 방지
- **반응형 디자인**: 모바일부터 데스크톱까지 모든 화면 크기에 최적화
- **사용자 인증**: 기업 및 담당자 정보 관리

## 시작하기

### 필수 조건

- Node.js 18.0 이상
- npm 또는 yarn 또는 pnpm

### 설치 방법

저장소를 클론하고 의존성을 설치합니다:

```bash
# 저장소 클론
git clone https://github.com/your-username/esg-dashboard.git
cd esg-dashboard

# 의존성 설치
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 환경 변수 설정

프로젝트 루트에 다음 환경 변수 파일을 생성합니다:

**.env.local** (개인 개발 환경 - git에 포함되지 않음)
```
# 인증 우회 설정 (개발/테스트용)
NEXT_PUBLIC_BYPASS_AUTH=true

# API URL 설정
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**.env.development** (개발 환경 - git에 포함됨)
```
# 인증 우회 설정
NEXT_PUBLIC_BYPASS_AUTH=false

# API URL 설정
NEXT_PUBLIC_API_URL=http://192.168.0.224:8080/api
```

**.env.production** (프로덕션 환경)
```
# 인증 우회 설정 (프로덕션에서는 항상 false)
NEXT_PUBLIC_BYPASS_AUTH=false

# API URL 설정
NEXT_PUBLIC_API_URL=http://192.168.0.224:8080/api
```

**주요 환경 변수**:
- `NEXT_PUBLIC_BYPASS_AUTH`: 인증 보호 기능 우회 설정 (`true`: 우회 활성화, `false`: 우회 비활성화)
- `NEXT_PUBLIC_API_URL`: API 서버 URL

**개발 중 인증 우회 방법**:
1. `.env.local` 파일에서 `NEXT_PUBLIC_BYPASS_AUTH=true` 설정
2. URL에 `?bypass_auth=true` 쿼리 파라미터 추가 (예: `http://localhost:3000/mypage/company?bypass_auth=true`)

### 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 기술 스택

- **프레임워크**: [Next.js](https://nextjs.org/)
- **언어**: [TypeScript](https://www.typescriptlang.org/)
- **스타일링**: [Tailwind CSS](https://tailwindcss.com/)
- **차트 라이브러리**: [Recharts](https://recharts.org/)
- **UI 컴포넌트**: Shadcn UI

## 프로젝트 구조

```
src/
├── app/                # Next.js 앱 라우터
│   ├── (login)/        # 로그인/회원가입 관련 페이지
│   ├── dashboard/      # 대시보드 페이지
│   └── mypage/         # 마이페이지
├── components/         # 재사용 가능한 컴포넌트
│   ├── dashboard/      # 대시보드 전용 컴포넌트
│   └── ui/             # UI 컴포넌트
└── lib/                # 유틸리티 및 헬퍼 함수
```

## 기여 방법

프로젝트에 기여하고 싶으시다면:

1. 이 저장소를 포크합니다.
2. 새로운 브랜치를 생성합니다: `git checkout -b feature/amazing-feature`
3. 변경사항을 커밋합니다: `git commit -m 'Add some amazing feature'`
4. 브랜치에 푸시합니다: `git push origin feature/amazing-feature`
5. Pull Request를 생성합니다.

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 감사의 말

- [Next.js](https://nextjs.org/) - React 프레임워크
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [Recharts](https://recharts.org/) - 차트 라이브러리
- [Shadcn UI](https://ui.shadcn.com/) - UI 컴포넌트
