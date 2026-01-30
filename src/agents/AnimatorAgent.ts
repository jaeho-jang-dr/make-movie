/**
 * AnimatorAgent - 애니메이션 생성 담당 (ComfyUI/AnimateDiff)
 */

import { BaseAgent, AgentContext, AgentResult } from './BaseAgent';

export interface AnimationInput {
  sourceImage: string; // 이미지 경로
  motionType: 'idle' | 'talk' | 'nod' | 'wave' | 'walk' | 'custom';
  duration: number; // 초
  fps: number;
  intensity?: number; // 0-1
  customPrompt?: string;
}

export interface AnimationOutput {
  videoPath: string;
  frames: number;
  duration: number;
  fps: number;
}

export class AnimatorAgent extends BaseAgent {
  private comfyuiUrl: string;

  constructor() {
    super({
      name: 'Animator',
      role: 'animator',
      capabilities: {
        taskTypes: ['video:animate'],
        provider: 'local',
        skills: ['generate_animation', 'interpolate_frames', 'apply_motion'],
        maxConcurrent: 1,
      },
      systemPrompt: '',
    });

    this.comfyuiUrl = process.env.COMFYUI_URL || 'http://127.0.0.1:8188';
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    this.assignTask(context.taskId);

    try {
      const input = context.input as AnimationInput;
      const output = await this.generateAnimation(input);

      this.releaseTask();
      return { success: true, output };
    } catch (error) {
      this.releaseTask();
      return { success: false, error: String(error) };
    }
  }

  private async generateAnimation(input: AnimationInput): Promise<AnimationOutput> {
    const workflow = this.buildAnimateDiffWorkflow(input);

    // ComfyUI API 호출
    const response = await fetch(`${this.comfyuiUrl}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow }),
    });

    if (!response.ok) {
      throw new Error(`ComfyUI error: ${response.status}`);
    }

    const result = await response.json();
    const promptId = result.prompt_id;

    // 완료 대기
    const outputPath = await this.waitForCompletion(promptId);

    return {
      videoPath: outputPath,
      frames: Math.ceil(input.duration * input.fps),
      duration: input.duration,
      fps: input.fps,
    };
  }

  private buildAnimateDiffWorkflow(input: AnimationInput): Record<string, unknown> {
    const motionPrompts: Record<string, string> = {
      idle: 'subtle breathing motion, gentle movement, blinking',
      talk: 'talking animation, mouth movement, expressive',
      nod: 'nodding head, agreeing motion',
      wave: 'waving hand, greeting gesture',
      walk: 'walking animation, moving forward',
      custom: input.customPrompt || '',
    };

    return {
      "3": {
        "class_type": "LoadImage",
        "inputs": { "image": input.sourceImage }
      },
      "4": {
        "class_type": "ADE_LoadAnimateDiffModel",
        "inputs": { "model_name": "mm_sd_v15_v2.ckpt" }
      },
      "5": {
        "class_type": "ADE_ApplyAnimateDiffModel",
        "inputs": {
          "motion_model": ["4", 0],
          "motion_lora": null,
          "motion_scale": input.intensity || 1.0,
          "apply_v2_models_properly": true
        }
      },
      "10": {
        "class_type": "VHS_VideoCombine",
        "inputs": {
          "frame_rate": input.fps,
          "loop_count": 0,
          "filename_prefix": "animation",
          "format": "video/h264-mp4"
        }
      }
    };
  }

  private async waitForCompletion(promptId: string, timeout = 120000): Promise<string> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const response = await fetch(`${this.comfyuiUrl}/history/${promptId}`);
      const history = await response.json();

      if (history[promptId]?.outputs) {
        const outputs = Object.values(history[promptId].outputs) as Array<{ videos?: Array<{ filename: string }> }>;
        for (const output of outputs) {
          if (output.videos?.length) {
            return `${this.comfyuiUrl}/view?filename=${output.videos[0].filename}`;
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Animation generation timeout');
  }
}
