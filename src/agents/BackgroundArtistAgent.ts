/**
 * BackgroundArtistAgent - 배경 이미지 생성 담당
 */

import { BaseAgent, AgentContext, AgentResult } from './BaseAgent';
import { ImageGeneratorAgent, ImageGenInput, ImageGenOutput } from './ImageGeneratorAgent';

export interface BackgroundInput {
  description: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  weather?: 'clear' | 'cloudy' | 'rainy' | 'snowy';
  location?: string;
  mood?: string;
  style?: 'anime' | 'ghibli' | 'realistic';
  width?: number;
  height?: number;
}

export interface BackgroundOutput extends ImageGenOutput {
  metadata: {
    timeOfDay: string;
    weather: string;
    location: string;
  };
}

export class BackgroundArtistAgent extends BaseAgent {
  private imageGenerator: ImageGeneratorAgent;

  constructor() {
    super({
      name: 'BackgroundArtist',
      role: 'character_designer',
      capabilities: {
        taskTypes: ['character:generate'],
        provider: 'local',
        skills: ['generate_backgrounds', 'create_variations', 'time_of_day_variants'],
        maxConcurrent: 1,
      },
      systemPrompt: '',
    });

    this.imageGenerator = new ImageGeneratorAgent();
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    this.assignTask(context.taskId);

    try {
      const input = context.input as BackgroundInput;
      const output = await this.generateBackground(input);

      this.releaseTask();
      return { success: true, output };
    } catch (error) {
      this.releaseTask();
      return { success: false, error: String(error) };
    }
  }

  private async generateBackground(input: BackgroundInput): Promise<BackgroundOutput> {
    const prompt = this.buildBackgroundPrompt(input);

    const imageInput: ImageGenInput = {
      prompt,
      type: 'background',
      style: input.style || 'anime',
      width: input.width || 1920,
      height: input.height || 1080,
      negativePrompt: 'people, characters, text, watermark, blurry, low quality',
    };

    const result = await this.imageGenerator.execute({
      taskId: this.currentTask || '',
      input: imageInput,
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    const imageOutput = result.output as ImageGenOutput;

    return {
      ...imageOutput,
      metadata: {
        timeOfDay: input.timeOfDay || 'afternoon',
        weather: input.weather || 'clear',
        location: input.location || input.description,
      },
    };
  }

  private buildBackgroundPrompt(input: BackgroundInput): string {
    const parts: string[] = [];

    // 기본 설명
    parts.push(input.description);

    // 위치
    if (input.location) {
      parts.push(input.location);
    }

    // 시간대
    const timeDescriptions: Record<string, string> = {
      morning: 'morning light, golden hour, warm sunlight',
      afternoon: 'bright daylight, blue sky',
      evening: 'sunset, orange sky, warm colors',
      night: 'night time, moonlight, stars, dark blue sky',
    };
    if (input.timeOfDay) {
      parts.push(timeDescriptions[input.timeOfDay]);
    }

    // 날씨
    const weatherDescriptions: Record<string, string> = {
      clear: 'clear sky, sunny',
      cloudy: 'cloudy sky, overcast',
      rainy: 'rain, wet ground, raindrops',
      snowy: 'snow, winter, snowflakes',
    };
    if (input.weather) {
      parts.push(weatherDescriptions[input.weather]);
    }

    // 분위기
    if (input.mood) {
      parts.push(input.mood);
    }

    // 배경 특화 태그
    parts.push('detailed background, scenery, landscape, no humans, high detail');

    return parts.join(', ');
  }
}
