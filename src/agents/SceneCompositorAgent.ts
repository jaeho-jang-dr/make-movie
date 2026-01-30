/**
 * SceneCompositorAgent - 캐릭터+배경 합성 담당
 */

import { BaseAgent, AgentContext, AgentResult } from './BaseAgent';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

export interface CompositeInput {
  characterImage: string;
  backgroundImage: string;
  position?: { x: number; y: number };
  scale?: number;
  flip?: boolean;
  effects?: Array<'shadow' | 'glow' | 'blur_bg'>;
  output?: string;
}

export interface CompositeOutput {
  imagePath: string;
  width: number;
  height: number;
}

export class SceneCompositorAgent extends BaseAgent {
  private outputDir: string;

  constructor() {
    super({
      name: 'SceneCompositor',
      role: 'editor',
      capabilities: {
        taskTypes: ['video:compose'],
        provider: 'local',
        skills: ['composite_layers', 'adjust_lighting', 'add_effects', 'remove_background'],
        maxConcurrent: 2,
      },
      systemPrompt: '',
    });

    this.outputDir = path.join(process.cwd(), 'output', 'composites');

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    this.assignTask(context.taskId);

    try {
      const input = context.input as CompositeInput;
      const output = await this.compositeScene(input);

      this.releaseTask();
      return { success: true, output };
    } catch (error) {
      this.releaseTask();
      return { success: false, error: String(error) };
    }
  }

  private async compositeScene(input: CompositeInput): Promise<CompositeOutput> {
    const outputPath = input.output || path.join(this.outputDir, `composite_${Date.now()}.png`);

    // ImageMagick으로 합성
    const args = this.buildMagickArgs(input, outputPath);

    return new Promise((resolve, reject) => {
      const process = spawn('magick', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stderr = '';

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          // 이미지 크기 가져오기
          this.getImageSize(outputPath)
            .then(({ width, height }) => {
              resolve({ imagePath: outputPath, width, height });
            })
            .catch(() => {
              resolve({ imagePath: outputPath, width: 1920, height: 1080 });
            });
        } else {
          reject(new Error(`ImageMagick failed: ${stderr}`));
        }
      });

      process.on('error', () => {
        // ImageMagick이 없으면 FFmpeg 시도
        this.compositeWithFFmpeg(input, outputPath)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  private buildMagickArgs(input: CompositeInput, outputPath: string): string[] {
    const args: string[] = [];

    // 배경 이미지
    args.push(input.backgroundImage);

    // 캐릭터 이미지 처리
    args.push('(');
    args.push(input.characterImage);

    // 크기 조절
    if (input.scale && input.scale !== 1) {
      const percent = Math.round(input.scale * 100);
      args.push('-resize', `${percent}%`);
    }

    // 좌우 반전
    if (input.flip) {
      args.push('-flop');
    }

    args.push(')');

    // 위치 지정
    const x = input.position?.x || 0;
    const y = input.position?.y || 0;
    args.push('-gravity', 'NorthWest');
    args.push('-geometry', `+${x}+${y}`);

    // 효과
    if (input.effects?.includes('shadow')) {
      args.push('-compose', 'Over');
    }

    // 합성
    args.push('-composite');
    args.push(outputPath);

    return args;
  }

  private async compositeWithFFmpeg(input: CompositeInput, outputPath: string): Promise<CompositeOutput> {
    return new Promise((resolve, reject) => {
      const x = input.position?.x || 0;
      const y = input.position?.y || 0;
      const scale = input.scale || 1;

      const filterComplex = `[1:v]scale=iw*${scale}:ih*${scale}[fg];[0:v][fg]overlay=${x}:${y}`;

      const args = [
        '-y',
        '-i', input.backgroundImage,
        '-i', input.characterImage,
        '-filter_complex', filterComplex,
        '-frames:v', '1',
        outputPath,
      ];

      const process = spawn('ffmpeg', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ imagePath: outputPath, width: 1920, height: 1080 });
        } else {
          reject(new Error('FFmpeg composite failed'));
        }
      });

      process.on('error', (err) => {
        reject(err);
      });
    });
  }

  private async getImageSize(imagePath: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const args = ['-format', '%wx%h', imagePath];

      const process = spawn('magick', ['identify', ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          const [width, height] = stdout.trim().split('x').map(Number);
          resolve({ width, height });
        } else {
          reject(new Error('Failed to get image size'));
        }
      });
    });
  }
}
