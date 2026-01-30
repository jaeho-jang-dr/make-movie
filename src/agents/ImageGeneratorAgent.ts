/**
 * ImageGeneratorAgent - 이미지 생성 담당 (ComfyUI/Stable Diffusion)
 */

import { BaseAgent, AgentContext, AgentResult } from './BaseAgent';
import * as fs from 'fs';
import * as path from 'path';

export interface ImageGenInput {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  seed?: number;
  model?: string;
  style?: 'anime' | 'ghibli' | 'realistic' | 'chibi';
  type: 'character' | 'background' | 'scene' | 'expression';
}

export interface ImageGenOutput {
  imagePath: string;
  seed: number;
  prompt: string;
}

export class ImageGeneratorAgent extends BaseAgent {
  private comfyuiUrl: string;
  private outputDir: string;

  constructor() {
    super({
      name: 'ImageGenerator',
      role: 'character_designer',
      capabilities: {
        taskTypes: ['character:generate'],
        provider: 'local',
        skills: ['generate_image', 'upscale', 'inpaint', 'img2img'],
        maxConcurrent: 1,
      },
      systemPrompt: '',
    });

    this.comfyuiUrl = process.env.COMFYUI_URL || 'http://127.0.0.1:8188';
    this.outputDir = path.join(process.cwd(), 'output', 'images');

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    this.assignTask(context.taskId);

    try {
      const input = context.input as ImageGenInput;
      const output = await this.generateImage(input);

      this.releaseTask();
      return { success: true, output };
    } catch (error) {
      this.releaseTask();
      return { success: false, error: String(error) };
    }
  }

  private async generateImage(input: ImageGenInput): Promise<ImageGenOutput> {
    const workflow = this.buildWorkflow(input);

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

    // 완료 대기 및 결과 가져오기
    const imagePath = await this.waitForImage(promptId);

    return {
      imagePath,
      seed: input.seed || -1,
      prompt: input.prompt,
    };
  }

  private buildWorkflow(input: ImageGenInput): Record<string, unknown> {
    const stylePresets: Record<string, string> = {
      anime: 'anime style, cel shading, vibrant colors',
      ghibli: 'studio ghibli style, watercolor, soft lighting',
      realistic: 'semi-realistic, detailed shading, cinematic',
      chibi: 'chibi style, cute, big head, small body',
    };

    const styleTag = input.style ? stylePresets[input.style] : stylePresets.anime;
    const fullPrompt = `${input.prompt}, ${styleTag}, masterpiece, best quality, detailed`;

    const defaultNegative = 'ugly, deformed, bad anatomy, extra limbs, blurry, lowres, watermark, text';
    const negativePrompt = input.negativePrompt || defaultNegative;

    const model = input.model || 'animagine-xl-3.1.safetensors';

    return {
      "1": {
        "class_type": "CheckpointLoaderSimple",
        "inputs": { "ckpt_name": model }
      },
      "2": {
        "class_type": "CLIPTextEncode",
        "inputs": {
          "text": fullPrompt,
          "clip": ["1", 1]
        }
      },
      "3": {
        "class_type": "CLIPTextEncode",
        "inputs": {
          "text": negativePrompt,
          "clip": ["1", 1]
        }
      },
      "4": {
        "class_type": "EmptyLatentImage",
        "inputs": {
          "width": input.width || 1024,
          "height": input.height || 1024,
          "batch_size": 1
        }
      },
      "5": {
        "class_type": "KSampler",
        "inputs": {
          "model": ["1", 0],
          "positive": ["2", 0],
          "negative": ["3", 0],
          "latent_image": ["4", 0],
          "seed": input.seed || Math.floor(Math.random() * 1000000000),
          "steps": input.steps || 25,
          "cfg": input.cfgScale || 7.0,
          "sampler_name": "euler_ancestral",
          "scheduler": "normal",
          "denoise": 1.0
        }
      },
      "6": {
        "class_type": "VAEDecode",
        "inputs": {
          "samples": ["5", 0],
          "vae": ["1", 2]
        }
      },
      "7": {
        "class_type": "SaveImage",
        "inputs": {
          "images": ["6", 0],
          "filename_prefix": `${input.type}_${Date.now()}`
        }
      }
    };
  }

  private async waitForImage(promptId: string, timeout = 120000): Promise<string> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const response = await fetch(`${this.comfyuiUrl}/history/${promptId}`);
      const history = await response.json();

      if (history[promptId]?.outputs) {
        const outputs = Object.values(history[promptId].outputs) as Array<{ images?: Array<{ filename: string; subfolder: string }> }>;
        for (const output of outputs) {
          if (output.images?.length) {
            const img = output.images[0];
            return `${this.comfyuiUrl}/view?filename=${img.filename}&subfolder=${img.subfolder || ''}`;
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    throw new Error('Image generation timeout');
  }
}
