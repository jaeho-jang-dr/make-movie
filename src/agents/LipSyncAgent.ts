/**
 * LipSyncAgent - 립싱크 생성 담당 (SadTalker)
 */

import { BaseAgent, AgentContext, AgentResult } from './BaseAgent';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface LipSyncInput {
  characterImage: string;
  audioPath: string;
  enhanceFace?: boolean;
  preprocess?: 'crop' | 'resize' | 'full';
  stillMode?: boolean;
}

export interface LipSyncOutput {
  videoPath: string;
  duration: number;
}

export class LipSyncAgent extends BaseAgent {
  private sadtalkerPath: string;
  private outputDir: string;

  constructor() {
    super({
      name: 'LipSyncArtist',
      role: 'animator',
      capabilities: {
        taskTypes: ['video:lipsync'],
        provider: 'local',
        skills: ['sync_lips', 'match_phonemes', 'blend_expressions'],
        maxConcurrent: 1,
      },
      systemPrompt: '',
    });

    this.sadtalkerPath = process.env.SADTALKER_PATH || path.join(process.env.HOME || '', 'SadTalker');
    this.outputDir = path.join(process.cwd(), 'output', 'lipsync');
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    this.assignTask(context.taskId);

    try {
      const input = context.input as LipSyncInput;
      const output = await this.generateLipSync(input);

      this.releaseTask();
      return { success: true, output };
    } catch (error) {
      this.releaseTask();
      return { success: false, error: String(error) };
    }
  }

  private async generateLipSync(input: LipSyncInput): Promise<LipSyncOutput> {
    // 출력 디렉토리 생성
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const outputFilename = `lipsync_${Date.now()}.mp4`;
    const outputPath = path.join(this.outputDir, outputFilename);

    // SadTalker 실행
    const args = [
      'inference.py',
      '--driven_audio', input.audioPath,
      '--source_image', input.characterImage,
      '--result_dir', this.outputDir,
      '--preprocess', input.preprocess || 'crop',
    ];

    if (input.enhanceFace) {
      args.push('--enhancer', 'gfpgan');
    }

    if (input.stillMode) {
      args.push('--still');
    }

    return new Promise((resolve, reject) => {
      const process = spawn('python', args, {
        cwd: this.sadtalkerPath,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stderr = '';

      process.stderr.on('data', (data) => {
        stderr += data.toString();
        this.log('info', data.toString().trim());
      });

      process.on('close', (code) => {
        if (code === 0) {
          // 생성된 파일 찾기
          const files = fs.readdirSync(this.outputDir)
            .filter(f => f.endsWith('.mp4'))
            .sort((a, b) => {
              const statA = fs.statSync(path.join(this.outputDir, a));
              const statB = fs.statSync(path.join(this.outputDir, b));
              return statB.mtime.getTime() - statA.mtime.getTime();
            });

          if (files.length > 0) {
            resolve({
              videoPath: path.join(this.outputDir, files[0]),
              duration: 0, // TODO: ffprobe로 실제 길이 확인
            });
          } else {
            reject(new Error('No output file generated'));
          }
        } else {
          reject(new Error(`SadTalker failed: ${stderr}`));
        }
      });

      process.on('error', (err) => {
        reject(new Error(`Failed to start SadTalker: ${err.message}`));
      });
    });
  }
}
