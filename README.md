<div align="center">
  <img src="src/app/icon.svg" width="56" alt="X-Key" />
  <h1>X-Key</h1>
  <p><strong>문서와 엑셀에 흩어진 팀 계정 정보를, 한곳에.</strong></p>
  <p>계정 저장 · 접근 코드 공유 · 2FA 표시 · CSV 내보내기</p>
  <p><a href="#먼저-화면만-체험하기">데모 실행</a> · <a href="#실제-회사에서-사용하기">설치 가이드</a> · <a href="#설치-후-사용법">사용법</a> · <a href="#문제가-생겼을-때">문제 해결</a></p>
</div>

![X-Key 관리자 계정 관리 화면](docs/screenshots/account-management.jpg)

회사에서 함께 사용하는 서비스의 URL, 아이디, 비밀번호와 API 키를 정리하는 작은 도구입니다.
관리자는 계정을 등록하고, 구성원은 전달받은 링크와 접근 코드로 필요한 정보를 찾습니다.

**이 저장소를 설치하는 사람마다 자신의 Supabase DB와 웹 호스팅을 연결해 사용합니다.**
제작자의 DB나 실제 회사 계정이 함께 제공되는 방식은 아닙니다.

> 모든 스크린샷은 가상 계정으로 촬영한 데모입니다. `example.com` 이메일과 화면의 데모 코드는 실제 업무용 정보가 아닙니다.

## 어떤 기능이 있나요?

| 기능 | 할 수 있는 일 |
| --- | --- |
| 계정 저장소 | 분류, 이름, URL, 아이디, 비밀번호/API 키, 메모 등록·수정·삭제 |
| 두 가지 공유 권한 | 구성원 코드는 공개 계정만, 경영진 코드는 비공개 계정까지 열람 |
| 7일 접근 코드 | 발급 시점부터 7일간 사용, 최근 인증 시각·횟수 확인, 코드 회수 |
| 2FA 표시 | 추가 인증이 필요한 계정에 작은 `2FA` 텍스트 배지 표시 |
| 검색과 CSV | 검색·분류·공개 여부로 필터하고 현재 목록을 CSV로 저장 |
| 화면 크기 대응 | 접히는 사이드바, 휴대폰에서 읽기 편한 카드 목록 |

`공개`는 **유효한 구성원 코드로 볼 수 있다는 뜻**입니다. 코드 없이 인터넷에 공개된다는 뜻은 아닙니다.
2FA 배지는 해당 서비스의 추가 인증 여부를 기록하는 표시입니다. OTP 생성이나 인증 우회 기능은 없습니다.

## 먼저 화면만 체험하기

DB나 호스팅을 준비하기 전에 로컬에서 화면부터 확인할 수 있습니다.
**Node.js 22 이상**, npm, Git이 필요합니다.

```bash
git clone https://github.com/xierrajeon/X-Key.git
cd X-Key
npm ci
npm run dev
```

터미널에 표시된 주소를 엽니다. 기본 주소는 [http://localhost:3000](http://localhost:3000)입니다.
포트가 사용 중이면 터미널에 표시된 다른 포트를 사용하세요.

| 데모 진입 | 값 |
| --- | --- |
| 관리자 `/admin` | 아이디 `admin` / 비밀번호 `admin` |
| 구성원 `/` | 코드 `XKEY-TEAM-DEMO` |
| 경영진 `/` | 코드 `XKEY-EXEC-DEMO` |

- 환경변수가 없는 개발 환경에서만 메모리 데모로 동작합니다.
- 관리자 첫 로그인 시 새 비밀번호를 설정해야 합니다. 데모 변경 내용은 서버 재시작 시 초기화됩니다.
- **실제 회사 계정정보는 데모에 입력하지 마세요.** 실제 사용은 아래 DB 연결까지 완료한 뒤 시작하세요.
- 이미 `.env.local`로 DB를 연결했다면, 데모 체험은 별도 체크아웃에서 진행하세요.

## 실제 회사에서 사용하기

### 전체 순서

**① 내 저장소 준비 → ② Supabase DB 생성 → ③ SQL 실행 → ④ 환경변수 설정 → ⑤ Vercel 배포 → ⑥ 최초 관리자 설정**

| 준비물 | 용도 |
| --- | --- |
| 내 GitHub 저장소 | 이 프로젝트를 Fork해 코드 보관·업데이트 |
| Supabase 프로젝트 | 계정정보, 접근 코드, 로그인 세션 저장 |
| Vercel 프로젝트 | 웹 화면과 Next.js 서버 API 호스팅 |

별도 VM을 운영할 필요는 없습니다. Vercel 외에도 **Next.js 서버 실행을 지원하는 호스팅**을 사용할 수 있습니다.
GitHub Pages 같은 정적 파일 전용 호스팅에는 이 프로젝트를 그대로 올릴 수 없습니다.

### 설치 전에: GitHub, Supabase, Vercel은 각각 무엇인가요?

처음 사용한다면 다음처럼 구분하면 됩니다.

| 서비스 | 쉬운 설명 | 여기서 할 일 |
| --- | --- | --- |
| **GitHub** | X-Key 프로그램 파일이 들어 있는 보관함 | 원본을 내 계정으로 복사(Fork) |
| **Supabase** | 실제 계정정보를 저장하는 온라인 데이터베이스(DB) | DB 프로젝트를 만들고 준비된 SQL 실행 |
| **Vercel** | 프로그램을 인터넷에서 실행하고 웹 주소를 발급해 주는 호스팅 서비스 | GitHub 파일을 가져와 웹사이트로 배포 |

구성원은 **Vercel에서 발급받은 웹 주소**로 접속합니다. X-Key가 정보를 읽고 저장할 때는 서버가 **Supabase DB**와 통신합니다.

```text
구성원 브라우저 → 내 X-Key 웹사이트(Vercel) → 내 데이터베이스(Supabase)
                         ↑
                 프로그램 파일(GitHub)
```

**Supabase만 만들면 웹사이트가 생기는 것은 아닙니다.** DB 설정과 웹 배포를 모두 해야 합니다.
여기서 “배포”는 GitHub에 있는 프로그램을 Vercel이 설치·빌드해서 인터넷에서 실행할 수 있도록 만드는 과정입니다.

아래 안내는 웹 대시보드 기준입니다. Vercel에 파일을 하나씩 업로드하거나 FTP 프로그램을 사용할 필요는 없습니다.

### 1. 내 GitHub 저장소 준비

1. [GitHub](https://github.com)에 로그인합니다.
2. [X-Key 저장소](https://github.com/xierrajeon/X-Key)를 엽니다.
3. 오른쪽 위 **Fork**를 누릅니다.
4. Owner에 본인 계정을 선택하고 **Create fork**를 누릅니다.
5. 주소가 `https://github.com/내아이디/X-Key`로 바뀌었는지 확인합니다.

Fork는 프로젝트를 내 GitHub 계정으로 복사하는 기능입니다. 원본 저장소를 수정하는 작업은 아닙니다.

Vercel은 이 Fork를 직접 가져올 수 있습니다. 로컬에서도 체험·개발하려면 아래 명령으로 내려받습니다.
`YOUR_GITHUB_ID`는 그대로 입력하지 말고 본인의 GitHub 아이디로 바꾸세요.

```bash
git clone https://github.com/YOUR_GITHUB_ID/X-Key.git
cd X-Key
npm ci
```

이후 Vercel에는 **본인이 Fork한 저장소**를 연결합니다.

### 2. Supabase 프로젝트 생성

#### 2-1. 가입하고 프로젝트 열기

1. [https://supabase.com/](https://supabase.com/)에 접속합니다.
2. **Start your project** 또는 **Sign in**으로 가입·로그인합니다. GitHub 로그인도 사용할 수 있습니다.
3. [Dashboard](https://supabase.com/dashboard)에서 본인 Organization을 선택합니다. 처음이라면 조직을 먼저 생성합니다.
4. **New project**를 누릅니다.
5. 아래 설정을 입력하고 **Create new project**를 누릅니다.
6. 프로젝트 준비가 끝날 때까지 기다린 뒤 생성한 프로젝트를 엽니다.

프로젝트는 X-Key의 데이터가 저장될 공간입니다. 여기서 정하는 프로젝트 이름은 웹사이트 주소와 달라도 됩니다.

| 항목 | 설정 |
| --- | --- |
| Project name | 원하는 이름. 예: `X-Key` |
| Database password | 강한 비밀번호를 생성하고 별도 보관 |
| Region | 사용하는 지역과 가까운 곳. 한국 사용자는 서울 선택 가능 여부 확인 |
| Enable Data API | 켜기 |
| Automatically expose new tables | 끄기 |
| Enable automatic RLS | 켜기 |

#### 2-2. 프로젝트 주소와 Secret key 찾기

**먼저 생성한 X-Key 프로젝트 안에 들어가 있어야 합니다.** 조직 전체 설정이 아니라 프로젝트 설정을 여세요.

1. 프로젝트 화면의 **Connect**를 누르거나 왼쪽 **Project Settings → Data API**를 엽니다.
2. **Project URL**을 찾아 복사합니다. `https://YOUR_PROJECT.supabase.co` 형태이며, 나중에 `SUPABASE_URL`에 넣을 값입니다.
3. 왼쪽 **Project Settings → API Keys**를 엽니다.
4. **Secret keys** 영역에서 서버용 키를 확인합니다. 필요한 경우 화면 안내에 따라 Secret key를 생성합니다.
5. `sb_secret_...`로 시작하는 값을 복사합니다. 나중에 `SUPABASE_SERVICE_ROLE_KEY`에 넣습니다.

대시보드 버전에 따라 메뉴가 `Settings`, `Project Settings`, `Data API`, `API Keys` 등으로 보일 수 있습니다.
주소창의 `supabase.com/dashboard/project/...`는 관리 화면 주소입니다. **이 주소를 `SUPABASE_URL`에 넣으면 안 됩니다.**

이 프로젝트는 서버에서 DB에 접근하므로 Publishable key는 사용하지 않습니다.
설정 이름 `SUPABASE_SERVICE_ROLE_KEY`에는 새 **Secret key**를 넣으면 됩니다. 기존 `service_role` 키도 지원합니다.
Database password는 앱 관리자 비밀번호와 별개이며, 현재 앱 환경변수에는 입력하지 않습니다.

[Supabase API 키 공식 안내](https://supabase.com/docs/guides/getting-started/api-keys)

### 3. SQL 파일을 찾아 Supabase에서 실행하기

#### 3-1. SQL은 어디에 있나요?

**SQL을 새로 작성할 필요는 없습니다.** X-Key 저장소에 설치용 SQL 파일이 이미 들어 있습니다.
SQL은 “DB에 어떤 테이블과 기능을 만들지” 적어 둔 명령문입니다. 준비된 파일을 복사해서 Supabase에서 실행하면 됩니다.

GitHub에서 아래 폴더를 순서대로 클릭하세요.

```text
내 X-Key 저장소
└── supabase
    └── migrations
        ├── 001_vault.sql                ← 첫 번째 실행
        └── 002_account_two_factor.sql   ← 두 번째 실행
```

| 순서 | 파일 열기 | 하는 일 |
| --- | --- | --- |
| 1 | [001_vault.sql](supabase/migrations/001_vault.sql) | 계정·코드·세션 테이블, 인증 함수, 접근 권한, 초기 관리자 생성 |
| 2 | [002_account_two_factor.sql](supabase/migrations/002_account_two_factor.sql) | 계정별 2FA 사용 여부 필드 추가 |

**파일 내용 복사 방법**

1. 위 링크 또는 내 저장소의 `supabase → migrations → 001_vault.sql`을 클릭합니다.
2. GitHub 파일 화면의 **Raw** 또는 **View raw**를 눌러 코드만 표시합니다.
3. `Ctrl+A → Ctrl+C`로 전체 선택·복사합니다. Mac은 `⌘A → ⌘C`입니다.
4. Raw 버튼을 찾기 어렵다면 [001 원문](https://raw.githubusercontent.com/xierrajeon/X-Key/main/supabase/migrations/001_vault.sql)을 열어 복사할 수 있습니다.

로컬로 내려받았다면 같은 경로의 `.sql` 파일을 VS Code 같은 텍스트 편집기로 열어 전체 내용을 복사해도 됩니다.
파일명, GitHub 화면 전체, README 설명이 아니라 **SQL 파일의 본문**을 복사하세요.

#### 3-2. Supabase의 어디에 붙여넣나요?

브라우저에서 GitHub 탭과 Supabase 탭을 각각 열어 두면 편합니다.

1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속합니다.
2. 2단계에서 만든 **X-Key 프로젝트**를 클릭합니다.
3. 왼쪽 세로 메뉴에서 **SQL Editor**를 클릭합니다. 메뉴가 접혀 있다면 아이콘에 마우스를 올려 이름을 확인합니다.
4. **New query** 또는 **+**를 눌러 빈 SQL 편집 탭을 만듭니다. `Create a new query`로 표시되기도 합니다.
5. 가운데 넓은 편집 영역을 클릭하고, 복사한 `001_vault.sql` 전체 내용을 붙여넣습니다.
6. 편집 영역의 **Run**을 누릅니다. 단축키는 Mac `⌘Enter`, Windows `Ctrl+Enter`입니다.
7. 아래 **Results** 영역에서 `Success. No rows returned` 같은 성공 메시지를 확인합니다.

테이블 생성 SQL은 표 형태의 조회 결과가 없어도 정상입니다. **Save만 누르는 것으로는 DB에 적용되지 않습니다. Run을 눌러야 합니다.**

#### 3-3. 두 번째 파일도 실행하기

1. GitHub로 돌아가 [002_account_two_factor.sql](supabase/migrations/002_account_two_factor.sql)을 엽니다. [002 원문 바로 열기](https://raw.githubusercontent.com/xierrajeon/X-Key/main/supabase/migrations/002_account_two_factor.sql)
2. 첫 번째 파일과 동일하게 전체 내용을 복사합니다.
3. Supabase SQL Editor에서 **새 쿼리 탭**을 만듭니다.
4. 두 번째 파일을 붙여넣고 **Run**을 누릅니다.
5. 다시 성공 메시지가 표시되는지 확인합니다.

#### 3-4. 제대로 생성됐는지 확인하기

Supabase 왼쪽의 **Table Editor**를 열고, 스키마가 `public`인지 확인합니다.
다음 테이블 5개가 보이면 기본 설치가 완료된 것입니다.

| 테이블 | 저장하는 내용 |
| --- | --- |
| `xkey_admin` | 관리자 계정 1개. 처음에는 `admin` |
| `xkey_accounts` | 공유할 서비스 계정. 아직 등록 전이면 비어 있는 것이 정상 |
| `xkey_codes` | 접근 코드와 인증 기록 |
| `xkey_sessions` | 관리자·구성원의 로그인 세션 |
| `xkey_attempts` | 인증 시도 제한 기록 |

`xkey_accounts`에 `has_2fa` 컬럼이 있으면 두 번째 SQL까지 적용된 상태입니다.
이후 실제 계정은 Supabase 표에 직접 입력하기보다 **X-Key 관리자 화면에서 등록**하세요. 비밀값 암호화 등 앱 처리가 필요합니다.

**새로 설치할 때만 `001`부터 실행합니다.** 기존 설치를 업데이트할 때는 아직 실행하지 않은 SQL만 추가로 적용하세요.
`already exists` 오류가 나오면 설치가 이미 진행됐을 수 있습니다. 테이블을 삭제하거나 001을 반복 실행하지 말고 생성 상태를 먼저 확인하세요.
SQL 파일을 GitHub에 올리거나 Vercel에 배포하는 것만으로 DB가 자동 생성되지는 않습니다.

[Supabase SQL Editor 사용 안내](https://supabase.com/docs/guides/database/functions#create-a-database-function)

### 4. 환경변수와 암호화 키 준비

환경변수는 소스코드 밖에 따로 보관하는 **설정 이름과 값의 쌍**입니다.
예를 들어 `SUPABASE_URL`은 설정 이름이고, `https://YOUR_PROJECT.supabase.co`는 그 설정의 값입니다.

로컬에서 실행할 때는 프로젝트 최상위 폴더의 `.env.local` 파일에 적습니다.
Vercel에 배포할 때는 **Vercel 관리 화면에도 같은 설정을 따로 입력**해야 합니다.

로컬 프로젝트에서 예제 파일을 복사합니다.

```bash
cp .env.example .env.local
```

Windows PowerShell에서는 `Copy-Item .env.example .env.local`을 사용하면 됩니다.

명령을 실행할 위치는 `package.json`이 있는 **X-Key 폴더 안**입니다.
복사한 `.env.local`을 VS Code나 텍스트 편집기로 열어 수정합니다. 파일명이 `.env.local.txt`가 되지 않도록 주의하세요.
Vercel 배포만 하려는 경우 이 파일을 업로드할 필요는 없지만, 아래 4개의 값을 준비해야 합니다.

비밀번호/API 키 저장에 사용할 암호화 키를 생성합니다. 아래 명령은 **64자리 랜덤 hex 문자열**을 출력합니다.

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

출력값을 `VAULT_ENCRYPTION_KEY`에 넣고, 다른 값도 채웁니다.

```dotenv
# 로컬 실행 주소. 배포 후 실제 웹 주소로 바꿉니다.
APP_URL=http://localhost:3000

# 2단계에서 확인한 Supabase 프로젝트 URL과 Secret key
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_YOUR_SECRET_KEY

# 위 명령으로 생성한 64자리 값을 입력
VAULT_ENCRYPTION_KEY=YOUR_GENERATED_64_CHARACTER_HEX_KEY
```

| 변수 | 넣을 값 | 어디에 쓰나요? |
| --- | --- | --- |
| `APP_URL` | **내 웹사이트 주소** | 열람 링크 복사, 운영 요청 출처 검사 |
| `SUPABASE_URL` | **내 Supabase 주소** | DB API 연결 |
| `SUPABASE_SERVICE_ROLE_KEY` | **Supabase Secret key** | 서버 전용 DB 접근 |
| `VAULT_ENCRYPTION_KEY` | **직접 생성한 암호화 키** | 비밀번호/API 키 암호화·복호화 |

`APP_URL`과 `SUPABASE_URL`은 서로 다른 주소입니다.
`APP_URL`에는 `/admin` 같은 경로를 붙이지 않습니다.

> `.env.local`은 Git에 올리지 않습니다. Secret key와 암호화 키에 `NEXT_PUBLIC_` 접두어를 붙이지 마세요.
> **암호화 키는 안전하게 별도 보관하세요.** 계정정보를 저장한 뒤 키를 잃어버리거나 교체하면 기존 비밀번호/API 키를 읽을 수 없습니다. 로컬과 운영에서 같은 DB를 쓴다면 같은 암호화 키를 사용해야 합니다.

원하면 이 단계에서 `npm run dev`로 DB 연결을 먼저 확인할 수 있습니다.
로컬 서버 주소가 `http://localhost:3001`처럼 달라지면 로컬의 `APP_URL`도 맞춰 주세요.
환경변수를 수정한 뒤에는 개발 서버를 재시작합니다.

### 5. Vercel에 배포하고 웹 주소 설정

#### 5-1. Vercel은 무엇인가요?

[Vercel](https://vercel.com)은 GitHub에 있는 웹 프로젝트를 가져와 인터넷에서 실행해 주는 서비스입니다.
설치·빌드가 끝나면 `https://프로젝트이름.vercel.app` 같은 주소를 받을 수 있습니다.
이 주소가 회사 구성원에게 전달할 **X-Key 웹 주소**입니다.

DB는 앞에서 만든 Supabase를 그대로 사용합니다. **Vercel에서 DB를 또 만들거나 Storage를 추가할 필요는 없습니다.**
별도 도메인 구매 없이 발급된 `vercel.app` 주소로 시작할 수 있습니다.
요금제는 본인의 사용 목적과 서비스 조건에 맞게 선택하세요.

#### 5-2. 가입하고 GitHub 저장소 연결하기

1. [https://vercel.com/](https://vercel.com/)에 접속해 **Sign Up** 또는 **Log In**을 누릅니다.
2. GitHub 연결을 선택하면 저장소를 가져오기 편합니다. GitHub 승인 화면이 뜨면 안내를 확인하고 본인 계정으로 연결합니다.
3. Vercel 대시보드에서 프로젝트를 만들 **계정 또는 팀 워크스페이스**를 선택합니다.
4. 오른쪽 위 **Add New → Project**를 누릅니다. 화면에 따라 **Create New → Project**로 보일 수 있습니다.
5. **Import Git Repository** 목록에서 본인이 Fork한 `X-Key`를 찾습니다.
6. 해당 저장소 옆의 **Import**를 누릅니다.

목록에 저장소가 없다면 **Install / Configure GitHub App** 또는 저장소 접근 설정을 엽니다.
본인 계정의 Fork가 Vercel에 허용되어 있는지 확인한 뒤 목록을 다시 불러옵니다.
원본 `xierrajeon/X-Key`가 아니라 `본인아이디/X-Key`를 선택하세요.

#### 5-3. 빌드 설정 확인하기

Import 후 표시되는 새 프로젝트 설정 화면에서 아래 항목을 확인합니다.

| 항목 | 설정 |
| --- | --- |
| Project Name | 원하는 이름. 예: `my-company-x-key` |
| Framework Preset | **Next.js** |
| Root Directory | 저장소 최상위 폴더. 기본값 유지, `src` 선택하지 않기 |
| Build Command | 기본값 유지. 직접 지정한다면 `npm run build` |
| Install Command | 기본값 유지 |
| Output Directory | 기본값 유지. `out`이나 `dist`를 별도로 입력하지 않기 |
| Node.js Version | 설정할 수 있다면 **22 이상** |

별도의 정적 HTML 프로젝트가 아니라 Next.js 프로젝트로 배포해야 서버 API가 함께 동작합니다.

#### 5-4. 환경변수 3개 먼저 넣기

같은 화면의 **Environment Variables**를 펼칩니다.
**Key / Name**에는 왼쪽 이름을, **Value**에는 준비한 실제 값을 입력합니다. 한 줄씩 추가하세요.

| Key / Name | Value에 넣을 것 |
| --- | --- |
| `SUPABASE_URL` | 내 Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 내 Supabase Secret key (`sb_secret_...`) |
| `VAULT_ENCRYPTION_KEY` | 4단계에서 생성한 64자리 암호화 키 |

- 값에 `SUPABASE_URL=` 같은 이름까지 붙이지 말고 **값만** 입력합니다.
- 예제의 `YOUR_...` 문자열을 그대로 넣지 않습니다.
- 대상 환경을 선택할 수 있다면 **Production**에 적용합니다. 운영 배포에 해당하는 환경입니다.
- Secret key와 암호화 키는 민감한 값으로 취급하세요. 별도 숨김·Secret 설정이 있으면 사용합니다.
- 이 단계에서는 발급될 웹 주소를 아직 모르므로 `APP_URL`은 다음 단계에서 추가합니다.

#### 5-5. 첫 배포 실행하고 주소 확인하기

1. 설정 화면 아래의 **Deploy**를 누릅니다.
2. 설치와 빌드가 끝날 때까지 기다립니다. 도중에 브라우저를 닫을 필요는 없습니다.
3. 완료 화면이나 프로젝트 **Overview → Production Deployment**에서 운영 도메인을 확인합니다.
4. **Visit**을 눌러 주소를 열거나 도메인을 복사합니다.

예를 들어 발급된 주소가 아래와 같다면:

```text
https://my-company-x-key.vercel.app
```

이것이 `APP_URL`에 넣을 값입니다. `vercel.com/내팀/프로젝트` 형태의 **Vercel 관리 화면 주소를 넣는 것이 아닙니다.**
Overview에 여러 URL이 보이면 운영 배포의 도메인을 사용하세요. 이후 공유할 주소와 동일해야 합니다.

> 첫 배포는 성공해도 웹 화면에 `APP_URL` 설정 오류가 나올 수 있습니다. 아직 마지막 환경변수를 넣지 않았기 때문입니다. 다음 단계까지 완료한 뒤 로그인하세요.

배포 상태가 **Error / Failed**라면 해당 배포의 **Build Logs**에서 실패한 항목을 확인합니다.
DB 설정 오류인지 빌드 오류인지 구분해 아래 문제 해결 표를 확인하세요.

#### 5-6. 실제 웹 주소를 APP_URL에 넣고 재배포하기

1. Vercel 대시보드에서 방금 만든 **X-Key 프로젝트**를 엽니다.
2. 프로젝트의 **Settings → Environment Variables**로 이동합니다. 팀 전체 설정이 아니라 해당 프로젝트 설정입니다.
3. **Add Environment Variable** 또는 **Add**를 누릅니다.
4. Key / Name에 `APP_URL`을 입력합니다.
5. Value에 방금 확인한 운영 주소를 넣습니다.
6. 대상 환경 **Production**을 선택하고 **Save**합니다.

```dotenv
APP_URL=https://my-company-x-key.vercel.app
```

7. 프로젝트 상단의 **Deployments**를 엽니다.
8. 운영 배포의 **… 메뉴 → Redeploy**를 누릅니다.
9. Production 배포인지 확인하고 재배포를 실행합니다.
10. 새 배포가 **Ready**가 되면 운영 주소를 다시 엽니다.

**환경변수 저장만으로 이미 실행 중인 배포가 바뀌지는 않습니다. 재배포까지 해야 합니다.**
이후 환경변수를 수정할 때도 같은 방식으로 재배포합니다.

최종적으로 Production 환경에 아래 **4개**가 있는지 확인하세요.

```text
APP_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
VAULT_ENCRYPTION_KEY
```

`APP_URL`에는 `/admin`, `localhost`, Supabase 주소를 넣지 않습니다.
도메인을 바꾸면 `APP_URL`도 새 주소로 수정하고 재배포하세요.
로컬 `.env.local` 수정과 Vercel 환경변수 수정은 서로 별개입니다.

GitHub 연결이 완료되어 있다면 이후 운영 브랜치에 푸시할 때 자동 배포됩니다.
Preview 배포도 사용할 경우 해당 환경의 URL·DB·암호화 키를 별도로 설정하세요. 이 가이드는 **Production 배포** 기준입니다.

[Vercel GitHub 연결 안내](https://vercel.com/docs/git) · [Vercel 환경변수 안내](https://vercel.com/docs/environment-variables) · [Next.js 배포 안내](https://vercel.com/docs/frameworks/full-stack/nextjs)

### 6. 최초 관리자 로그인

배포한 사이트의 `/admin`으로 접속합니다.

```text
https://your-x-key.vercel.app/admin
```

초기 계정은 아이디 `admin` / 비밀번호 `admin`입니다.
첫 로그인 후 관리자 설정 화면에서 다음 값을 입력합니다.

| 입력란 | 처음 설정할 때 |
| --- | --- |
| 관리자 아이디 | 앞으로 사용할 관리자 아이디 |
| 현재 비밀번호 | `admin` |
| 새 비밀번호 | 8~72자의 새 비밀번호 |

저장하면 계정 관리 화면으로 이동합니다. 관리자 계정은 1개만 운영하며, 이후 사이드바의 **관리자 계정 설정**에서 변경할 수 있습니다.

**링크를 구성원에게 배포하기 전에 초기 관리자 비밀번호부터 변경하세요.** 최초 접속자가 자동 지정되는 구조가 아니라, SQL 실행 시 초기 관리자 1개가 만들어지는 구조입니다.

![관리자 로그인 화면](docs/screenshots/admin-login.jpg)

## 설치 후 사용법

### 계정 등록과 2FA 표시

**계정 저장소 → 새 계정**에서 아래 정보를 입력합니다.

| 항목 | 입력 예시 |
| --- | --- |
| 분류 / 이름 | `SaaS 구독` / `Notion 팀 워크스페이스` |
| 접속 URL | `https://notion.so` |
| 아이디 / 계정 | 서비스 로그인에 사용하는 계정 |
| 값 종류 / 값 | 비밀번호 또는 API 키 |
| 메모 | 사용 목적, 담당자, 추가 인증 방법 등 |
| 2차 인증 사용 | 서비스 로그인 시 추가 인증이 필요하면 켜기 |
| 전체 구성원에게 공개 | 켜면 구성원 코드로 열람, 끄면 비공개 포함 코드로만 열람 |

분류는 직접 입력할 수 있습니다. 2차 인증을 켠 계정에는 이름 옆에 `2FA` 배지가 표시됩니다.
예를 들어 메모에 “담당자 휴대폰 문자 인증 필요”처럼 안내를 남길 수 있습니다.

![계정 편집과 2차 인증 토글](docs/screenshots/account-edit.jpg)

### 구성원에게 접근 코드 전달

1. 사이드바 **접근 코드 → 새 접근 코드**를 누릅니다.
2. 사용 목적과 열람 권한을 선택합니다.
3. 발급된 코드를 복사합니다. **원문은 발급 직후 한 번만 표시됩니다.**
4. 헤더의 **열람 링크 복사**로 사이트 주소를 복사합니다.
5. 해당 대상자에게 사이트 주소와 접근 코드를 전달합니다.

| 열람 권한 | 볼 수 있는 계정 |
| --- | --- |
| 전체 구성원 · 공개 계정만 | 공개로 설정한 계정 |
| 경영진 · 비공개 포함 | 공개·비공개 계정 전체 |

**코드의 유효기간은 발급 시점부터 7일**입니다. 만료되면 관리자가 새 코드를 발급해 전달합니다.
기존 코드의 유효기간을 연장하거나 원문을 다시 조회하는 기능은 없습니다.

![접근 코드 발급 창](docs/screenshots/code-create.jpg)

### 코드 사용 기록과 회수

접근 코드 목록에서 최근 인증 시각과 인증 횟수를 확인할 수 있습니다.
사용하지 않는 코드는 삭제해 회수하세요.

- 만료되거나 삭제된 코드로는 새로 인증할 수 없습니다.
- 이미 인증한 세션도 다음 서버 요청부터 차단됩니다.
- 화면은 주기적으로 갱신되지만, 이미 복사하거나 내려받은 정보까지 회수할 수는 없습니다.

![접근 코드 관리와 인증 기록](docs/screenshots/access-codes.jpg)

### 구성원이 계정 조회하기

구성원은 전달받은 사이트 주소에 접속해 코드를 입력합니다. 별도 회원가입은 없습니다.

![구성원 접근 코드 입력 화면](docs/screenshots/access-gate.jpg)

인증 후에는 분류나 검색으로 계정을 찾고, 보기·복사 버튼으로 필요한 값을 확인합니다.
**잠금** 버튼을 누르면 열람 세션이 종료됩니다.

![구성원 계정 목록](docs/screenshots/viewer.jpg)

### 계정이 많아지면 페이지로 나눠 보기

목록 하단에서 **이전·다음 또는 페이지 번호**로 이동합니다. 기본은 10개씩이며, 페이지당 20개·50개로 바꿀 수 있습니다.
검색어·분류·공개 여부를 바꾸면 첫 페이지로 돌아갑니다. 계정을 삭제해 마지막 페이지가 없어지면 남아 있는 마지막 페이지를 표시합니다.
하단의 “총 N개 중 A–B개 표시”로 현재 범위를 확인할 수 있습니다.

![계정 목록 페이지 이동](docs/screenshots/pagination.jpg)

### CSV로 내보내기

관리자·열람 화면의 **CSV 내보내기**는 현재 검색과 필터가 적용된 **전체 결과**를 저장합니다. 화면의 현재 페이지에 보이는 계정만 저장하는 것은 아닙니다.
구성원은 본인 코드로 열람 가능한 계정만 내보낼 수 있습니다.

- 파일명: `vaultkey-accounts-YYYYMMDD.csv` — 한국 날짜 기준
- 열 순서: 분류 → 이름 → 접속 URL → 아이디 → 비밀번호/API 키 → 값 종류 → 공개 여부 → 메모 → 수정일 → 2차 인증
- 엑셀 한글 인코딩, 쉼표·따옴표·줄바꿈 처리 포함

**CSV에는 비밀번호/API 키 원문도 포함됩니다.** 공유 범위를 확인하고 보관하세요.

### 사이드바와 모바일

사이드바 위쪽 **〈** 버튼으로 접으면 아이콘만 남아 목록을 넓게 볼 수 있습니다.
**〉** 버튼으로 다시 펼칠 수 있고, 접힘 상태는 브라우저에 저장됩니다.

![접힌 사이드바](docs/screenshots/sidebar-collapsed.jpg)

휴대폰에서는 상단 메뉴와 분류 선택, 계정 카드로 배치가 바뀝니다.

<p align="center">
  <img src="docs/screenshots/mobile.jpg" width="320" alt="모바일 계정 카드 화면" />
</p>

## 문제가 생겼을 때

| 증상 | 먼저 확인할 것 |
| --- | --- |
| 데이터를 불러오지 못함 | 환경변수 4개, SQL 001·002 실행 여부, Vercel 재배포 여부 |
| `Could not find the table/function` | Supabase SQL Editor에서 001을 실행했는지 확인 |
| `has_2fa` 컬럼 오류 | 002 마이그레이션 실행 여부 확인 |
| 허용되지 않은 요청 | 운영 `APP_URL`이 지금 접속한 주소와 같은지 확인. 변경 후 재배포 |
| 첫 관리자 설정의 비밀번호 불일치 | 현재 비밀번호에 `admin`을 직접 입력하고 보기 버튼으로 확인. 이미 변경했다면 변경한 비밀번호 사용 |
| 코드로 접속되지 않음 | 7일 만료, 삭제 여부, 코드 전체를 복사했는지 확인 |
| 코드를 잊어버림 | 원문 재조회 대신 새 코드를 발급해 전달 |
| 복사 버튼이 차단됨 | 표시되는 직접 복사 입력창에서 `⌘C` / `Ctrl+C` 사용. 운영은 HTTPS 주소 사용 |
| 배포 후에도 데모처럼 보임 | 로컬인지 운영인지 주소 확인. 개발 환경의 `X_KEY_DEMO=true` 여부 확인 |
| 기존 비밀값을 읽지 못함 | 데이터를 저장할 때 사용한 `VAULT_ENCRYPTION_KEY`와 현재 키가 같은지 확인 |

<details>
<summary><strong>내부망 주소로 개발 화면을 열고 싶어요</strong></summary>

`.env.local`에 본인의 개발 PC IP를 추가합니다. 아래 주소는 예시입니다.

```dotenv
DEV_ALLOWED_ORIGINS=192.168.0.29
```

호스트 이름만 넣고 `http://`와 포트는 제외합니다. 여러 호스트는 쉼표로 구분합니다.
저장 후 개발 서버를 재시작하세요. `APP_URL`을 로컬 주소로 설정했다면 함께 확인합니다.

</details>

<details>
<summary><strong>업데이트는 어떻게 적용하나요?</strong></summary>

1. 변경된 코드를 본인 저장소에 반영합니다. Fork 사용자는 GitHub의 **Sync fork**로 원본 업데이트를 가져올 수 있습니다.
2. 새 SQL 마이그레이션이 있다면 Supabase SQL Editor에서 **새 파일만 순서대로** 실행합니다.
3. 새 환경변수가 추가됐는지 `.env.example`을 확인합니다.
4. Vercel에서 새 버전을 배포하고 관리자·구성원 권한을 확인합니다.

기존 DB에 001을 반복 실행하지 마세요. 데이터는 Supabase에 보관되므로 웹만 재배포한다고 초기화되지는 않습니다.

</details>

## 개발과 검증

Next.js App Router · TypeScript · Supabase Postgres를 사용합니다.
Supabase Auth 회원가입 대신 단일 관리자와 공유 코드용 서버 세션을 사용합니다.

```bash
npm run dev      # 개발
npm run build    # 운영 빌드
npm start        # 운영 빌드 실행
npm test         # 기본 로직 테스트
```

데모 API 통합 테스트는 **새 데모 서버에만** 실행합니다. 관리자 비밀번호를 테스트용으로 변경하므로 실행 후 서버를 재시작하세요.

```bash
# 터미널 1: DB 환경변수가 없는 별도 체크아웃에서 실행
npm run dev -- --port 3100

# 터미널 2
XKEY_TEST_URL=http://localhost:3100 npm test
```

실제 배포 API 테스트 스크립트는 `scripts/verify-deployment.mjs`입니다.
임시 QA 계정·코드·세션을 만들고 정리하므로, 내용을 확인한 뒤 명시적으로 실행하세요.

```bash
XKEY_RUN_LIVE_TEST=true node --env-file=.env.local scripts/verify-deployment.mjs
```

<details>
<summary><strong>데이터 보호 방식과 운영 범위</strong></summary>

- 비밀번호/API 키는 AES-256-GCM으로 암호화해 저장합니다. 서버의 암호화 키로 복호화하므로 종단간 암호화 구조는 아닙니다.
- 접근 코드는 SHA-256 해시, 관리자 비밀번호는 bcrypt로 저장합니다.
- HttpOnly·SameSite 쿠키와 요청 Origin 검사를 사용합니다. 관리자 세션은 8시간, 열람 세션은 코드 만료 시점까지 서버에서 검증합니다.
- DB의 RLS를 켜고 `anon`·`authenticated` 직접 접근을 차단합니다. 서버는 Secret key로 권한을 확인한 뒤 데이터를 반환합니다.
- 로그인·코드 입력은 경로별 전역 버킷으로 15분당 10회 제한합니다. 사용자가 많으면 인원에 맞는 제한 방식이 필요합니다.
- 공유 코드 소지자는 해당 범위의 정보를 열람·복사할 수 있습니다. 구성원별 신원 확인이나 개인별 감사 로그는 제공하지 않습니다.
- 관리자 비밀번호를 잊었을 때 사용할 이메일 재설정 화면은 제공하지 않습니다.

</details>
