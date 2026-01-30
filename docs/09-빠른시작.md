# 🚀 빠른 시작 가이드

## 5분 안에 첫 동영상 만들기!

### 1단계: 파일 다운로드 (완료!)
✅ Google Drive에서 이 패키지를 다운로드했습니다

### 2단계: 압축 해제 및 설치

```bash
# 압축 해제
unzip google-story-video-package.zip
cd google-story-video

# 패키지 설치
npm install
```

### 3단계: API 키 설정

```bash
# .env 파일 생성
cp .env.example .env

# .env 파일을 텍스트 에디터로 열어서 수정
nano .env
```

다음 내용을 입력:
```
GOOGLE_AI_API_KEY=여기에_발급받은_API_키_입력
```

**API 키 발급 방법:**
1. https://aistudio.google.com/app/apikey 접속
2. "Create API Key" 클릭
3. 생성된 키를 복사해서 위에 붙여넣기

### 4단계: Google Cloud 설정 (TTS용)

```bash
# Google Cloud SDK 설치 확인
gcloud --version

# 없으면 설치
# Mac: brew install google-cloud-sdk
# Ubuntu: sudo apt-get install google-cloud-sdk

# 인증
gcloud auth application-default login

# Text-to-Speech API 활성화
gcloud services enable texttospeech.googleapis.com
```

### 5단계: 첫 동영상 생성!

```bash
# 테스트 실행 (5분 짜리 짧은 버전)
npm run create -- -t "나의 첫 동영상" -d 5

# 또는 10분 짜리
npm run create -- -t "용감한 토끼" -d 10 --theme "용기"
```

### 6단계: 결과 확인

```bash
# 생성된 파일 확인
ls -lh output/

# 미리보기 (선택사항)
npm run preview
```

---

## 🎯 자주 사용하는 명령어

### 기본 생성
```bash
npm run create -- -t "제목" -d 10
```

### 상세 옵션 지정
```bash
npm run create -- \
  --title "마법의 숲 모험" \
  --duration 10 \
  --age "5-7세" \
  --theme "우정과 용기"
```

### 여러 개 한 번에 생성
```bash
# stories.json 파일 수정 후
npm run batch -- -f stories.json
```

### 미리보기
```bash
npm run preview
```

---

## 📁 생성되는 파일 위치

```
프로젝트/
├── public/
│   ├── images/          # AI 생성 이미지
│   │   ├── scene1-background.png
│   │   ├── scene1-character-0.png
│   │   └── ...
│   └── audio/           # AI 생성 음성
│       ├── scene1-narration.mp3
│       └── ...
├── src/
│   ├── Story/           # 자동 생성 컴포넌트
│   │   ├── Scene1.tsx
│   │   ├── Scene2.tsx
│   │   └── ...
│   ├── StoryVideo.tsx   # 메인 비디오
│   └── Root.tsx         # Remotion 루트
└── output/              # ⭐ 최종 동영상!
    └── 제목.mp4
```

---

## 💡 팁

### 더 빠르게 렌더링하기
```bash
export NODE_OPTIONS="--max-old-space-size=8192"
npm run create -- -t "제목" -d 10
```

### 화질 조정
고화질 (느림):
```bash
npx remotion render src/index.ts StoryVideo output/video.mp4 --crf 18
```

일반 화질 (빠름):
```bash
npx remotion render src/index.ts StoryVideo output/video.mp4 --crf 28
```

### 병렬 처리 늘리기
```bash
npx remotion render src/index.ts StoryVideo output/video.mp4 --concurrency 8
```

---

## 🐛 문제 해결

### "API key not valid" 오류
```bash
# .env 파일 확인
cat .env

# API 키 재발급: https://aistudio.google.com/app/apikey
```

### "Permission denied" (TTS 오류)
```bash
gcloud auth application-default login
gcloud services enable texttospeech.googleapis.com
```

### 메모리 부족 오류
```bash
export NODE_OPTIONS="--max-old-space-size=8192"
```

---

## 📞 도움말

더 자세한 내용은 `00-설치가이드.md`를 참고하세요!

**이제 시작하세요! 🎉**

```bash
npm run create -- -t "나의 첫 동영상" -d 5
```
