# Anime Maker - 기술 설계 문서

> 일본식 애니메이션 메이킹 데스크톱 앱
> 버전: 1.0.0 | 작성일: 2025-01-30

---

## 1. 시스템 개요

### 1.1 프로젝트 목표
일반 크리에이터가 코딩 지식 없이 일본식 애니메이션 영상을 제작할 수 있는 Windows 데스크톱 앱

### 1.2 핵심 원칙
- **100% 무료/오픈소스**: 모든 소프트웨어, 모델, 라이브러리는 무료
- **로컬 우선**: 사용자 PC의 GPU를 활용한 AI 처리
- **사용자 친화적**: 전문 지식 없이도 사용 가능한 UI

### 1.3 시스템 요구사항

| 구분 | 최소 | 권장 |
|------|------|------|
| OS | Windows 10 64-bit | Windows 11 64-bit |
| CPU | Intel i5 8th / Ryzen 5 3600 | Intel i7 10th / Ryzen 7 5800 |
| RAM | 16GB | 32GB |
| GPU | NVIDIA GTX 1660 (6GB) | NVIDIA RTX 3060 (12GB) |
| Storage | 30GB SSD | 100GB NVMe SSD |
| VRAM | 6GB | 12GB+ |

---

## 2. 아키텍처

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     Anime Maker Desktop App                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Presentation Layer                        │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │ │
│  │  │ Project  │ │Character │ │ Timeline │ │    Export    │   │ │
│  │  │ Manager  │ │ Studio   │ │  Editor  │ │    Panel     │   │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │ │
│  │                    React + TypeScript                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│                         IPC Bridge                                │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Application Layer                         │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │ │
│  │  │ Project  │ │   AI     │ │  Media   │ │   Export     │   │ │
│  │  │ Service  │ │ Service  │ │ Service  │ │   Service    │   │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │ │
│  │                    Electron Main Process                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    AI Engine Layer                           │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │                    ComfyUI Server                       │ │ │
│  │  │  ┌─────────┐ ┌───────────┐ ┌─────────┐ ┌───────────┐  │ │ │
│  │  │  │ SD XL   │ │AnimateDiff│ │SadTalker│ │   VITS    │  │ │ │
│  │  │  │ Anime   │ │  Motion   │ │ LipSync │ │   TTS     │  │ │ │
│  │  │  └─────────┘ └───────────┘ └─────────┘ └───────────┘  │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                    Python + PyTorch                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Data Layer                                │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │ │
│  │  │  SQLite  │ │  Local   │ │  Model   │ │    Temp      │   │ │
│  │  │    DB    │ │  Files   │ │  Cache   │ │   Storage    │   │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 컴포넌트 상세

#### 2.2.1 Presentation Layer (Renderer Process)
```yaml
Framework: React 18 + TypeScript
State Management: Zustand
UI Components:
  - Tailwind CSS (스타일링)
  - Radix UI (헤드리스 컴포넌트)
  - Lucide Icons (아이콘)
Rendering:
  - PixiJS v8 (캔버스 렌더링/프리뷰)
  - React-Konva (타임라인 시각화)
Audio:
  - WaveSurfer.js (파형 표시)
  - Tone.js (오디오 처리)
```

#### 2.2.2 Application Layer (Main Process)
```yaml
Framework: Electron 28+
IPC: contextBridge + ipcMain/ipcRenderer
Services:
  - ProjectService: 프로젝트 CRUD, 자동저장
  - AIService: ComfyUI API 래퍼
  - MediaService: FFmpeg 미디어 처리
  - ExportService: 최종 영상 렌더링
```

#### 2.2.3 AI Engine Layer
```yaml
Core: ComfyUI (로컬 서버)
Python: 3.10+
CUDA: 11.8+ (NVIDIA GPU)

Models:
  - Image Generation: Stable Diffusion XL + Anime 체크포인트
  - Video Generation: AnimateDiff + SVD
  - LipSync: SadTalker / Wav2Lip
  - TTS: VITS / Coqui TTS (Phase 2)
```

#### 2.2.4 Data Layer
```yaml
Database: SQLite (better-sqlite3)
File Storage:
  - Projects: ~/AnimeMaker/projects/
  - Models: ~/AnimeMaker/models/
  - Cache: ~/AnimeMaker/cache/
  - Exports: ~/AnimeMaker/exports/
```

---

## 3. 기술 스택 상세

### 3.1 프론트엔드 (100% 무료)

| 카테고리 | 라이브러리 | 버전 | 라이선스 | 용도 |
|----------|-----------|------|----------|------|
| Framework | Electron | 28+ | MIT | 데스크톱 앱 |
| UI Framework | React | 18.2+ | MIT | UI 렌더링 |
| Language | TypeScript | 5.3+ | Apache-2.0 | 타입 안전성 |
| Styling | Tailwind CSS | 3.4+ | MIT | 스타일링 |
| Components | Radix UI | 1.0+ | MIT | 헤드리스 UI |
| State | Zustand | 4.5+ | MIT | 상태관리 |
| Canvas | PixiJS | 8.0+ | MIT | 2D 렌더링 |
| Audio | WaveSurfer.js | 7.0+ | BSD-3 | 파형 시각화 |
| Icons | Lucide React | 0.300+ | ISC | 아이콘 |
| Build | Vite | 5.0+ | MIT | 번들링 |

### 3.2 백엔드/AI (100% 무료/오픈소스)

| 카테고리 | 소프트웨어 | 라이선스 | 용도 |
|----------|-----------|----------|------|
| AI Orchestrator | ComfyUI | GPL-3.0 | AI 워크플로우 |
| Runtime | Python | PSF | AI 엔진 |
| ML Framework | PyTorch | BSD-3 | 딥러닝 |
| Video Processing | FFmpeg | LGPL/GPL | 영상 처리 |

### 3.3 AI 모델 (100% 무료/오픈소스)

| 용도 | 모델 | 라이선스 | VRAM | 비고 |
|------|------|----------|------|------|
| Base Model | SDXL 1.0 | CreativeML Open RAIL++-M | 6GB+ | 기본 모델 |
| Anime Style | Animagine XL 3.1 | Fair AI Public License | 6GB+ | 애니메이션 특화 |
| Anime Style | Anything V5 | CreativeML Open RAIL-M | 4GB+ | 경량 대안 |
| Video Gen | AnimateDiff | Apache-2.0 | 8GB+ | 이미지→비디오 |
| Video Gen | SVD (Stable Video) | Stability AI License | 8GB+ | 대안 |
| LipSync | SadTalker | MIT | 4GB+ | 립싱크 |
| LipSync | Wav2Lip | - | 2GB+ | 경량 대안 |
| TTS | VITS | MIT | 2GB | 음성 합성 |
| TTS | Coqui TTS | MPL-2.0 | 2GB | 다국어 지원 |

---

## 4. 데이터 모델

### 4.1 ERD (Entity Relationship Diagram)

```
┌─────────────────┐       ┌─────────────────┐
│     Project     │       │    Character    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │
│ name            │  │    │ project_id (FK) │──┐
│ description     │  │    │ name            │  │
│ created_at      │  │    │ prompt          │  │
│ updated_at      │  │    │ style_preset    │  │
│ settings (JSON) │  │    │ base_image_path │  │
│ thumbnail_path  │  │    │ lora_path       │  │
└─────────────────┘  │    │ created_at      │  │
         │           │    └─────────────────┘  │
         │           └────────────────┐        │
         │                            │        │
┌─────────────────┐       ┌───────────┴───────┴─┐
│      Scene      │       │     Asset           │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │       │ id (PK)             │
│ project_id (FK) │───────│ project_id (FK)     │
│ order_index     │       │ character_id (FK)   │
│ duration_ms     │       │ type (enum)         │
│ script_text     │       │ file_path           │
│ background_id   │       │ metadata (JSON)     │
│ audio_path      │       │ created_at          │
│ created_at      │       └─────────────────────┘
└─────────────────┘
         │
         │
┌────────┴────────┐
│   SceneLayer    │
├─────────────────┤
│ id (PK)         │
│ scene_id (FK)   │
│ asset_id (FK)   │
│ layer_order     │
│ position_x      │
│ position_y      │
│ scale           │
│ rotation        │
│ animation (JSON)│
│ start_time_ms   │
│ end_time_ms     │
└─────────────────┘
```

### 4.2 TypeScript 인터페이스

```typescript
// types/project.ts
interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  settings: ProjectSettings;
  thumbnailPath?: string;
}

interface ProjectSettings {
  resolution: { width: number; height: number };
  frameRate: 24 | 30 | 60;
  outputFormat: 'mp4' | 'webm';
  defaultStyle: StylePreset;
}

// types/character.ts
interface Character {
  id: string;
  projectId: string;
  name: string;
  prompt: string;
  negativePrompt?: string;
  stylePreset: StylePreset;
  baseImagePath: string;
  loraPath?: string;
  expressions: Expression[];
  createdAt: Date;
}

interface Expression {
  name: string; // 'neutral', 'happy', 'sad', 'angry', 'surprised'
  imagePath: string;
}

type StylePreset =
  | 'shoujo'      // 소녀만화
  | 'shounen'     // 소년만화
  | 'ghibli'      // 지브리풍
  | 'moe'         // 모에
  | 'realistic'   // 리얼리스틱
  | 'chibi'       // 치비
  | 'custom';

// types/scene.ts
interface Scene {
  id: string;
  projectId: string;
  orderIndex: number;
  durationMs: number;
  scriptText?: string;
  backgroundId?: string;
  audioPath?: string;
  layers: SceneLayer[];
  createdAt: Date;
}

interface SceneLayer {
  id: string;
  sceneId: string;
  assetId: string;
  layerOrder: number;
  transform: Transform;
  animation?: Animation;
  startTimeMs: number;
  endTimeMs: number;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

// types/asset.ts
interface Asset {
  id: string;
  projectId: string;
  characterId?: string;
  type: AssetType;
  filePath: string;
  metadata: AssetMetadata;
  createdAt: Date;
}

type AssetType =
  | 'character_image'
  | 'background_image'
  | 'video_clip'
  | 'audio'
  | 'lipsync_video';

interface AssetMetadata {
  width?: number;
  height?: number;
  duration?: number;
  prompt?: string;
  model?: string;
}
```

---

## 5. API 설계

### 5.1 Electron IPC API

```typescript
// Main Process Handlers
interface ElectronAPI {
  // Project
  'project:create': (data: CreateProjectDTO) => Promise<Project>;
  'project:load': (id: string) => Promise<Project>;
  'project:save': (project: Project) => Promise<void>;
  'project:list': () => Promise<ProjectSummary[]>;
  'project:delete': (id: string) => Promise<void>;

  // Character
  'character:generate': (params: GenerateCharacterParams) => Promise<Character>;
  'character:update': (id: string, data: Partial<Character>) => Promise<Character>;
  'character:delete': (id: string) => Promise<void>;

  // AI Generation
  'ai:generateImage': (params: ImageGenParams) => Promise<string>; // returns file path
  'ai:generateVideo': (params: VideoGenParams) => Promise<string>;
  'ai:generateLipSync': (params: LipSyncParams) => Promise<string>;
  'ai:getProgress': () => Promise<GenerationProgress>;
  'ai:cancel': () => Promise<void>;

  // Export
  'export:render': (projectId: string, options: ExportOptions) => Promise<string>;
  'export:getProgress': () => Promise<ExportProgress>;

  // System
  'system:checkGPU': () => Promise<GPUInfo>;
  'system:checkModels': () => Promise<ModelStatus[]>;
  'system:downloadModel': (modelId: string) => Promise<void>;
}

// DTOs
interface GenerateCharacterParams {
  prompt: string;
  negativePrompt?: string;
  stylePreset: StylePreset;
  seed?: number;
  steps?: number;
  cfgScale?: number;
}

interface ImageGenParams {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  model: string;
  seed?: number;
}

interface VideoGenParams {
  inputImagePath: string;
  motionType: 'talk' | 'nod' | 'idle' | 'custom';
  durationSec: number;
  fps: number;
}

interface LipSyncParams {
  characterImagePath: string;
  audioPath: string;
  enhanceFace?: boolean;
}
```

### 5.2 ComfyUI Workflow API

```typescript
// ComfyUI API Wrapper
interface ComfyUIClient {
  // Connection
  connect(): Promise<void>;
  disconnect(): void;
  isConnected(): boolean;

  // Workflow Execution
  executeWorkflow(workflow: ComfyWorkflow): Promise<string>; // queue id
  getProgress(queueId: string): Promise<WorkflowProgress>;
  cancelExecution(queueId: string): Promise<void>;

  // Results
  getOutputImages(queueId: string): Promise<string[]>;
  getOutputVideos(queueId: string): Promise<string[]>;

  // Model Management
  listModels(type: 'checkpoint' | 'lora' | 'vae'): Promise<ModelInfo[]>;
  loadModel(modelPath: string): Promise<void>;
}

interface ComfyWorkflow {
  nodes: Record<string, WorkflowNode>;
  connections: WorkflowConnection[];
}

interface WorkflowProgress {
  status: 'queued' | 'running' | 'completed' | 'error';
  currentNode?: string;
  progress: number; // 0-100
  eta?: number; // seconds
  error?: string;
}
```

---

## 6. UI/UX 설계

### 6.1 화면 구성

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] Anime Maker          [Project: My Anime]    [_][□][X]       │
├─────────────────────────────────────────────────────────────────────┤
│  [File] [Edit] [Generate] [Export] [Settings] [Help]                │
├────────┬────────────────────────────────────────────────────────────┤
│        │                                                             │
│  P     │                                                             │
│  r     │                    Preview Canvas                           │
│  o     │                    (PixiJS)                                 │
│  j     │                                                             │
│  e     │                    1920 x 1080                              │
│  c     │                                                             │
│  t     │                                                             │
│        ├─────────────────────────────────────────────────────────────│
│  P     │  [Character] [Background] [Audio] [Effects]                 │
│  a     ├─────────────────────────────────────────────────────────────│
│  n     │                                                             │
│  e     │  Assets Library                                             │
│  l     │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                  │
│        │  │ Ch1 │ │ Ch2 │ │ BG1 │ │ BG2 │ │ ... │                  │
│  200px │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                  │
│        │                                                             │
├────────┴─────────────────────────────────────────────────────────────┤
│  Timeline                                                 [▶][⏸][⏹] │
│  ├──────────────────────────────────────────────────────────────────│
│  │ Scene 1     │ Scene 2     │ Scene 3     │ Scene 4     │         │
│  │ [Ch1][BG1]  │ [Ch1][BG2]  │ [Ch2][BG2]  │ [Ch1][BG3]  │         │
│  ├──────────────────────────────────────────────────────────────────│
│  │ Audio ~~~~▓▓▓▓▓~~~~▓▓▓▓~~~~▓▓▓▓▓▓~~~~▓▓▓▓~~~~                   │
│  ├──────────────────────────────────────────────────────────────────│
│  │ 00:00    00:05    00:10    00:15    00:20    00:25    00:30     │
│  └──────────────────────────────────────────────────────────────────│
├──────────────────────────────────────────────────────────────────────│
│  [Ready] | GPU: RTX 3060 | VRAM: 8.2/12GB | Project saved          │
└──────────────────────────────────────────────────────────────────────┘
```

### 6.2 주요 패널 상세

#### 6.2.1 Character Studio
```
┌─────────────────────────────────────────────────────────┐
│  Character Studio                              [×]      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌───────────────┐  Prompt:                             │
│  │               │  ┌────────────────────────────────┐  │
│  │   Preview     │  │ 1girl, anime style, blue hair, │  │
│  │   256x256     │  │ school uniform, smile          │  │
│  │               │  └────────────────────────────────┘  │
│  └───────────────┘                                      │
│                     Style: [Shoujo      ▼]              │
│  [Generate]         Steps: [20    ] CFG: [7.0  ]        │
│                     Seed:  [Random ▼] [-1     ]         │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│  Expressions:                                            │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │Neut │ │Happy│ │ Sad │ │Angry│ │Surp │ │ +   │      │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘      │
│                                                          │
│  [Save Character] [Generate Expressions] [Cancel]       │
└─────────────────────────────────────────────────────────┘
```

#### 6.2.2 Video Generation Panel
```
┌─────────────────────────────────────────────────────────┐
│  Generate Animation                            [×]      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Source: [Character: Sakura ▼]                          │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │              [Source Image Preview]                │  │
│  │                    512x512                         │  │
│  │                                                    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  Motion Type:                                            │
│  ○ Talking    ○ Nodding    ○ Idle    ○ Custom          │
│                                                          │
│  Duration: [3.0] seconds    FPS: [24 ▼]                 │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│  Progress: ████████████░░░░░░░░ 60%                     │
│  Status: Generating frames... (15/25)                   │
│  ETA: ~30 seconds                                        │
│                                                          │
│  [Generate] [Preview] [Cancel]                          │
└─────────────────────────────────────────────────────────┘
```

### 6.3 사용자 흐름 (User Flow)

```
[앱 시작]
    │
    ▼
[프로젝트 선택/생성]
    │
    ├─────────────────────────────────────┐
    ▼                                     │
[캐릭터 생성]                        [배경 생성]
    │                                     │
    │  1. 프롬프트 입력                  │
    │  2. 스타일 선택                    │
    │  3. 생성 & 저장                    │
    │                                     │
    ├─────────────────────────────────────┘
    ▼
[씬 구성]
    │
    │  1. 씬 추가
    │  2. 캐릭터/배경 배치
    │  3. 대사 입력 (선택)
    │
    ▼
[애니메이션 생성]
    │
    │  1. 캐릭터 선택
    │  2. 모션 타입 선택
    │  3. 영상 클립 생성
    │
    ▼
[립싱크 적용] (선택)
    │
    │  1. 오디오 업로드
    │  2. 립싱크 생성
    │
    ▼
[타임라인 편집]
    │
    │  1. 씬 순서 조정
    │  2. 전환 효과 추가
    │  3. 오디오 배치
    │
    ▼
[내보내기]
    │
    │  1. 해상도/포맷 선택
    │  2. MP4 렌더링
    │
    ▼
[완료]
```

---

## 7. ComfyUI 워크플로우

### 7.1 캐릭터 이미지 생성 워크플로우

```json
{
  "name": "anime_character_generation",
  "nodes": {
    "load_checkpoint": {
      "class_type": "CheckpointLoaderSimple",
      "inputs": {
        "ckpt_name": "animagine-xl-3.1.safetensors"
      }
    },
    "clip_text_positive": {
      "class_type": "CLIPTextEncode",
      "inputs": {
        "text": "{{positive_prompt}}, masterpiece, best quality, anime style",
        "clip": ["load_checkpoint", 1]
      }
    },
    "clip_text_negative": {
      "class_type": "CLIPTextEncode",
      "inputs": {
        "text": "{{negative_prompt}}, lowres, bad anatomy, bad hands, worst quality",
        "clip": ["load_checkpoint", 1]
      }
    },
    "empty_latent": {
      "class_type": "EmptyLatentImage",
      "inputs": {
        "width": "{{width}}",
        "height": "{{height}}",
        "batch_size": 1
      }
    },
    "ksampler": {
      "class_type": "KSampler",
      "inputs": {
        "model": ["load_checkpoint", 0],
        "positive": ["clip_text_positive", 0],
        "negative": ["clip_text_negative", 0],
        "latent_image": ["empty_latent", 0],
        "seed": "{{seed}}",
        "steps": "{{steps}}",
        "cfg": "{{cfg_scale}}",
        "sampler_name": "euler_ancestral",
        "scheduler": "normal",
        "denoise": 1.0
      }
    },
    "vae_decode": {
      "class_type": "VAEDecode",
      "inputs": {
        "samples": ["ksampler", 0],
        "vae": ["load_checkpoint", 2]
      }
    },
    "save_image": {
      "class_type": "SaveImage",
      "inputs": {
        "images": ["vae_decode", 0],
        "filename_prefix": "character"
      }
    }
  }
}
```

### 7.2 AnimateDiff 비디오 생성 워크플로우

```json
{
  "name": "animatediff_video_generation",
  "nodes": {
    "load_checkpoint": {
      "class_type": "CheckpointLoaderSimple",
      "inputs": {
        "ckpt_name": "animagine-xl-3.1.safetensors"
      }
    },
    "load_motion_module": {
      "class_type": "ADE_LoadAnimateDiffModel",
      "inputs": {
        "model_name": "mm_sd_v15_v2.ckpt"
      }
    },
    "apply_motion": {
      "class_type": "ADE_ApplyAnimateDiffModel",
      "inputs": {
        "motion_model": ["load_motion_module", 0],
        "model": ["load_checkpoint", 0]
      }
    },
    "load_image": {
      "class_type": "LoadImage",
      "inputs": {
        "image": "{{input_image_path}}"
      }
    },
    "encode_image": {
      "class_type": "VAEEncode",
      "inputs": {
        "pixels": ["load_image", 0],
        "vae": ["load_checkpoint", 2]
      }
    },
    "ksampler": {
      "class_type": "KSampler",
      "inputs": {
        "model": ["apply_motion", 0],
        "positive": ["clip_text_positive", 0],
        "negative": ["clip_text_negative", 0],
        "latent_image": ["encode_image", 0],
        "seed": "{{seed}}",
        "steps": 20,
        "cfg": 7.0,
        "sampler_name": "euler_ancestral",
        "scheduler": "normal",
        "denoise": 0.6
      }
    },
    "vae_decode": {
      "class_type": "VAEDecode",
      "inputs": {
        "samples": ["ksampler", 0],
        "vae": ["load_checkpoint", 2]
      }
    },
    "video_combine": {
      "class_type": "VHS_VideoCombine",
      "inputs": {
        "images": ["vae_decode", 0],
        "frame_rate": "{{fps}}",
        "filename_prefix": "animation"
      }
    }
  }
}
```

---

## 8. 프로젝트 구조

```
make-movie/
├── apps/
│   └── desktop/                    # Electron 앱
│       ├── src/
│       │   ├── main/               # Main Process
│       │   │   ├── index.ts        # Entry point
│       │   │   ├── ipc/            # IPC handlers
│       │   │   │   ├── project.ts
│       │   │   │   ├── character.ts
│       │   │   │   ├── ai.ts
│       │   │   │   └── export.ts
│       │   │   ├── services/       # Business logic
│       │   │   │   ├── ProjectService.ts
│       │   │   │   ├── AIService.ts
│       │   │   │   ├── ComfyUIClient.ts
│       │   │   │   └── ExportService.ts
│       │   │   └── utils/
│       │   │       ├── ffmpeg.ts
│       │   │       └── paths.ts
│       │   │
│       │   ├── renderer/           # Renderer Process (React)
│       │   │   ├── App.tsx
│       │   │   ├── components/
│       │   │   │   ├── layout/
│       │   │   │   │   ├── Header.tsx
│       │   │   │   │   ├── Sidebar.tsx
│       │   │   │   │   └── StatusBar.tsx
│       │   │   │   ├── canvas/
│       │   │   │   │   ├── PreviewCanvas.tsx
│       │   │   │   │   └── PixiRenderer.ts
│       │   │   │   ├── timeline/
│       │   │   │   │   ├── Timeline.tsx
│       │   │   │   │   ├── Track.tsx
│       │   │   │   │   └── Clip.tsx
│       │   │   │   ├── panels/
│       │   │   │   │   ├── CharacterStudio.tsx
│       │   │   │   │   ├── BackgroundGenerator.tsx
│       │   │   │   │   ├── VideoGenerator.tsx
│       │   │   │   │   └── LipSyncPanel.tsx
│       │   │   │   └── common/
│       │   │   │       ├── Button.tsx
│       │   │   │       ├── Input.tsx
│       │   │   │       └── Modal.tsx
│       │   │   ├── hooks/
│       │   │   │   ├── useProject.ts
│       │   │   │   ├── useAI.ts
│       │   │   │   └── useTimeline.ts
│       │   │   ├── stores/
│       │   │   │   ├── projectStore.ts
│       │   │   │   ├── uiStore.ts
│       │   │   │   └── aiStore.ts
│       │   │   ├── styles/
│       │   │   │   └── globals.css
│       │   │   └── types/
│       │   │       └── index.ts
│       │   │
│       │   └── preload/            # Preload scripts
│       │       └── index.ts
│       │
│       ├── electron-builder.json
│       ├── package.json
│       ├── tsconfig.json
│       ├── tailwind.config.js
│       └── vite.config.ts
│
├── packages/
│   └── shared/                     # 공유 코드
│       ├── types/
│       │   ├── project.ts
│       │   ├── character.ts
│       │   ├── scene.ts
│       │   └── asset.ts
│       └── utils/
│           └── validators.ts
│
├── ai-server/                      # ComfyUI 관련
│   ├── workflows/                  # 워크플로우 JSON
│   │   ├── character_generation.json
│   │   ├── animatediff_video.json
│   │   ├── sadtalker_lipsync.json
│   │   └── background_generation.json
│   ├── scripts/
│   │   ├── setup_comfyui.py
│   │   └── download_models.py
│   └── README.md
│
├── resources/
│   ├── presets/                    # 스타일 프리셋
│   │   ├── shoujo.json
│   │   ├── shounen.json
│   │   └── ghibli.json
│   └── templates/                  # 프로젝트 템플릿
│
├── docs/
│   ├── TECHNICAL_DESIGN.md         # 이 문서
│   ├── API_REFERENCE.md
│   └── USER_GUIDE.md
│
├── scripts/
│   ├── setup.ps1                   # Windows 설치 스크립트
│   └── dev.ps1                     # 개발 환경 실행
│
├── .github/
│   └── workflows/
│       └── build.yml
│
├── package.json                    # 루트 package.json (workspaces)
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

---

## 9. 개발 환경 설정

### 9.1 필수 설치 항목

```powershell
# 1. Node.js 20 LTS
winget install OpenJS.NodeJS.LTS

# 2. pnpm (패키지 매니저)
npm install -g pnpm

# 3. Python 3.10
winget install Python.Python.3.10

# 4. CUDA Toolkit 11.8
# https://developer.nvidia.com/cuda-11-8-0-download-archive

# 5. FFmpeg
winget install FFmpeg

# 6. Git
winget install Git.Git

# 7. Visual Studio Code (권장)
winget install Microsoft.VisualStudioCode
```

### 9.2 프로젝트 초기화

```powershell
# 1. 저장소 클론
cd D:/Projects
git clone <repo-url> make-movie
cd make-movie

# 2. 의존성 설치
pnpm install

# 3. ComfyUI 설치
cd ai-server
python scripts/setup_comfyui.py

# 4. 모델 다운로드
python scripts/download_models.py

# 5. 개발 서버 실행
cd ..
pnpm dev
```

### 9.3 개발 스크립트

```json
{
  "scripts": {
    "dev": "concurrently \"pnpm dev:desktop\" \"pnpm dev:comfyui\"",
    "dev:desktop": "cd apps/desktop && pnpm dev",
    "dev:comfyui": "cd ai-server && python -m comfyui",
    "build": "cd apps/desktop && pnpm build",
    "package": "cd apps/desktop && pnpm package",
    "test": "vitest",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 10. 보안 고려사항

### 10.1 Electron 보안
```typescript
// main/index.ts
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,        // Node.js 통합 비활성화
    contextIsolation: true,        // 컨텍스트 격리
    sandbox: true,                 // 샌드박스 모드
    preload: path.join(__dirname, 'preload.js')
  }
});

// CSP 설정
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: file:",
        "connect-src 'self' http://127.0.0.1:8188"  // ComfyUI
      ].join('; ')
    }
  });
});
```

### 10.2 파일 시스템 보안
```typescript
// 허용된 디렉토리만 접근
const ALLOWED_PATHS = [
  app.getPath('userData'),  // ~/AnimeMaker
  app.getPath('temp'),      // 임시 파일
];

function validatePath(filePath: string): boolean {
  const normalized = path.normalize(filePath);
  return ALLOWED_PATHS.some(allowed =>
    normalized.startsWith(allowed)
  );
}
```

---

## 11. 성능 최적화

### 11.1 GPU 메모리 관리
```typescript
// AI 작업 큐 관리
class AIJobQueue {
  private queue: AIJob[] = [];
  private isProcessing = false;
  private maxVRAM: number;

  constructor() {
    this.maxVRAM = this.getAvailableVRAM();
  }

  async addJob(job: AIJob): Promise<void> {
    if (job.estimatedVRAM > this.maxVRAM * 0.8) {
      throw new Error('Job requires too much VRAM');
    }
    this.queue.push(job);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const job = this.queue.shift()!;

    try {
      await this.executeJob(job);
    } finally {
      this.isProcessing = false;
      this.processQueue();
    }
  }
}
```

### 11.2 이미지/비디오 캐싱
```typescript
// LRU 캐시 구현
class MediaCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 500 * 1024 * 1024; // 500MB
  private currentSize: number = 0;

  get(key: string): Buffer | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    entry.lastAccess = Date.now();
    return entry.data;
  }

  set(key: string, data: Buffer): void {
    while (this.currentSize + data.length > this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      size: data.length,
      lastAccess: Date.now()
    });
    this.currentSize += data.length;
  }
}
```

---

## 12. 테스트 전략

### 12.1 테스트 구조
```
tests/
├── unit/
│   ├── services/
│   │   ├── ProjectService.test.ts
│   │   └── AIService.test.ts
│   └── utils/
│       └── validators.test.ts
├── integration/
│   ├── comfyui.test.ts
│   └── export.test.ts
└── e2e/
    ├── project-flow.test.ts
    └── character-generation.test.ts
```

### 12.2 테스트 도구
```yaml
Unit Testing: Vitest
Integration: Vitest + MSW (API mocking)
E2E: Playwright
Coverage: c8 (>80% 목표)
```

---

## 13. 배포 전략

### 13.1 Electron 빌드 설정
```json
// electron-builder.json
{
  "appId": "com.animemaker.app",
  "productName": "Anime Maker",
  "directories": {
    "output": "dist"
  },
  "win": {
    "target": ["nsis"],
    "icon": "resources/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "installerIcon": "resources/icon.ico",
    "include": "scripts/installer.nsh"
  },
  "extraResources": [
    {
      "from": "ai-server/workflows",
      "to": "workflows"
    }
  ]
}
```

### 13.2 자동 업데이트
```typescript
// electron-updater 사용
import { autoUpdater } from 'electron-updater';

autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on('update-available', () => {
  // 업데이트 알림
});

autoUpdater.on('update-downloaded', () => {
  // 재시작 프롬프트
});
```

---

## 14. 다음 단계

### Phase 1 (MVP) 구현 순서

1. **Week 1-2**: 프로젝트 셋업
   - [ ] Electron + React 보일러플레이트
   - [ ] 기본 UI 레이아웃
   - [ ] ComfyUI 연동 테스트

2. **Week 3-4**: 캐릭터 생성
   - [ ] 프롬프트 입력 UI
   - [ ] SDXL + 애니메이션 모델 연동
   - [ ] 캐릭터 저장/관리

3. **Week 5-6**: 비디오 생성 + 립싱크
   - [ ] AnimateDiff 파이프라인
   - [ ] SadTalker 립싱크
   - [ ] 타임라인 기본 구현

4. **Week 7-8**: 통합 + 내보내기
   - [ ] 전체 워크플로우 연결
   - [ ] FFmpeg MP4 렌더링
   - [ ] 버그 수정 + 테스트

---

*문서 버전: 1.0.0*
*최종 수정: 2025-01-30*
