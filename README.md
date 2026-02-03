# 📊 Personal Dashboard

노션 작업 관리 + Google Calendar를 연동한 개인 대시보드입니다.

![Dashboard Preview](https://via.placeholder.com/800x400/1a1a2e/ffffff?text=Personal+Dashboard)

## ✨ 기능

- **📅 일정 관리**: Google Calendar 연동 (오늘/다가오는 일정)
- **📋 작업 관리**: 노션 작업함 DB 실시간 조회 (대기/진행중/완료)
- **🔁 루틴 체크**: 노션 루틴 DB 연동
- **💡 아이디어**: 노션 아이디어 DB 최신 항목
- **🔄 실시간 업데이트**: 1분 간격 자동 새로고침 (설정 가능)

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone <your-repo-url>
cd personal-dashboard
npm install
```

### 2. 환경 변수 설정

`.env.example`을 `.env.local`로 복사하고 값을 입력하세요:

```bash
cp .env.example .env.local
```

```env
# Notion API
NOTION_API_KEY=your_notion_integration_token

# Google Calendar API (Service Account)
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_CALENDAR_ID=primary

# Optional
NEXT_PUBLIC_REFRESH_INTERVAL=60000
```

### 3. Notion 설정

1. [Notion Integrations](https://www.notion.so/my-integrations)에서 새 통합 생성
2. 생성된 API 키를 `NOTION_API_KEY`에 입력
3. 연동할 데이터베이스에 통합 연결 (Share → 통합 추가)

### 4. Google Calendar 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Calendar API 활성화
3. 서비스 계정 생성 및 JSON 키 다운로드
4. 캘린더 설정에서 서비스 계정 이메일에 "일정 보기" 권한 부여
5. JSON 키에서 `client_email`과 `private_key` 추출하여 환경 변수에 입력

### 5. 로컬 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인

## 📦 Vercel 배포

### 방법 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

### 방법 2: GitHub 연동

1. GitHub에 저장소 푸시
2. [Vercel](https://vercel.com)에서 Import
3. 환경 변수 설정 후 배포

### 환경 변수 설정

Vercel 대시보드 → Settings → Environment Variables에서 추가:

| Key | Value |
|-----|-------|
| `NOTION_API_KEY` | Notion API 키 |
| `GOOGLE_CLIENT_EMAIL` | 서비스 계정 이메일 |
| `GOOGLE_PRIVATE_KEY` | 서비스 계정 비공개 키 (줄바꿈 포함) |
| `GOOGLE_CALENDAR_ID` | 캘린더 ID (기본: primary) |

> ⚠️ `GOOGLE_PRIVATE_KEY`는 `-----BEGIN PRIVATE KEY-----` ~ `-----END PRIVATE KEY-----` 전체를 입력하세요.

## 🎨 커스터마이징

### 새로고침 간격 변경

`.env.local`:
```env
NEXT_PUBLIC_REFRESH_INTERVAL=30000  # 30초
```

### DB ID 변경

`lib/notion.js`의 `DB_IDS` 객체 수정:

```javascript
export const DB_IDS = {
  tasks: 'your-task-db-id',
  routines: 'your-routine-db-id',
  // ...
};
```

## 📁 프로젝트 구조

```
dashboard/
├── app/
│   ├── api/
│   │   ├── notion/route.js    # Notion API 엔드포인트
│   │   └── calendar/route.js  # Calendar API 엔드포인트
│   ├── globals.css            # 글로벌 스타일
│   ├── layout.js              # 루트 레이아웃
│   └── page.js                # 메인 대시보드
├── lib/
│   ├── notion.js              # Notion 클라이언트
│   └── calendar.js            # Google Calendar 클라이언트
├── .env.example               # 환경 변수 예시
├── package.json
└── README.md
```

## 🔧 트러블슈팅

### Notion 데이터가 안 보여요
- Integration이 데이터베이스에 연결되었는지 확인
- DB 스키마(속성명)가 코드와 일치하는지 확인

### Google Calendar 오류
- 서비스 계정에 캘린더 접근 권한 부여 확인
- `GOOGLE_PRIVATE_KEY` 줄바꿈(`\n`) 포함 여부 확인

### Vercel 배포 후 작동 안 함
- 환경 변수가 모두 설정되었는지 확인
- Vercel 로그에서 오류 메시지 확인

## 📄 라이선스

MIT License
