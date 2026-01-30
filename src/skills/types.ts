/**
 * Skills 시스템 타입 정의
 */

export interface SkillContext {
  taskId?: string;
  previousResult?: unknown;
  metadata?: Record<string, unknown>;
}

export interface SkillResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  duration?: number;
}

export type SkillHandler<TInput = unknown, TOutput = unknown> = (
  input: TInput,
  context?: SkillContext
) => Promise<SkillResult<TOutput>>;

export interface SkillDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  category: SkillCategory;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  handler: SkillHandler<TInput, TOutput>;
  dependencies?: string[];
}

export type SkillCategory =
  | 'story'      // 스토리 관련
  | 'character'  // 캐릭터 관련
  | 'image'      // 이미지 생성
  | 'video'      // 비디오 처리
  | 'audio'      // 오디오 처리
  | 'utility';   // 유틸리티
