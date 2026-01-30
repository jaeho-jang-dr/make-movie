/**
 * Google Gemini AI Provider
 * 역할: 스토리 생성 담당
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIProvider, AIMessage, AIResponse, AIProviderConfig } from './types';

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini' as const;
  readonly model: string;

  private client: GoogleGenerativeAI;
  private generativeModel: GenerativeModel;

  constructor(config: AIProviderConfig) {
    const apiKey = config.apiKey || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }

    this.model = config.model || 'gemini-2.0-flash';
    this.client = new GoogleGenerativeAI(apiKey);
    this.generativeModel = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: {
        maxOutputTokens: config.maxTokens || 8192,
        temperature: config.temperature || 0.7,
      }
    });
  }

  async chat(messages: AIMessage[], options?: Partial<AIProviderConfig>): Promise<AIResponse> {
    try {
      // Gemini 형식으로 변환
      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const lastMessage = messages[messages.length - 1];

      const chat = this.generativeModel.startChat({ history });
      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response;

      return {
        content: response.text(),
        model: this.model,
        provider: 'gemini',
        usage: {
          inputTokens: response.usageMetadata?.promptTokenCount || 0,
          outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
        },
        finishReason: 'stop',
        raw: response,
      };
    } catch (error) {
      console.error('[Gemini] Error:', error);
      throw error;
    }
  }

  async *stream(messages: AIMessage[], options?: Partial<AIProviderConfig>): AsyncIterable<string> {
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    const chat = this.generativeModel.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage.content);

    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const result = await this.generativeModel.generateContent('ping');
      return !!result.response;
    } catch {
      return false;
    }
  }
}

// 스토리 생성 특화 프롬프트
export const STORY_SYSTEM_PROMPT = `당신은 일본 애니메이션 스토리 전문 작가입니다.

역할:
- 매력적인 캐릭터와 스토리라인 생성
- 일본 애니메이션 특유의 감성과 전개 방식 활용
- 씬별로 구분된 상세한 스토리보드 작성

출력 형식:
각 씬은 다음 JSON 형식으로 출력:
{
  "scenes": [
    {
      "id": 1,
      "title": "씬 제목",
      "description": "상세 설명",
      "dialogue": "대사 (있는 경우)",
      "emotion": "감정 상태",
      "duration": 5,
      "visualPrompt": "이미지 생성용 프롬프트"
    }
  ]
}`;
