/**
 * CharacterDesignerAgent - 캐릭터 설계 담당 (Claude)
 */

import { BaseAgent, AgentContext, AgentResult } from './BaseAgent';
import { ClaudeProvider } from '../providers/claude';

export interface CharacterDesignInput {
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'background';
  personality: string;
  age?: number;
  gender?: string;
  style?: string;
  storyContext?: string;
}

export interface CharacterDesignOutput {
  name: string;
  fullName?: string;
  age: number;
  gender: string;
  personality: {
    traits: string[];
    strengths: string[];
    weaknesses: string[];
    quirks: string[];
  };
  appearance: {
    height: string;
    build: string;
    hairColor: string;
    hairStyle: string;
    eyeColor: string;
    skinTone: string;
    distinguishingFeatures: string[];
    outfit: string;
  };
  backstory: string;
  motivation: string;
  speechPattern: string;
  relationships: Array<{ character: string; relation: string }>;
  visualPrompt: string;
  negativePrompt: string;
}

export class CharacterDesignerAgent extends BaseAgent {
  constructor() {
    // Claude Provider는 API 키가 있을 때만 생성
    let claudeProvider: ClaudeProvider | undefined;
    try {
      if (process.env.ANTHROPIC_API_KEY) {
        claudeProvider = new ClaudeProvider({ model: 'claude-sonnet-4-20250514' });
      }
    } catch (e) {
      // Claude not available
    }

    super({
      name: 'CharacterDesigner',
      role: 'character_designer',
      capabilities: {
        taskTypes: ['character:design'],
        provider: 'claude',
        skills: ['design_appearance', 'create_personality', 'write_backstory', 'generate_prompt'],
        maxConcurrent: 1,
      },
      provider: claudeProvider,
      systemPrompt: CHARACTER_DESIGNER_PROMPT,
    });
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    this.assignTask(context.taskId);

    try {
      const input = context.input as CharacterDesignInput;
      const design = await this.designCharacter(input);

      this.releaseTask();
      return { success: true, output: design };
    } catch (error) {
      this.releaseTask();
      return { success: false, error: String(error) };
    }
  }

  private async designCharacter(input: CharacterDesignInput): Promise<CharacterDesignOutput> {
    const prompt = `캐릭터를 상세하게 디자인해주세요.

이름: ${input.name}
역할: ${input.role}
성격 키워드: ${input.personality}
${input.age ? `나이: ${input.age}` : ''}
${input.gender ? `성별: ${input.gender}` : ''}
${input.style ? `스타일: ${input.style}` : ''}
${input.storyContext ? `스토리 맥락: ${input.storyContext}` : ''}

JSON 형식으로 출력해주세요.`;

    const response = await this.chat(prompt);
    return this.parseDesign(response.content);
  }

  private parseDesign(content: string): CharacterDesignOutput {
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                     content.match(/\{[\s\S]*"name"[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    return JSON.parse(jsonStr);
  }
}

const CHARACTER_DESIGNER_PROMPT = `당신은 일본 애니메이션 캐릭터 디자이너입니다.

역할:
- 매력적이고 기억에 남는 캐릭터 설계
- 성격, 외모, 배경스토리의 일관성 유지
- 이미지 생성에 최적화된 프롬프트 작성

출력 형식 (JSON):
{
  "name": "이름",
  "fullName": "전체 이름",
  "age": 17,
  "gender": "female",
  "personality": {
    "traits": ["용감함", "호기심"],
    "strengths": ["리더십"],
    "weaknesses": ["성급함"],
    "quirks": ["말버릇"]
  },
  "appearance": {
    "height": "160cm",
    "build": "슬림",
    "hairColor": "파란색",
    "hairStyle": "트윈테일",
    "eyeColor": "보라색",
    "skinTone": "밝은 피부",
    "distinguishingFeatures": ["별 모양 헤어핀"],
    "outfit": "세일러복 교복"
  },
  "backstory": "배경 스토리...",
  "motivation": "목표와 동기...",
  "speechPattern": "말투 특징...",
  "relationships": [],
  "visualPrompt": "1girl, anime style, blue twintail hair, purple eyes, sailor uniform, cute, detailed face, masterpiece, best quality",
  "negativePrompt": "ugly, deformed, bad anatomy, extra limbs"
}`;
