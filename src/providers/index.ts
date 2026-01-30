/**
 * AI Provider Factory & Registry
 */

import { AIProvider, AIProviderType, AIProviderConfig } from './types';
import { GeminiProvider } from './gemini';
import { ClaudeProvider } from './claude';
import { GrokProvider } from './grok';

export * from './types';
export { GeminiProvider } from './gemini';
export { ClaudeProvider } from './claude';
export { GrokProvider } from './grok';

type ProviderConstructor = new (config: AIProviderConfig) => AIProvider;

const PROVIDER_REGISTRY: Record<AIProviderType, ProviderConstructor | null> = {
  gemini: GeminiProvider,
  claude: ClaudeProvider,
  grok: GrokProvider,
  local: null, // TODO: Ollama/LMStudio 지원
};

export class ProviderFactory {
  private static instances: Map<string, AIProvider> = new Map();

  /**
   * AI Provider 인스턴스 생성 또는 반환 (싱글톤)
   */
  static getProvider(type: AIProviderType, config?: Partial<AIProviderConfig>): AIProvider {
    const key = `${type}:${config?.model || 'default'}`;

    if (!this.instances.has(key)) {
      const Constructor = PROVIDER_REGISTRY[type];
      if (!Constructor) {
        throw new Error(`Provider not available: ${type}`);
      }

      const defaultConfig = this.getDefaultConfig(type);
      const instance = new Constructor({ ...defaultConfig, ...config });
      this.instances.set(key, instance);
    }

    return this.instances.get(key)!;
  }

  /**
   * 타입별 기본 설정
   */
  private static getDefaultConfig(type: AIProviderType): AIProviderConfig {
    const configs: Record<AIProviderType, AIProviderConfig> = {
      gemini: { model: 'gemini-2.0-flash', maxTokens: 8192, temperature: 0.7 },
      claude: { model: 'claude-sonnet-4-20250514', maxTokens: 4096, temperature: 0.7 },
      grok: { model: 'grok-beta', maxTokens: 4096, temperature: 0.7 },
      local: { model: 'llama3', maxTokens: 2048, temperature: 0.7 },
    };
    return configs[type];
  }

  /**
   * 모든 Provider 상태 확인
   */
  static async checkAllProviders(): Promise<Record<AIProviderType, boolean>> {
    const results: Record<AIProviderType, boolean> = {
      gemini: false,
      claude: false,
      grok: false,
      local: false,
    };

    const checks = Object.keys(PROVIDER_REGISTRY) as AIProviderType[];

    await Promise.all(
      checks.map(async (type) => {
        try {
          const provider = this.getProvider(type);
          results[type] = await provider.isAvailable();
        } catch {
          results[type] = false;
        }
      })
    );

    return results;
  }

  /**
   * 캐시 초기화
   */
  static clearCache(): void {
    this.instances.clear();
  }
}

// 편의 함수
export const getGemini = (config?: Partial<AIProviderConfig>) =>
  ProviderFactory.getProvider('gemini', config);

export const getClaude = (config?: Partial<AIProviderConfig>) =>
  ProviderFactory.getProvider('claude', config);

export const getGrok = (config?: Partial<AIProviderConfig>) =>
  ProviderFactory.getProvider('grok', config);
