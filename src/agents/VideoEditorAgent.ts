/**
 * VideoEditorAgent - 영상 편집 및 합성 담당
 */

import { BaseAgent, AgentContext, AgentResult } from './BaseAgent';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface ComposeInput {
  clips: Array<{
    path: string;
    startTime?: number;
    duration?: number;
    transition?: 'cut' | 'fade' | 'dissolve';
  }>;
  audioTracks?: Array<{
    path: string;
    startTime: number;
    volume?: number;
    type: 'voice' | 'bgm' | 'sfx';
  }>;
  output: {
    path: string;
    format: 'mp4' | 'webm';
    resolution?: { width: number; height: number };
    fps?: number;
    quality?: number;
  };
  subtitles?: Array<{
    text: string;
    startTime: number;
    endTime: number;
    style?: string;
  }>;
}

export interface ComposeOutput {
  videoPath: string;
  duration: number;
  fileSize: number;
}

export class VideoEditorAgent extends BaseAgent {
  private outputDir: string;

  constructor() {
    super({
      name: 'VideoEditor',
      role: 'editor',
      capabilities: {
        taskTypes: ['video:compose', 'export:render'],
        provider: 'local',
        skills: ['cut_clips', 'merge_videos', 'add_audio', 'add_subtitles', 'apply_transitions'],
        maxConcurrent: 1,
      },
      systemPrompt: '',
    });

    this.outputDir = path.join(process.cwd(), 'output', 'video');

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    this.assignTask(context.taskId);

    try {
      const input = context.input as ComposeInput;
      const output = await this.composeVideo(input);

      this.releaseTask();
      return { success: true, output };
    } catch (error) {
      this.releaseTask();
      return { success: false, error: String(error) };
    }
  }

  private async composeVideo(input: ComposeInput): Promise<ComposeOutput> {
    const { clips, audioTracks, output, subtitles } = input;

    // 임시 파일 리스트 생성
    const listPath = path.join(this.outputDir, `concat_${Date.now()}.txt`);
    const listContent = clips.map(c => `file '${c.path}'`).join('\n');
    fs.writeFileSync(listPath, listContent);

    // FFmpeg 명령 구성
    const ffmpegArgs = this.buildFFmpegArgs(listPath, audioTracks, output, subtitles);

    return new Promise((resolve, reject) => {
      this.log('info', `FFmpeg: ${ffmpegArgs.join(' ')}`);

      const process = spawn('ffmpeg', ffmpegArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stderr = '';

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        // 임시 파일 삭제
        if (fs.existsSync(listPath)) {
          fs.unlinkSync(listPath);
        }

        if (code === 0) {
          const stats = fs.statSync(output.path);
          resolve({
            videoPath: output.path,
            duration: this.parseDuration(stderr),
            fileSize: stats.size,
          });
        } else {
          reject(new Error(`FFmpeg failed: ${stderr}`));
        }
      });

      process.on('error', (err) => {
        reject(new Error(`Failed to start FFmpeg: ${err.message}`));
      });
    });
  }

  private buildFFmpegArgs(
    listPath: string,
    audioTracks: ComposeInput['audioTracks'],
    output: ComposeInput['output'],
    subtitles: ComposeInput['subtitles']
  ): string[] {
    const args: string[] = ['-y']; // 덮어쓰기

    // 입력 파일 리스트
    args.push('-f', 'concat', '-safe', '0', '-i', listPath);

    // 오디오 트랙 추가
    if (audioTracks?.length) {
      for (const track of audioTracks) {
        args.push('-i', track.path);
      }
    }

    // 비디오 설정
    args.push('-c:v', 'libx264');
    args.push('-preset', 'medium');
    args.push('-crf', String(output.quality || 23));

    if (output.resolution) {
      args.push('-vf', `scale=${output.resolution.width}:${output.resolution.height}`);
    }

    if (output.fps) {
      args.push('-r', String(output.fps));
    }

    // 오디오 믹싱
    if (audioTracks?.length) {
      const filterComplex = this.buildAudioFilter(audioTracks);
      args.push('-filter_complex', filterComplex);
      args.push('-map', '0:v');
      args.push('-map', '[aout]');
    } else {
      args.push('-c:a', 'aac');
      args.push('-b:a', '128k');
    }

    // 자막 (ASS/SRT 파일로 별도 처리 필요)
    // TODO: 자막 처리 구현

    // 출력
    args.push(output.path);

    return args;
  }

  private buildAudioFilter(audioTracks: NonNullable<ComposeInput['audioTracks']>): string {
    // 오디오 믹싱 필터
    const inputs = audioTracks.map((track, i) => {
      const vol = track.volume || 1.0;
      return `[${i + 1}:a]volume=${vol}[a${i}]`;
    });

    const mix = audioTracks.map((_, i) => `[a${i}]`).join('');

    return `${inputs.join(';')};${mix}amix=inputs=${audioTracks.length}:duration=longest[aout]`;
  }

  private parseDuration(ffmpegOutput: string): number {
    const match = ffmpegOutput.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
    if (match) {
      const [, h, m, s, ms] = match;
      return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 100;
    }
    return 0;
  }
}
