/**
 * StoryWriterAgent - 스토리 작성 담당 (Gemini)
 */

import { BaseAgent, AgentContext, AgentResult } from './BaseAgent';
import { GeminiProvider } from '../providers/gemini';
import { AIProviderConfig } from '../providers/types';

export interface StoryInput {
  prompt: string;
  genre?: string;
  duration?: number; // 분
  characters?: Array<{
    name: string;
    personality: string;
    appearance?: string;
  }>;
  style?: 'shounen' | 'shoujo' | 'slice_of_life' | 'action' | 'romance' | 'fantasy';
}

export interface Scene {
  id: number;
  title: string;
  description: string;
  dialogue?: string;
  emotion: string;
  duration: number;
  visualPrompt: string;
  characters?: string[];
}

export interface StoryOutput {
  title: string;
  synopsis: string;
  scenes: Scene[];
  totalDuration: number;
}

export class StoryWriterAgent extends BaseAgent {
  constructor(providerConfig?: Partial<AIProviderConfig>) {
    super({
      name: 'StoryWriter',
      role: 'story_writer',
      capabilities: {
        taskTypes: ['story:generate', 'story:revise'],
        provider: 'gemini',
        skills: ['generate_story', 'expand_scene', 'add_dialogue'],
        maxConcurrent: 1,
      },
      provider: new GeminiProvider({
        model: providerConfig?.model || 'gemini-2.0-flash',
        ...providerConfig,
      }),
      systemPrompt: STORY_WRITER_SYSTEM_PROMPT,
    });

    this.initSkills();
  }

  private initSkills(): void {
    this.registerSkill('generate_story', this.generateStory.bind(this) as (...args: unknown[]) => Promise<unknown>);
    this.registerSkill('expand_scene', this.expandScene.bind(this) as (...args: unknown[]) => Promise<unknown>);
    this.registerSkill('add_dialogue', this.addDialogue.bind(this) as (...args: unknown[]) => Promise<unknown>);
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    this.assignTask(context.taskId);

    try {
      const input = context.input as StoryInput;
      const story = await this.generateStory(input);

      this.releaseTask();
      return {
        success: true,
        output: story,
        metadata: {
          sceneCount: story.scenes.length,
          totalDuration: story.totalDuration,
        },
      };
    } catch (error) {
      this.releaseTask();
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 스토리 생성
   */
  private async generateStory(input: StoryInput): Promise<StoryOutput> {
    const userPrompt = this.buildStoryPrompt(input);
    const response = await this.chat(userPrompt);

    const parsed = this.parseStoryResponse(response.content);
    this.log('info', `Generated story: ${parsed.title} (${parsed.scenes.length} scenes)`);

    return parsed;
  }

  /**
   * 씬 확장
   */
  private async expandScene(scene: Scene, context: string): Promise<Scene> {
    const prompt = `다음 씬을 더 상세하게 확장해주세요.

현재 씬:
${JSON.stringify(scene, null, 2)}

전체 맥락: ${context}

더 자세한 시각적 묘사와 감정 표현을 추가하고,
visualPrompt를 이미지 생성에 최적화된 영어 프롬프트로 업데이트하세요.`;

    const response = await this.chat(prompt);
    return this.parseSceneResponse(response.content);
  }

  /**
   * 대사 추가
   */
  private async addDialogue(scene: Scene, characters: string[]): Promise<Scene> {
    const prompt = `다음 씬에 대사를 추가해주세요.

씬: ${JSON.stringify(scene, null, 2)}
등장 캐릭터: ${characters.join(', ')}

캐릭터 성격에 맞는 자연스러운 대사를 작성하세요.
일본 애니메이션 특유의 말투를 사용하세요.`;

    const response = await this.chat(prompt);
    return this.parseSceneResponse(response.content);
  }

  private buildStoryPrompt(input: StoryInput): string {
    let prompt = `다음 주제로 일본 애니메이션 스토리를 작성해주세요.

주제: ${input.prompt}
장르: ${input.genre || '일반'}
분량: ${input.duration || 5}분 (약 ${(input.duration || 5) * 6} 씬)
스타일: ${input.style || 'slice_of_life'}
`;

    if (input.characters?.length) {
      prompt += `\n등장인물:\n`;
      for (const char of input.characters) {
        prompt += `- ${char.name}: ${char.personality}`;
        if (char.appearance) prompt += ` (외모: ${char.appearance})`;
        prompt += '\n';
      }
    }

    prompt += `\n출력 형식: JSON
{
  "title": "스토리 제목",
  "synopsis": "한 줄 요약",
  "scenes": [
    {
      "id": 1,
      "title": "씬 제목",
      "description": "상세 설명 (3-5문장)",
      "dialogue": "대사 (있는 경우)",
      "emotion": "주요 감정",
      "duration": 5,
      "visualPrompt": "English prompt for image generation, anime style, detailed",
      "characters": ["캐릭터명"]
    }
  ]
}`;

    return prompt;
  }

  private parseStoryResponse(content: string): StoryOutput {
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                       content.match(/\{[\s\S]*"scenes"[\s\S]*\}/);

      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      const parsed = JSON.parse(jsonStr);

      return {
        title: parsed.title || 'Untitled',
        synopsis: parsed.synopsis || '',
        scenes: parsed.scenes || [],
        totalDuration: parsed.scenes?.reduce((sum: number, s: Scene) => sum + (s.duration || 5), 0) || 0,
      };
    } catch (error) {
      this.log('error', `Failed to parse story: ${error}`);
      throw new Error('스토리 파싱 실패');
    }
  }

  private parseSceneResponse(content: string): Scene {
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                       content.match(/\{[\s\S]*"id"[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      return JSON.parse(jsonStr);
    } catch {
      throw new Error('씬 파싱 실패');
    }
  }
}

const STORY_WRITER_SYSTEM_PROMPT = `당신은 일본 애니메이션 스토리 전문 작가입니다.

핵심 역할:
- 매력적인 캐릭터와 몰입감 있는 스토리라인 창작
- 일본 애니메이션 특유의 감성과 전개 방식 활용
- 씬별로 구분된 상세한 스토리보드 작성

작성 원칙:
1. 캐릭터: 개성 있는 성격, 명확한 동기, 성장 아크
2. 구조: 기승전결 또는 3막 구조
3. 감정: 다양한 감정선과 적절한 완급 조절
4. 시각화: 각 씬이 영상으로 구현될 수 있도록 구체적 묘사

visualPrompt 작성 규칙:
- 영어로 작성
- 애니메이션 스타일 명시 (anime style, cel shading 등)
- 캐릭터 외모, 표정, 포즈 상세 기술
- 배경과 조명 묘사
- 카메라 앵글 (close-up, wide shot 등)

출력은 항상 유효한 JSON 형식으로 제공하세요.`;
