/**
 * xAI Grok AI Provider
 * 역할: 크리에이티브 보조, 대화 생성
 */

import { AIProvider, AIMessage, AIResponse, AIProviderConfig } from './types';

export class GrokProvider implements AIProvider {
  readonly name = 'grok' as const;
  readonly model: string;

  private apiKey: string;
  private baseUrl: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: AIProviderConfig) {
    const apiKey = config.apiKey || process.env.XAI_API_KEY;
    if (!apiKey) {
      throw new Error('xAI API key is required');
    }

    this.apiKey = apiKey;
    this.baseUrl = config.baseUrl || 'https://api.x.ai/v1';
    this.model = config.model || 'grok-beta';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
  }

  async chat(messages: AIMessage[], options?: Partial<AIProviderConfig>): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || this.model,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          max_tokens: options?.maxTokens || this.maxTokens,
          temperature: options?.temperature || this.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status}`);
      }

      const data = await response.json();
      const choice = data.choices[0];

      return {
        content: choice.message.content,
        model: data.model,
        provider: 'grok',
        usage: {
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0,
        },
        finishReason: choice.finish_reason === 'stop' ? 'stop' : 'length',
        raw: data,
      };
    } catch (error) {
      console.error('[Grok] Error:', error);
      throw error;
    }
  }

  async *stream(messages: AIMessage[], options?: Partial<AIProviderConfig>): AsyncIterable<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || this.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: options?.maxTokens || this.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {}
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// 대화 생성 특화 프롬프트
export const DIALOGUE_PROMPT = `당신은 애니메이션 대사 작가입니다.

역할:
- 캐릭터 성격에 맞는 자연스러운 대사 생성
- 일본 애니메이션 특유의 말투와 표현 활용
- 감정이 잘 드러나는 대사 작성

스타일 가이드:
- 존댓말/반말 구분
- 캐릭터별 말버릇 유지
- 적절한 감탄사 사용`;
