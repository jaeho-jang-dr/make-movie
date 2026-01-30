#!/usr/bin/env python3
"""
Anime Maker - AI 모델 다운로드 스크립트
모든 모델은 무료/오픈소스입니다.
"""

import os
import sys
import argparse
import subprocess
from pathlib import Path
from typing import Dict, List
import urllib.request
import hashlib

# 기본 경로
COMFYUI_PATH = Path(os.environ.get("COMFYUI_PATH", Path.home() / "ComfyUI"))
MODELS_PATH = COMFYUI_PATH / "models"

# 모델 정의
MODELS: Dict[str, Dict] = {
    # === 체크포인트 (택 1) ===
    "animagine-xl-3.1": {
        "url": "https://huggingface.co/cagliostrolab/animagine-xl-3.1/resolve/main/animagine-xl-3.1.safetensors",
        "path": "checkpoints/animagine-xl-3.1.safetensors",
        "size": "6.9GB",
        "config": "recommended",
        "description": "고품질 애니메이션 SDXL 모델"
    },
    "anything-v5": {
        "url": "https://huggingface.co/stablediffusionapi/anything-v5/resolve/main/anything-v5-PrtRE.safetensors",
        "path": "checkpoints/anything-v5.safetensors",
        "size": "2.1GB",
        "config": "minimal",
        "description": "경량 애니메이션 SD 1.5 모델"
    },

    # === AnimateDiff ===
    "animatediff-lightning-4step": {
        "url": "https://huggingface.co/ByteDance/AnimateDiff-Lightning/resolve/main/animatediff_lightning_4step_diffusers.safetensors",
        "path": "animatediff_models/animatediff_lightning_4step.safetensors",
        "size": "400MB",
        "config": "minimal",
        "description": "빠른 AnimateDiff (4 step)"
    },
    "animatediff-v3": {
        "url": "https://huggingface.co/guoyww/animatediff/resolve/main/mm_sd_v15_v2.ckpt",
        "path": "animatediff_models/mm_sd_v15_v2.ckpt",
        "size": "1.8GB",
        "config": "recommended",
        "description": "고품질 AnimateDiff v3"
    },

    # === 립싱크 ===
    "sadtalker-checkpoints": {
        "url": "https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2/checkpoints.zip",
        "path": "sadtalker/checkpoints.zip",
        "size": "1.2GB",
        "config": "minimal",
        "description": "SadTalker 립싱크 모델",
        "extract": True
    },

    # === VAE ===
    "sdxl-vae": {
        "url": "https://huggingface.co/stabilityai/sdxl-vae/resolve/main/sdxl_vae.safetensors",
        "path": "vae/sdxl_vae.safetensors",
        "size": "335MB",
        "config": "recommended",
        "description": "SDXL VAE"
    },

    # === LoRA (선택) ===
    "anime-lineart-lora": {
        "url": "https://civitai.com/api/download/models/28907",
        "path": "loras/anime_lineart.safetensors",
        "size": "150MB",
        "config": "optional",
        "description": "애니메이션 선화 스타일 LoRA"
    },
}

# 구성별 모델 목록
CONFIGS = {
    "minimal": [
        "anything-v5",
        "animatediff-lightning-4step",
        "sadtalker-checkpoints",
    ],
    "recommended": [
        "animagine-xl-3.1",
        "animatediff-v3",
        "sadtalker-checkpoints",
        "sdxl-vae",
    ],
    "full": list(MODELS.keys()),
}


def get_file_size(path: Path) -> int:
    """파일 크기 반환 (bytes)"""
    if path.exists():
        return path.stat().st_size
    return 0


def parse_size(size_str: str) -> int:
    """크기 문자열을 bytes로 변환"""
    units = {"B": 1, "KB": 1024, "MB": 1024**2, "GB": 1024**3}
    size_str = size_str.upper().strip()
    for unit, multiplier in units.items():
        if size_str.endswith(unit):
            return int(float(size_str[:-len(unit)]) * multiplier)
    return int(size_str)


def download_file(url: str, dest: Path, description: str = "") -> bool:
    """파일 다운로드 (진행률 표시)"""
    print(f"\n{'='*60}")
    print(f"다운로드: {description or dest.name}")
    print(f"URL: {url[:80]}...")
    print(f"저장: {dest}")
    print(f"{'='*60}")

    dest.parent.mkdir(parents=True, exist_ok=True)

    try:
        # huggingface-cli 사용 시도
        if "huggingface.co" in url:
            try:
                subprocess.run(
                    ["huggingface-cli", "download", "--local-dir", str(dest.parent),
                     url.replace("https://huggingface.co/", "").replace("/resolve/main/", " ").split()[0],
                     "--include", dest.name],
                    check=True
                )
                return True
            except (subprocess.CalledProcessError, FileNotFoundError):
                pass

        # wget 사용 시도
        try:
            subprocess.run(
                ["wget", "-O", str(dest), "--progress=bar:force", url],
                check=True
            )
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            pass

        # urllib 폴백
        def progress_hook(count, block_size, total_size):
            percent = int(count * block_size * 100 / total_size) if total_size > 0 else 0
            sys.stdout.write(f"\r진행률: {percent}% ({count * block_size / 1024 / 1024:.1f}MB)")
            sys.stdout.flush()

        urllib.request.urlretrieve(url, dest, progress_hook)
        print("\n완료!")
        return True

    except Exception as e:
        print(f"\n오류: {e}")
        return False


def extract_zip(zip_path: Path) -> bool:
    """ZIP 파일 압축 해제"""
    import zipfile
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(zip_path.parent)
        print(f"압축 해제 완료: {zip_path}")
        return True
    except Exception as e:
        print(f"압축 해제 오류: {e}")
        return False


def check_model_exists(model_id: str) -> bool:
    """모델이 이미 다운로드되었는지 확인"""
    model = MODELS[model_id]
    path = MODELS_PATH / model["path"]

    if path.suffix == ".zip":
        # ZIP 파일은 압축 해제된 폴더 확인
        return path.with_suffix("").exists() or path.exists()

    return path.exists()


def download_models(config: str = "minimal", force: bool = False) -> None:
    """모델 다운로드"""
    print(f"\n{'#'*60}")
    print(f"# Anime Maker - 모델 다운로드")
    print(f"# 구성: {config}")
    print(f"# ComfyUI 경로: {COMFYUI_PATH}")
    print(f"{'#'*60}")

    models_to_download = CONFIGS.get(config, CONFIGS["minimal"])

    # 다운로드 상태 확인
    print("\n[모델 상태 확인]")
    to_download = []
    for model_id in models_to_download:
        model = MODELS[model_id]
        exists = check_model_exists(model_id)
        status = "✅ 설치됨" if exists else "❌ 없음"
        print(f"  {model_id}: {status} ({model['size']})")

        if not exists or force:
            to_download.append(model_id)

    if not to_download:
        print("\n모든 모델이 이미 설치되어 있습니다.")
        return

    # 필요 용량 계산
    total_size = sum(parse_size(MODELS[m]["size"]) for m in to_download)
    print(f"\n다운로드할 모델: {len(to_download)}개")
    print(f"필요 용량: {total_size / 1024 / 1024 / 1024:.1f}GB")

    # 다운로드 확인
    response = input("\n다운로드를 시작할까요? (y/n): ")
    if response.lower() != 'y':
        print("취소됨")
        return

    # 다운로드 실행
    success = []
    failed = []

    for model_id in to_download:
        model = MODELS[model_id]
        dest = MODELS_PATH / model["path"]

        if download_file(model["url"], dest, model["description"]):
            # ZIP 파일 압축 해제
            if model.get("extract") and dest.suffix == ".zip":
                extract_zip(dest)
            success.append(model_id)
        else:
            failed.append(model_id)

    # 결과 출력
    print(f"\n{'='*60}")
    print("다운로드 완료!")
    print(f"성공: {len(success)}개")
    if failed:
        print(f"실패: {len(failed)}개 - {', '.join(failed)}")
    print(f"{'='*60}")


def list_models() -> None:
    """사용 가능한 모델 목록 출력"""
    print("\n[사용 가능한 모델]")
    print("-" * 80)

    for config_name, model_ids in CONFIGS.items():
        print(f"\n{config_name.upper()} 구성:")
        for model_id in model_ids:
            model = MODELS[model_id]
            exists = "✅" if check_model_exists(model_id) else "❌"
            print(f"  {exists} {model_id}: {model['description']} ({model['size']})")


def main():
    parser = argparse.ArgumentParser(
        description="Anime Maker - AI 모델 다운로드",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예시:
  python download_models.py --config minimal     # 최소 구성 (18GB)
  python download_models.py --config recommended # 권장 구성 (25GB)
  python download_models.py --list              # 모델 목록 보기
        """
    )

    parser.add_argument(
        "--config", "-c",
        choices=["minimal", "recommended", "full"],
        default="minimal",
        help="다운로드할 모델 구성"
    )
    parser.add_argument(
        "--list", "-l",
        action="store_true",
        help="사용 가능한 모델 목록 출력"
    )
    parser.add_argument(
        "--force", "-f",
        action="store_true",
        help="기존 모델 덮어쓰기"
    )
    parser.add_argument(
        "--comfyui-path",
        type=Path,
        help="ComfyUI 설치 경로"
    )

    args = parser.parse_args()

    if args.comfyui_path:
        global COMFYUI_PATH, MODELS_PATH
        COMFYUI_PATH = args.comfyui_path
        MODELS_PATH = COMFYUI_PATH / "models"

    if args.list:
        list_models()
    else:
        download_models(args.config, args.force)


if __name__ == "__main__":
    main()
