/**
 * Anthropic Claude AI Provider
 * 역할: 스토리 검증 및 보충
 */

import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AIMessage, AIResponse, AIProviderConfig } from './types';

export class ClaudeProvider implements AIProvider {
  readonly name = 'claude' as const;
  readonly model: string;

  private client: Anthropic;
  private maxTokens: number;
  private temperature: number;

  constructor(config: AIProviderConfig) {
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }

    this.model = config.model || 'claude-sonnet-4-20250514';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
    this.client = new Anthropic({ apiKey });
  }

  async chat(messages: AIMessage[], options?: Partial<AIProviderConfig>): Promise<AIResponse> {
    try {
      // 시스템 메시지 분리
      const systemMessage = messages.find(m => m.role === 'system');
      const chatMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      const response = await this.client.messages.create({
        model: options?.model || this.model,
        max_tokens: options?.maxTokens || this.maxTokens,
        temperature: options?.temperature || this.temperature,
        system: systemMessage?.content,
        messages: chatMessages,
      });

      const textContent = response.content.find(c => c.type === 'text');

      return {
        content: textContent?.text || '',
        model: response.model,
        provider: 'claude',
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        finishReason: response.stop_reason === 'end_turn' ? 'stop' : 'length',
        raw: response,
      };
    } catch (error) {
      console.error('[Claude] Error:', error);
      throw error;
    }
  }

  async *stream(messages: AIMessage[], options?: Partial<AIProviderConfig>): AsyncIterable<string> {
    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const stream = this.client.messages.stream({
      model: options?.model || this.model,
      max_tokens: options?.maxTokens || this.maxTokens,
      system: systemMessage?.content,
      messages: chatMessages,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }],
      });
      return true;
    } catch {
      return false;
    }
  }
}

// 스토리 검증 특화 프롬프트
export const STORY_REVIEWER_PROMPT = `당신은 애니메이션 스토리 검증 전문가입니다.

역할:
- 스토리의 논리적 일관성 검토
- 캐릭터 동기와 행동의 설득력 평가
- 장면 전환의 자연스러움 확인
- 감정선 흐름 분석
- 개선점 제안

출력 형식:
{
  "overallScore": 85,
  "analysis": {
    "plotCoherence": { "score": 90, "notes": "..." },
    "characterConsistency": { "score": 80, "notes": "..." },
    "emotionalFlow": { "score": 85, "notes": "..." },
    "pacing": { "score": 85, "notes": "..." }
  },
  "issues": [
    { "sceneId": 3, "type": "logic", "description": "...", "suggestion": "..." }
  ],
  "improvements": [
    { "sceneId": 5, "suggestion": "..." }
  ],
  "approved": true
}`;
