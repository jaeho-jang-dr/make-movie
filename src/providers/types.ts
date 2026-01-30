/**
 * AI Provider 공통 타입 정의
 */

export type AIProviderType = 'gemini' | 'claude' | 'grok' | 'local';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: AIProviderType;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  finishReason?: 'stop' | 'length' | 'error';
  raw?: unknown;
}

export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface AIProvider {
  readonly name: AIProviderType;
  readonly model: string;

  chat(messages: AIMessage[], options?: Partial<AIProviderConfig>): Promise<AIResponse>;
  stream?(messages: AIMessage[], options?: Partial<AIProviderConfig>): AsyncIterable<string>;
  isAvailable(): Promise<boolean>;
}

export interface ProviderCapabilities {
  streaming: boolean;
  vision: boolean;
  functionCalling: boolean;
  maxContextLength: number;
  costPer1kInput: number;
  costPer1kOutput: number;
}

export const PROVIDER_CAPABILITIES: Record<AIProviderType, ProviderCapabilities> = {
  gemini: {
    streaming: true,
    vision: true,
    functionCalling: true,
    maxContextLength: 1000000,
    costPer1kInput: 0.00025,
    costPer1kOutput: 0.0005,
  },
  claude: {
    streaming: true,
    vision: true,
    functionCalling: true,
    maxContextLength: 200000,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
  },
  grok: {
    streaming: true,
    vision: false,
    functionCalling: true,
    maxContextLength: 128000,
    costPer1kInput: 0.002,
    costPer1kOutput: 0.01,
  },
  local: {
    streaming: true,
    vision: false,
    functionCalling: false,
    maxContextLength: 8192,
    costPer1kInput: 0,
    costPer1kOutput: 0,
  },
};
