# 무료 소프트웨어 & 모델 목록

> Anime Maker 프로젝트에서 사용하는 100% 무료/오픈소스 소프트웨어 및 AI 모델

---

## 1. 개발 도구 (모두 무료)

| 소프트웨어 | 용도 | 다운로드 |
|-----------|------|----------|
| **Node.js 20 LTS** | JavaScript 런타임 | https://nodejs.org/ |
| **pnpm** | 패키지 매니저 | https://pnpm.io/ |
| **Python 3.10** | AI 엔진 런타임 | https://python.org/ |
| **Git** | 버전 관리 | https://git-scm.com/ |
| **VS Code** | 코드 에디터 | https://code.visualstudio.com/ |
| **CUDA Toolkit 11.8** | GPU 가속 | https://developer.nvidia.com/cuda-toolkit |
| **FFmpeg** | 영상 처리 | https://ffmpeg.org/ |

---

## 2. 프레임워크 & 라이브러리 (모두 MIT/Apache/무료)

### 2.1 프론트엔드

| 패키지 | 버전 | 라이선스 | 용도 |
|--------|------|----------|------|
| electron | 28+ | MIT | 데스크톱 앱 프레임워크 |
| react | 18.2+ | MIT | UI 라이브러리 |
| typescript | 5.3+ | Apache-2.0 | 타입 시스템 |
| vite | 5.0+ | MIT | 빌드 도구 |
| tailwindcss | 3.4+ | MIT | CSS 프레임워크 |
| @radix-ui/* | 1.0+ | MIT | 헤드리스 UI 컴포넌트 |
| zustand | 4.5+ | MIT | 상태 관리 |
| pixi.js | 8.0+ | MIT | 2D 렌더링 엔진 |
| wavesurfer.js | 7.0+ | BSD-3 | 오디오 파형 |
| lucide-react | 0.300+ | ISC | 아이콘 |
| framer-motion | 11+ | MIT | 애니메이션 |

### 2.2 백엔드/데스크톱

| 패키지 | 버전 | 라이선스 | 용도 |
|--------|------|----------|------|
| better-sqlite3 | 9+ | MIT | SQLite 바인딩 |
| electron-store | 8+ | MIT | 설정 저장 |
| electron-updater | 6+ | MIT | 자동 업데이트 |
| fluent-ffmpeg | 2.1+ | MIT | FFmpeg 래퍼 |
| ws | 8+ | MIT | WebSocket 클라이언트 |

### 2.3 Python/AI

| 패키지 | 버전 | 라이선스 | 용도 |
|--------|------|----------|------|
| torch | 2.1+ | BSD-3 | 딥러닝 프레임워크 |
| torchvision | 0.16+ | BSD-3 | 비전 모델 |
| transformers | 4.36+ | Apache-2.0 | 트랜스포머 모델 |
| diffusers | 0.25+ | Apache-2.0 | Diffusion 모델 |
| accelerate | 0.25+ | Apache-2.0 | GPU 가속 |
| safetensors | 0.4+ | Apache-2.0 | 모델 포맷 |
| opencv-python | 4.8+ | Apache-2.0 | 이미지 처리 |
| numpy | 1.26+ | BSD-3 | 수치 연산 |
| pillow | 10+ | HPND | 이미지 처리 |

---

## 3. AI 모델 (모두 무료/오픈소스)

### 3.1 이미지 생성 모델

#### Base Model
| 모델 | 크기 | 라이선스 | VRAM | 다운로드 |
|------|------|----------|------|----------|
| **SDXL 1.0** | 6.9GB | CreativeML Open RAIL++-M | 6GB+ | [HuggingFace](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0) |

#### Anime 체크포인트 (택 1)
| 모델 | 크기 | 라이선스 | 특징 | 다운로드 |
|------|------|----------|------|----------|
| **Animagine XL 3.1** | 6.9GB | Fair AI Public | 고품질, 일관성 | [HuggingFace](https://huggingface.co/cagliostrolab/animagine-xl-3.1) |
| **Anything V5** | 2.1GB | CreativeML Open RAIL-M | 경량, SD 1.5 | [Civitai](https://civitai.com/models/9409) |
| **Counterfeit V3** | 2.1GB | CreativeML Open RAIL-M | 다양한 스타일 | [HuggingFace](https://huggingface.co/gsdf/Counterfeit-V3.0) |
| **MeinaMix V11** | 2.1GB | CreativeML Open RAIL-M | 파스텔 스타일 | [Civitai](https://civitai.com/models/7240) |

### 3.2 비디오 생성 모델

| 모델 | 크기 | 라이선스 | VRAM | 다운로드 |
|------|------|----------|------|----------|
| **AnimateDiff v3** | 1.8GB | Apache-2.0 | 8GB+ | [HuggingFace](https://huggingface.co/guoyww/animatediff) |
| **AnimateDiff-Lightning** | 400MB | Apache-2.0 | 6GB+ | [HuggingFace](https://huggingface.co/ByteDance/AnimateDiff-Lightning) |
| **SVD (Stable Video)** | 9.5GB | Stability License | 8GB+ | [HuggingFace](https://huggingface.co/stabilityai/stable-video-diffusion-img2vid) |

### 3.3 립싱크 모델

| 모델 | 크기 | 라이선스 | VRAM | 다운로드 |
|------|------|----------|------|----------|
| **SadTalker** | 1.2GB | MIT | 4GB+ | [GitHub](https://github.com/OpenTalker/SadTalker) |
| **Wav2Lip** | 400MB | Custom (연구용) | 2GB+ | [GitHub](https://github.com/Rudrabha/Wav2Lip) |
| **MuseTalk** | 800MB | - | 4GB+ | [GitHub](https://github.com/TMElyralab/MuseTalk) |

### 3.4 음성 합성 모델 (Phase 2)

| 모델 | 크기 | 라이선스 | 언어 | 다운로드 |
|------|------|----------|------|----------|
| **VITS** | 200MB | MIT | 일/중/영 | [GitHub](https://github.com/jaywalnut310/vits) |
| **Coqui TTS** | 500MB | MPL-2.0 | 20+ 언어 | [GitHub](https://github.com/coqui-ai/TTS) |
| **Piper** | 50MB/voice | MIT | 다국어 | [GitHub](https://github.com/rhasspy/piper) |

### 3.5 LoRA/스타일 모델 (선택)

| 모델 | 크기 | 용도 | 다운로드 |
|------|------|------|----------|
| Anime Lineart | 150MB | 선화 스타일 | [Civitai](https://civitai.com/models/16997) |
| Ghibli Style | 150MB | 지브리풍 | [Civitai](https://civitai.com/models/6526) |
| Flat Color | 150MB | 플랫 채색 | [Civitai](https://civitai.com/models/35960) |

---

## 4. ComfyUI & 커스텀 노드 (모두 무료)

### 4.1 Core
| 패키지 | 라이선스 | 용도 | 다운로드 |
|--------|----------|------|----------|
| **ComfyUI** | GPL-3.0 | AI 워크플로우 엔진 | [GitHub](https://github.com/comfyanonymous/ComfyUI) |

### 4.2 필수 커스텀 노드
| 노드 | 라이선스 | 용도 | 다운로드 |
|------|----------|------|----------|
| ComfyUI-AnimateDiff-Evolved | Apache-2.0 | AnimateDiff 통합 | [GitHub](https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved) |
| ComfyUI-VideoHelperSuite | MIT | 비디오 입출력 | [GitHub](https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite) |
| ComfyUI-Manager | GPL-3.0 | 노드 관리 | [GitHub](https://github.com/ltdrdata/ComfyUI-Manager) |
| ComfyUI-Impact-Pack | GPL-3.0 | 유틸리티 | [GitHub](https://github.com/ltdrdata/ComfyUI-Impact-Pack) |

---

## 5. 총 필요 용량

### 최소 구성 (SD 1.5 기반)
```
개발 도구:        ~5GB
Node.js 패키지:   ~500MB
Python 패키지:    ~8GB (PyTorch 포함)
ComfyUI:         ~500MB
Anything V5:     ~2.1GB
AnimateDiff:     ~400MB (Lightning)
SadTalker:       ~1.2GB
-----------------------
총:              ~18GB
```

### 권장 구성 (SDXL 기반)
```
개발 도구:        ~5GB
Node.js 패키지:   ~500MB
Python 패키지:    ~8GB
ComfyUI:         ~500MB
Animagine XL:    ~6.9GB
AnimateDiff v3:  ~1.8GB
SadTalker:       ~1.2GB
추가 LoRA:       ~500MB
-----------------------
총:              ~25GB
```

---

## 6. 라이선스 요약

### 상업적 사용 가능
- MIT: React, Electron, Tailwind, PixiJS, Zustand 등 대부분
- Apache-2.0: TypeScript, Diffusers, AnimateDiff
- BSD-3: PyTorch, NumPy, WaveSurfer.js
- CreativeML Open RAIL-M: Anything V5, SD 1.5 기반 모델

### 조건부 사용
- GPL-3.0: ComfyUI (소스 공개 의무, 앱 내 통합 시 주의)
- Fair AI Public License: Animagine XL (연구/개인 무료, 상업용 조건)

### 연구/비상업용
- Wav2Lip: 연구 목적 무료, 상업용은 문의 필요

---

## 7. 모델 다운로드 스크립트

```bash
# ai-server/scripts/download_models.py 실행
cd ai-server
python scripts/download_models.py --config minimal  # 최소 구성
python scripts/download_models.py --config recommended  # 권장 구성
```

### 수동 다운로드 체크리스트

- [ ] Animagine XL 3.1 또는 Anything V5
- [ ] AnimateDiff-Lightning 또는 AnimateDiff v3
- [ ] SadTalker 체크포인트
- [ ] (선택) 스타일 LoRA 모델

---

*문서 버전: 1.0.0*
*최종 수정: 2025-01-30*
