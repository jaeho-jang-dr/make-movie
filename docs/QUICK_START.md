# Anime Maker - 빠른 시작 가이드

## 요구사항

### 하드웨어
- **GPU**: NVIDIA GTX 1660 (6GB) 이상 (RTX 3060 12GB 권장)
- **RAM**: 16GB 이상 (32GB 권장)
- **저장공간**: 30GB 이상 (SSD 권장)

### 소프트웨어
- Windows 10/11 64-bit
- Node.js 20 LTS
- Python 3.10
- Git
- CUDA Toolkit 11.8

---

## 1. 설치

### 자동 설치 (권장)
```powershell
# PowerShell 관리자 권한으로 실행
cd D:\Projects\make-movie
.\scripts\setup.ps1
```

### 수동 설치

```powershell
# 1. 필수 소프트웨어 설치
winget install OpenJS.NodeJS.LTS
winget install Python.Python.3.10
winget install Git.Git
winget install FFmpeg

# 2. pnpm 설치
npm install -g pnpm

# 3. 프로젝트 의존성 설치
cd D:\Projects\make-movie
pnpm install

# 4. Python 가상환경 설정
cd ai-server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
pip install transformers diffusers accelerate safetensors opencv-python

# 5. ComfyUI 설치
cd ~
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip install -r requirements.txt
```

---

## 2. AI 모델 다운로드

```powershell
cd D:\Projects\make-movie\ai-server

# 최소 구성 (약 18GB)
python scripts/download_models.py --config minimal

# 또는 권장 구성 (약 25GB)
python scripts/download_models.py --config recommended

# 모델 목록 확인
python scripts/download_models.py --list
```

### 최소 구성 모델
| 모델 | 용도 | 크기 |
|------|------|------|
| Anything V5 | 캐릭터 생성 | 2.1GB |
| AnimateDiff-Lightning | 영상 생성 | 400MB |
| SadTalker | 립싱크 | 1.2GB |

---

## 3. 실행

### 개발 모드

**터미널 1: ComfyUI 서버**
```powershell
cd ~/ComfyUI
python main.py --listen 127.0.0.1 --port 8188
```

**터미널 2: Electron 앱**
```powershell
cd D:\Projects\make-movie
pnpm dev
```

### 프로덕션 빌드
```powershell
pnpm build
pnpm package
```

---

## 4. 기본 사용법

### 4.1 프로젝트 생성
1. 앱 실행
2. File → New Project
3. 프로젝트 이름 입력
4. 해상도 선택 (1920x1080 권장)

### 4.2 캐릭터 생성
1. Character Studio 열기
2. 프롬프트 입력: `1girl, anime style, blue hair, school uniform`
3. 스타일 프리셋 선택
4. Generate 클릭
5. 마음에 드는 결과 저장

### 4.3 애니메이션 생성
1. 저장된 캐릭터 선택
2. Generate Animation 열기
3. 모션 타입 선택 (Talk, Nod, Idle)
4. 지속 시간 설정 (3초 권장)
5. Generate 클릭

### 4.4 립싱크 적용
1. 오디오 파일 업로드 (WAV/MP3)
2. 캐릭터 이미지 선택
3. Generate LipSync 클릭
4. 결과 확인 후 저장

### 4.5 타임라인 편집
1. 생성된 클립을 타임라인으로 드래그
2. 순서 조정
3. 전환 효과 추가 (선택)
4. 프리뷰로 확인

### 4.6 내보내기
1. File → Export
2. 포맷 선택 (MP4)
3. 해상도 확인
4. Export 클릭

---

## 5. 문제 해결

### GPU 메모리 부족
```
CUDA out of memory
```
**해결**:
- 더 낮은 해상도 사용 (512x512)
- 배치 크기 줄이기
- 다른 GPU 프로세스 종료

### ComfyUI 연결 실패
```
Cannot connect to ComfyUI server
```
**해결**:
1. ComfyUI가 실행 중인지 확인
2. 포트 8188이 사용 가능한지 확인
3. 방화벽 설정 확인

### 모델 로딩 실패
```
Model not found
```
**해결**:
```powershell
python scripts/download_models.py --list  # 모델 상태 확인
python scripts/download_models.py --config minimal --force  # 재다운로드
```

---

## 6. 단축키

| 단축키 | 기능 |
|--------|------|
| Ctrl+N | 새 프로젝트 |
| Ctrl+S | 저장 |
| Ctrl+Z | 실행 취소 |
| Ctrl+Y | 다시 실행 |
| Space | 재생/정지 |
| Delete | 선택 항목 삭제 |
| Ctrl+E | 내보내기 |

---

## 다음 단계

- [기술 설계 문서](./TECHNICAL_DESIGN.md)
- [무료 소프트웨어 목록](./FREE_SOFTWARE_LIST.md)
- [API 참조](./API_REFERENCE.md) (예정)
