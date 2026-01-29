# Google AI 어린이 스토리 생성기

## 🎉 구현 완료!

이 프로젝트는 두 가지 방식으로 어린이 동화를 생성할 수 있습니다:

### 1. 📚 사진 스토리북 (추천 - 토큰 절약)
어린이 동화책처럼 장면별 이미지와 나레이션으로 구성된 HTML 스토리북을 생성합니다.

### 2. 🎬 동영상 (Remotion 사용)
각 장면이 애니메이션되는 완전한 MP4 동영상을 생성합니다.

---

## 🚀 빠른 시작

### 1단계: 환경 설정 확인
```bash
npm run test-setup
```

### 2단계: 사진 스토리북 생성 (1분 테스트)
```bash
npm run photo -- -t "작은 곰의 모험" -d 1 -a 5
```

### 3단계: 브라우저에서 열기
생성 완료 후 출력되는 HTML 경로를 브라우저에서 열기:
```
file:///D:/Entertainments/DevEnvironment/make_movie/public/storybooks/작은-곰의-모험/index.html
```

---

## 📖 사용 방법

### 사진 스토리북 생성 (토큰 절약 방식)

#### 기본 사용법
```bash
npm run photo -- -t "제목" -d <분> -a <연령> --theme "주제"
```

#### 예시
```bash
# 1분짜리 테스트 (6장면)
npm run photo -- -t "작은 곰의 모험" -d 1 -a 5

# 10분짜리 완전한 스토리 (60장면)
npm run photo -- -t "숲속 친구들의 하루" -d 10 -a 5 --theme "우정과 협동"

# 교육용 콘텐츠
npm run photo -- -t "공룡의 하루" -d 5 -a 4 --theme "공룡 학습"
```

#### 생성된 파일
- `public/storybooks/<제목>/index.html` - 웹 뷰어 (브라우저에서 열기)
- `public/storybooks/<제목>/scene1.png` - 장면 이미지들
- `public/storybooks/<제목>/scene1.mp3` - 나레이션 오디오들
- `public/storybooks/<제목>/metadata.json` - 메타데이터 (동영상 변환용)

#### 스토리북 목록 보기
```bash
npm run photo-list
```

---

### 동영상 생성 (전통적 방식)

#### 기본 사용법
```bash
npm run create -- -t "제목" -d <분> -a <연령> --theme "주제"
```

#### 예시
```bash
# 1분짜리 테스트
npm run create -- -t "작은 곰의 모험" -d 1 -a 5

# 10분짜리 완전한 동영상
npm run create -- -t "숲속 친구들의 하루" -d 10 -a 5
```

#### 미리보기
```bash
npm run preview
```
브라우저에서 http://localhost:3000 열기

#### 렌더링
```bash
npm run render
```

---

## 🎨 이미지 생성 설정

### Hugging Face API 사용 (무료 - 추천)

1. **API 키 발급**: https://huggingface.co/settings/tokens
2. **.env 파일 수정**:
```env
HUGGING_FACE_API_KEY=hf_YourKeyHere
IMAGE_GENERATOR=huggingface
```

**결과**: 실제 어린이 동화책 스타일 일러스트레이션 (수채화)

### 플레이스홀더 사용 (API 키 없을 때)

API 키를 설정하지 않으면 자동으로 플레이스홀더(그라디언트 SVG) 생성

**결과**: 장면 번호와 설명이 있는 컬러풀한 그라디언트 이미지

---

## 📊 기능 비교

| 기능 | 사진 스토리북 | 동영상 |
|------|-------------|--------|
| **생성 시간 (10분)** | 7-10분 | 15-20분 |
| **비용** | $0.25 | $0.25 |
| **토큰 사용** | 적음 | 많음 |
| **미리보기** | 즉시 (HTML) | 렌더링 필요 |
| **수정** | 쉬움 | 재렌더링 필요 |
| **파일 크기** | 50-100 MB | 100-200 MB |
| **공유** | HTML 파일 | MP4 파일 |
| **재생 방법** | 브라우저 | 비디오 플레이어 |
| **장면별 재생** | 가능 | 불가능 |

---

## 💰 비용 (10분 콘텐츠 기준)

| 서비스 | 사용량 | 비용 |
|--------|--------|------|
| Gemini 1.5 Flash | 1회 스토리 생성 | $0.10-0.15 |
| Hugging Face FLUX.1 | 60개 이미지 | **$0** (무료) |
| Google Cloud TTS | 60개 음성 | $0.10-0.15 |
| **총 비용** | | **$0.25** |

---

## 📂 프로젝트 구조

```
make_movie/
├── .env                          # 환경 변수 (API 키)
├── package.json                  # 의존성 및 스크립트
├── README.md                     # 이 파일
├── SETUP_GUIDE.md               # 설치 가이드
├── PHOTO_STORYBOOK_GUIDE.md     # 사진 스토리북 상세 가이드
├── IMPLEMENTATION_SUMMARY.md    # 구현 상세 내역
├── test-setup.js                # 환경 검증 스크립트
│
├── src/
│   ├── automation/
│   │   ├── PhotoStoryGenerator.ts  # 사진 스토리북 생성기
│   │   ├── photo-cli.ts             # 사진 스토리북 CLI
│   │   ├── GoogleStoryGenerator.ts  # 동영상 생성기
│   │   └── cli.ts                   # 동영상 CLI
│   ├── index.ts                 # Remotion 진입점
│   └── ...
│
├── public/
│   ├── storybooks/              # 📚 생성된 스토리북들
│   │   └── <제목>/
│   │       ├── index.html       # HTML 뷰어
│   │       ├── metadata.json    # 메타데이터
│   │       ├── scene1.png       # 이미지들
│   │       └── scene1.mp3       # 오디오들
│   ├── images/                  # 🖼️ 동영상용 이미지
│   └── audio/                   # 🎙️ 동영상용 오디오
│
└── output/                      # 📤 렌더링된 동영상 (MP4)
```

---

## 🎯 사용 시나리오

### 시나리오 1: 빠른 프로토타입
```bash
# 1분짜리 사진 스토리북으로 빠르게 테스트
npm run photo -- -t "테스트 스토리" -d 1 -a 5

# 브라우저에서 확인 후 만족하면 10분짜리 생성
npm run photo -- -t "최종 스토리" -d 10 -a 5
```

### 시나리오 2: 시리즈물 제작
```bash
# 에피소드별로 생성
npm run photo -- -t "곰돌이 모험 1화" -d 5 -a 5
npm run photo -- -t "곰돌이 모험 2화" -d 5 -a 5
npm run photo -- -t "곰돌이 모험 3화" -d 5 -a 5

# 목록 확인
npm run photo-list
```

### 시나리오 3: 교육 콘텐츠
```bash
# 주제별 교육용 스토리
npm run photo -- -t "공룡의 세계" -d 7 -a 6 --theme "공룡 학습"
npm run photo -- -t "우주 여행" -d 7 -a 6 --theme "태양계 학습"
npm run photo -- -t "바다 탐험" -d 7 -a 6 --theme "해양 생물"
```

---

## 🎬 사진 스토리북 → 동영상 변환 (향후 기능)

현재 사진 스토리북만 생성되며, 동영상 변환 기능은 추후 추가 예정입니다.

### 계획된 기능
```bash
# metadata.json을 사용하여 동영상 생성
npm run video-from-photos -- --metadata public/storybooks/<제목>/metadata.json

# 특정 장면만 선택
npm run video-from-photos -- --storybook <제목> --scenes 1-10,20-30
```

**장점**: 이미 생성된 이미지와 오디오를 재사용하므로 **추가 비용 $0**

---

## 🛠️ 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run test-setup` | 환경 설정 확인 |
| `npm run photo -- <옵션>` | 사진 스토리북 생성 |
| `npm run photo-list` | 생성된 스토리북 목록 |
| `npm run create -- <옵션>` | 동영상 생성 |
| `npm run preview` | Remotion 미리보기 |
| `npm run render` | MP4 렌더링 |

---

## 📚 상세 문서

- **SETUP_GUIDE.md** - 설치 및 설정 가이드
- **PHOTO_STORYBOOK_GUIDE.md** - 사진 스토리북 상세 사용법
- **IMPLEMENTATION_SUMMARY.md** - 기술적 구현 내역
- **CLAUDE.md** - 프로젝트 개요

---

## 🐛 문제 해결

### 문제: API 키 에러
```bash
# 환경 확인
npm run test-setup

# .env 파일 확인
cat .env
```

### 문제: 이미지 안 생김
Hugging Face API 키를 설정하지 않으면 플레이스홀더가 생성됩니다.
실제 이미지를 원하면:
1. https://huggingface.co/settings/tokens 에서 API 키 발급
2. `.env` 파일에 `HUGGING_FACE_API_KEY=hf_...` 추가

### 문제: 나레이션 안 생김
Google Cloud TTS 서비스 계정 키 확인:
```bash
ls -la service-account.json
```

---

## 🎉 기여

- **Google AI** - Gemini 1.5 Flash (스토리 생성)
- **Google Cloud** - Text-to-Speech (나레이션)
- **Hugging Face** - FLUX.1 (이미지 생성)
- **Remotion** - 동영상 렌더링

---

## 📞 지원

문제가 있으면:
1. `npm run test-setup` 실행
2. SETUP_GUIDE.md 참조
3. PHOTO_STORYBOOK_GUIDE.md 참조

---

**즐거운 스토리 제작 되세요! 📚🎬✨**
