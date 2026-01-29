# 사진 스토리북 생성기 가이드

## 🎨 개요

토큰 한계 때문에 긴 동영상 생성이 어려운 경우, **사진 기반 스토리북**을 먼저 만들고 나중에 동영상으로 변환할 수 있습니다.

### 장점
- ✅ **토큰 절약**: Remotion 컴포넌트 생성 없이 장면만 생성
- ✅ **빠른 미리보기**: 브라우저에서 즉시 확인 가능
- ✅ **유연성**: 나중에 원하는 장면만 동영상으로 변환
- ✅ **재사용**: 같은 이미지와 오디오를 동영상 제작에 재사용

---

## 🚀 빠른 시작

### 1. 1분짜리 테스트 스토리북 생성
```bash
npm run photo -- -t "작은 곰의 모험" -d 1 -a 5
```

### 2. 10분짜리 완전한 스토리북 생성
```bash
npm run photo -- -t "숲속 친구들의 하루" -d 10 -a 5 --theme "우정과 협동"
```

### 3. 생성된 스토리북 목록 보기
```bash
npm run photo-list
```

### 4. 브라우저에서 열어보기
생성 완료 후 출력되는 HTML 파일 경로를 브라우저에서 열기
```
file:///D:/Entertainments/DevEnvironment/make_movie/public/storybooks/작은-곰의-모험/index.html
```

---

## 📋 명령어 옵션

### 기본 사용법
```bash
npm run photo -- [옵션]
```

### 옵션 설명

| 옵션 | 필수 | 설명 | 기본값 | 예시 |
|------|------|------|--------|------|
| `-t, --title` | ✅ | 스토리 제목 | - | `-t "용감한 토끼"` |
| `-d, --duration` | ❌ | 길이 (분) | 10 | `-d 15` |
| `-a, --age` | ❌ | 대상 연령 | 5 | `-a 7` |
| `--theme` | ❌ | 주제/테마 | "모험과 우정" | `--theme "자연 보호"` |

### 예시 명령어

**짧은 스토리 (3분)**
```bash
npm run photo -- -t "달님 여행" -d 3 -a 4 --theme "상상력"
```

**긴 스토리 (15분)**
```bash
npm run photo -- -t "바다 탐험대" -d 15 -a 6 --theme "용기와 도전"
```

**유치원용 (3-4세)**
```bash
npm run photo -- -t "색깔 요정" -d 5 -a 3 --theme "색깔 학습"
```

**초등학생용 (7-8세)**
```bash
npm run photo -- -t "우주 탐험가" -d 10 -a 8 --theme "과학과 호기심"
```

---

## 📂 생성되는 파일 구조

```
public/
└── storybooks/
    └── 작은-곰의-모험/          # 스토리북 폴더
        ├── index.html           # 📄 HTML 뷰어 (브라우저에서 열기)
        ├── metadata.json        # 📝 메타데이터 (동영상 변환용)
        ├── scene1.png          # 🖼️ 장면 1 이미지
        ├── scene1.mp3          # 🎙️ 장면 1 나레이션
        ├── scene2.png          # 🖼️ 장면 2 이미지
        ├── scene2.mp3          # 🎙️ 장면 2 나레이션
        └── ...                 # (총 60개 장면 for 10분)
```

### 파일 설명

#### `index.html`
- 웹 기반 스토리북 뷰어
- 모든 장면을 카드 형태로 표시
- 각 장면마다 이미지 + 나레이션 텍스트 + 오디오 재생 버튼
- 전체 재생 기능 (자동으로 모든 장면 재생)

#### `metadata.json`
```json
{
  "title": "작은 곰의 모험",
  "duration": 10,
  "targetAge": "5",
  "theme": "모험과 우정",
  "generatedAt": "2026-01-29T...",
  "sceneCount": 60,
  "scenes": [
    {
      "sceneNumber": 1,
      "duration": 10,
      "narration": "옛날 아주 먼 옛날...",
      "backgroundDescription": "peaceful forest...",
      "characters": ["cute bear"],
      "actions": ["walking"]
    }
  ]
}
```

이 파일은 나중에 동영상 변환 시 사용됩니다.

---

## 🎬 HTML 뷰어 기능

### 화면 구성
1. **헤더**: 제목, 장면 수, 시간, 연령
2. **전체 컨트롤**: 전체 재생, 모두 정지, 메타데이터 다운로드
3. **장면 카드**: 각 장면마다
   - 장면 번호
   - 이미지 (PNG 또는 SVG)
   - 나레이션 텍스트
   - 오디오 재생/정지 버튼
4. **푸터**: 생성 정보

### 인터랙션
- **전체 재생 버튼**: 장면 1부터 순차적으로 자동 재생
- **모두 정지 버튼**: 모든 오디오 즉시 정지
- **개별 재생**: 각 장면마다 독립적으로 재생 가능
- **스페이스바**: 전체 재생/정지 토글
- **반응형**: 모바일에서도 잘 보임

### 다운로드 기능
- "스토리 다운로드" 버튼 클릭
- `metadata.json` 파일 다운로드
- 나중에 동영상 변환 시 사용

---

## 🎨 이미지 생성 방식

### Hugging Face API 사용 (추천)
```env
HUGGING_FACE_API_KEY=hf_YourKeyHere
```
- **모델**: FLUX.1-schnell
- **해상도**: 1024x768 (4:3 비율)
- **스타일**: 어린이 동화책 수채화
- **비용**: 무료 (속도 제한 있음)

### 플레이스홀더 (API 키 없을 때)
- SVG 그라디언트로 생성
- 장면 번호와 설명 포함
- 즉시 생성 (API 호출 없음)

---

## 📊 생성 시간 예상

### 1분 스토리북 (6장면)
- 스토리 생성: 5초
- 이미지 생성: 30-60초
- 나레이션 생성: 30초
- HTML 생성: 1초
- **총 시간: 약 2분**

### 10분 스토리북 (60장면)
- 스토리 생성: 10초
- 이미지 생성: 4-6분
- 나레이션 생성: 2-3분
- HTML 생성: 5초
- **총 시간: 약 7-10분**

---

## 💰 비용 계산

### 10분 스토리북 (60장면)

| 서비스 | 사용량 | 비용 |
|--------|--------|------|
| Gemini 1.5 Flash | 1회 스토리 생성 | $0.10 |
| Hugging Face FLUX.1 | 60개 이미지 | **$0** (무료) |
| Google Cloud TTS | 60개 음성 | $0.15 |
| **총 비용** | | **$0.25** |

### 동영상과 비교

| 항목 | 사진 스토리북 | 동영상 |
|------|--------------|--------|
| 생성 시간 | 7-10분 | 15-20분 |
| 비용 | $0.25 | $0.25 |
| 미리보기 | 즉시 (HTML) | 렌더링 필요 |
| 수정 | 쉬움 | 재렌더링 필요 |
| 공유 | HTML 파일 전송 | MP4 파일 전송 |

---

## 🔄 동영상 변환 (향후 기능)

현재는 사진 스토리북만 생성됩니다. 동영상 변환 기능은 추후 추가 예정입니다.

### 계획된 동영상 변환 방법

```bash
# 방법 1: metadata.json에서 동영상 생성
npm run video-from-photos -- --metadata public/storybooks/작은-곰의-모험/metadata.json

# 방법 2: 스토리북 폴더 지정
npm run video-from-photos -- --storybook 작은-곰의-모험

# 방법 3: 특정 장면만 선택
npm run video-from-photos -- --storybook 작은-곰의-모험 --scenes 1-10,20-30
```

### 동영상 변환 시 재사용
- 이미지 파일 (sceneX.png) → Remotion <Img> 태그
- 오디오 파일 (sceneX.mp3) → Remotion <Audio> 태그
- metadata.json → 장면 구성 정보
- 새로 생성하지 않고 기존 파일 재사용 → **비용 $0**

---

## 🐛 문제 해결

### 문제 1: Hugging Face API 에러
```
Error: 401 Unauthorized
```
**해결:**
```bash
# .env 파일 확인
cat .env | grep HUGGING_FACE

# API 키 재발급
# https://huggingface.co/settings/tokens
```

### 문제 2: TTS 에러
```
Error: Google Cloud TTS failed
```
**해결:**
```bash
# 서비스 계정 키 파일 확인
ls -la service-account.json

# 환경 변수 확인
echo $GOOGLE_APPLICATION_CREDENTIALS
```

### 문제 3: HTML에서 이미지 안 보임
```
404 Not Found: scene1.png
```
**해결:**
- 이미지가 PNG와 SVG 둘 다 없는 경우
- 생성 로그에서 이미지 생성 실패 확인
- 수동으로 재생성:
```bash
npm run photo -- -t "같은 제목" -d 10 -a 5
```

### 문제 4: 오디오 재생 안 됨
```
Audio element error
```
**해결:**
- MP3 파일 존재 확인
- 브라우저 콘솔 에러 확인
- Chrome/Edge에서 열기 (파이어폭스 호환성 이슈 가능)

---

## 💡 사용 팁

### 1. 테스트는 짧게
처음에는 1-2분짜리로 테스트하여 스타일과 품질 확인

```bash
npm run photo -- -t "테스트" -d 1 -a 5
```

### 2. 주제를 구체적으로
일반적인 주제보다 구체적인 주제가 더 좋은 스토리 생성
```bash
# 일반적 ❌
--theme "재미있는 이야기"

# 구체적 ✅
--theme "용기를 내어 친구를 도와주는 이야기"
```

### 3. 연령에 맞는 내용
- 3-4세: 단순한 플롯, 밝은 색상, 반복적 패턴
- 5-6세: 간단한 문제 해결, 우정 이야기
- 7-8세: 약간의 모험, 교훈적 내용

### 4. 스토리북 재생성
같은 제목으로 재생성하면 덮어쓰기 됨
```bash
# 첫 번째 생성
npm run photo -- -t "곰돌이" -d 5 -a 5

# 마음에 안 들면 다시 생성 (덮어쓰기)
npm run photo -- -t "곰돌이" -d 5 -a 5
```

### 5. 여러 버전 만들기
제목을 다르게 하면 여러 버전 보관 가능
```bash
npm run photo -- -t "곰돌이 v1" -d 5 -a 5
npm run photo -- -t "곰돌이 v2" -d 5 -a 5 --theme "다른 주제"
```

---

## 📱 모바일에서 보기

### 방법 1: 로컬 서버
```bash
# Python 3
cd public/storybooks/작은-곰의-모험
python -m http.server 8000

# 모바일에서 접속
# http://192.168.x.x:8000/index.html
```

### 방법 2: 파일 공유
- HTML 파일과 모든 PNG/MP3 파일을 압축
- Google Drive/Dropbox에 업로드
- 모바일에서 다운로드 후 압축 해제
- HTML 파일 열기

---

## 🎯 사용 사례

### 사례 1: 교육용 콘텐츠
```bash
npm run photo -- -t "공룡의 하루" -d 5 -a 4 --theme "공룡 학습"
npm run photo -- -t "우주 여행" -d 5 -a 6 --theme "태양계 학습"
```

### 사례 2: 잠자리 동화
```bash
npm run photo -- -t "별이 빛나는 밤" -d 3 -a 3 --theme "평화롭고 따뜻한"
npm run photo -- -t "달님과 친구들" -d 5 -a 4 --theme "잔잔한 이야기"
```

### 사례 3: 교훈적 이야기
```bash
npm run photo -- -t "정직한 토끼" -d 7 -a 5 --theme "정직의 가치"
npm run photo -- -t "함께 하는 힘" -d 7 -a 6 --theme "협동의 중요성"
```

---

## 📊 품질 최적화

### 이미지 품질
- Hugging Face API 사용 시 자동으로 고품질
- 플레이스홀더 사용 시 SVG (확대해도 깨끗함)

### 나레이션 품질
- Google Cloud Neural2 음성 사용
- 한국어 자연스러운 발음
- 어린이에게 적합한 높은 음높이 (pitch: 2.0)
- 조금 느린 속도 (speakingRate: 0.9)

### 스토리 품질
- Gemini 1.5 Flash 사용
- JSON 형식으로 구조화된 스토리
- 연령별 맞춤 난이도

---

## 🔜 향후 개발 계획

1. **동영상 변환 기능**
   - metadata.json → Remotion 컴포넌트
   - 기존 이미지/오디오 재사용
   - 장면 선택 기능

2. **배치 생성**
   - JSON 파일로 여러 스토리북 동시 생성
   - 시리즈물 제작

3. **스타일 커스터마이징**
   - 다양한 일러스트 스타일 선택
   - 색상 팔레트 지정
   - 캐릭터 일관성 유지

4. **웹 UI**
   - 브라우저에서 스토리북 생성
   - 실시간 미리보기
   - 장면 편집 기능

---

## 📞 지원

문제가 발생하면:
1. `npm run test-setup` 실행하여 환경 확인
2. SETUP_GUIDE.md 참조
3. 생성 로그 확인

---

**즐거운 스토리북 제작 되세요! 📚✨**
