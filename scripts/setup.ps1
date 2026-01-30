# Anime Maker - Windows 설치 스크립트
# PowerShell 5.1+ 필요

$ErrorActionPreference = "Stop"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Anime Maker - 설치 스크립트" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# 관리자 권한 확인
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# 1. 필수 소프트웨어 확인
Write-Host "`n[1/6] 필수 소프트웨어 확인..." -ForegroundColor Yellow

$requirements = @{
    "node" = @{
        "cmd" = "node --version"
        "install" = "winget install OpenJS.NodeJS.LTS"
        "url" = "https://nodejs.org/"
    }
    "python" = @{
        "cmd" = "python --version"
        "install" = "winget install Python.Python.3.10"
        "url" = "https://python.org/"
    }
    "git" = @{
        "cmd" = "git --version"
        "install" = "winget install Git.Git"
        "url" = "https://git-scm.com/"
    }
    "ffmpeg" = @{
        "cmd" = "ffmpeg -version"
        "install" = "winget install FFmpeg"
        "url" = "https://ffmpeg.org/"
    }
}

$missing = @()

foreach ($tool in $requirements.Keys) {
    try {
        $null = Invoke-Expression $requirements[$tool]["cmd"] 2>$null
        Write-Host "  ✅ $tool 설치됨" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ $tool 없음" -ForegroundColor Red
        $missing += $tool
    }
}

if ($missing.Count -gt 0) {
    Write-Host "`n누락된 소프트웨어:" -ForegroundColor Red
    foreach ($tool in $missing) {
        Write-Host "  - $tool : $($requirements[$tool]['url'])" -ForegroundColor Yellow
        Write-Host "    설치: $($requirements[$tool]['install'])" -ForegroundColor Gray
    }

    $install = Read-Host "`nwinget으로 설치하시겠습니까? (y/n)"
    if ($install -eq 'y') {
        foreach ($tool in $missing) {
            Write-Host "설치 중: $tool..." -ForegroundColor Cyan
            Invoke-Expression $requirements[$tool]["install"]
        }
    } else {
        Write-Host "수동 설치 후 다시 실행해주세요." -ForegroundColor Yellow
        exit 1
    }
}

# 2. NVIDIA GPU 확인
Write-Host "`n[2/6] GPU 확인..." -ForegroundColor Yellow

try {
    $gpu = Get-WmiObject Win32_VideoController | Where-Object { $_.Name -like "*NVIDIA*" }
    if ($gpu) {
        Write-Host "  ✅ NVIDIA GPU: $($gpu.Name)" -ForegroundColor Green

        # CUDA 확인
        try {
            $cuda = & nvcc --version 2>$null
            if ($cuda) {
                Write-Host "  ✅ CUDA 설치됨" -ForegroundColor Green
            }
        } catch {
            Write-Host "  ⚠️ CUDA Toolkit 미설치 - https://developer.nvidia.com/cuda-toolkit" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠️ NVIDIA GPU 미감지 - AI 기능이 느릴 수 있습니다" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️ GPU 확인 실패" -ForegroundColor Yellow
}

# 3. pnpm 설치
Write-Host "`n[3/6] pnpm 설치..." -ForegroundColor Yellow

try {
    $null = pnpm --version 2>$null
    Write-Host "  ✅ pnpm 설치됨" -ForegroundColor Green
} catch {
    Write-Host "  pnpm 설치 중..." -ForegroundColor Cyan
    npm install -g pnpm
}

# 4. Node.js 의존성 설치
Write-Host "`n[4/6] Node.js 의존성 설치..." -ForegroundColor Yellow

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

if (Test-Path "package.json") {
    pnpm install
    Write-Host "  ✅ Node.js 패키지 설치 완료" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ package.json 없음 - 프로젝트 초기화 필요" -ForegroundColor Yellow
}

# 5. Python 가상환경 & 의존성
Write-Host "`n[5/6] Python 환경 설정..." -ForegroundColor Yellow

$venvPath = Join-Path $projectRoot "ai-server\.venv"

if (-not (Test-Path $venvPath)) {
    Write-Host "  가상환경 생성 중..." -ForegroundColor Cyan
    python -m venv $venvPath
}

# 가상환경 활성화
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
if (Test-Path $activateScript) {
    & $activateScript

    # pip 업그레이드
    python -m pip install --upgrade pip

    # 기본 패키지 설치
    $pipPackages = @(
        "torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118",
        "transformers diffusers accelerate safetensors",
        "opencv-python numpy pillow",
        "requests aiohttp websockets"
    )

    foreach ($pkg in $pipPackages) {
        Write-Host "  설치: $pkg" -ForegroundColor Gray
        Invoke-Expression "pip install $pkg"
    }

    Write-Host "  ✅ Python 패키지 설치 완료" -ForegroundColor Green
}

# 6. ComfyUI 설치 안내
Write-Host "`n[6/6] ComfyUI 설치..." -ForegroundColor Yellow

$comfyPath = Join-Path $env:USERPROFILE "ComfyUI"

if (Test-Path $comfyPath) {
    Write-Host "  ✅ ComfyUI 발견: $comfyPath" -ForegroundColor Green
} else {
    Write-Host "  ComfyUI 설치가 필요합니다." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  설치 방법:" -ForegroundColor Cyan
    Write-Host "  1. https://github.com/comfyanonymous/ComfyUI 에서 다운로드"
    Write-Host "  2. 또는 다음 명령 실행:"
    Write-Host "     git clone https://github.com/comfyanonymous/ComfyUI.git $comfyPath"
    Write-Host "     cd $comfyPath"
    Write-Host "     pip install -r requirements.txt"
    Write-Host ""

    $installComfy = Read-Host "지금 ComfyUI를 설치하시겠습니까? (y/n)"
    if ($installComfy -eq 'y') {
        git clone https://github.com/comfyanonymous/ComfyUI.git $comfyPath
        Set-Location $comfyPath
        pip install -r requirements.txt
        Write-Host "  ✅ ComfyUI 설치 완료" -ForegroundColor Green
    }
}

# 완료
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  설치 완료!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan

Write-Host "`n다음 단계:" -ForegroundColor Yellow
Write-Host "  1. AI 모델 다운로드:"
Write-Host "     cd ai-server"
Write-Host "     python scripts/download_models.py --config minimal"
Write-Host ""
Write-Host "  2. 개발 서버 실행:"
Write-Host "     pnpm dev"
Write-Host ""
Write-Host "  3. ComfyUI 실행 (별도 터미널):"
Write-Host "     cd $comfyPath && python main.py"
Write-Host ""
