/**
 * SkillRegistry - 스킬 등록 및 관리
 */

import {
  SkillDefinition,
  SkillHandler,
  SkillContext,
  SkillResult,
  SkillCategory,
} from './types';

export class SkillRegistry {
  private static instance: SkillRegistry;
  private skills: Map<string, SkillDefinition> = new Map();

  private constructor() {}

  static getInstance(): SkillRegistry {
    if (!SkillRegistry.instance) {
      SkillRegistry.instance = new SkillRegistry();
    }
    return SkillRegistry.instance;
  }

  /**
   * 스킬 등록
   */
  register<TInput, TOutput>(skill: SkillDefinition<TInput, TOutput>): void {
    if (this.skills.has(skill.name)) {
      console.warn(`Skill ${skill.name} already registered, overwriting...`);
    }
    this.skills.set(skill.name, skill as SkillDefinition);
    console.log(`[SkillRegistry] Registered: ${skill.name} (${skill.category})`);
  }

  /**
   * 스킬 실행
   */
  async execute<TInput, TOutput>(
    name: string,
    input: TInput,
    context?: SkillContext
  ): Promise<SkillResult<TOutput>> {
    const skill = this.skills.get(name);
    if (!skill) {
      return {
        success: false,
        error: `Skill not found: ${name}`,
      };
    }

    // 의존성 확인
    if (skill.dependencies?.length) {
      for (const dep of skill.dependencies) {
        if (!this.skills.has(dep)) {
          return {
            success: false,
            error: `Missing dependency: ${dep}`,
          };
        }
      }
    }

    const startTime = Date.now();

    try {
      const result = await skill.handler(input, context);
      return {
        ...result,
        duration: Date.now() - startTime,
      } as SkillResult<TOutput>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * 스킬 조회
   */
  get(name: string): SkillDefinition | undefined {
    return this.skills.get(name);
  }

  /**
   * 카테고리별 스킬 목록
   */
  getByCategory(category: SkillCategory): SkillDefinition[] {
    return Array.from(this.skills.values()).filter(s => s.category === category);
  }

  /**
   * 모든 스킬 목록
   */
  listAll(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }

  /**
   * 스킬 존재 여부
   */
  has(name: string): boolean {
    return this.skills.has(name);
  }

  /**
   * 스킬 제거
   */
  unregister(name: string): boolean {
    return this.skills.delete(name);
  }
}

// 편의 함수
export const skillRegistry = SkillRegistry.getInstance();

export function registerSkill<TInput, TOutput>(
  skill: SkillDefinition<TInput, TOutput>
): void {
  skillRegistry.register(skill);
}

export async function executeSkill<TInput, TOutput>(
  name: string,
  input: TInput,
  context?: SkillContext
): Promise<SkillResult<TOutput>> {
  return skillRegistry.execute(name, input, context);
}
