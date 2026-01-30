/**
 * BaseAgent - 모든 Sub-agent의 기본 클래스
 */

import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';
import { Agent, AgentRole, AgentCapability, TaskType } from '../conductor/types';
import { AIProvider, AIMessage, AIResponse } from '../providers/types';

export interface AgentContext {
  taskId: string;
  input: unknown;
  previousResults?: Record<string, unknown>;
}

export interface AgentResult {
  success: boolean;
  output?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export abstract class BaseAgent extends EventEmitter implements Agent {
  readonly id: string;
  readonly name: string;
  readonly role: AgentRole;
  readonly capabilities: AgentCapability;

  status: 'idle' | 'busy' | 'offline' = 'idle';
  currentTask?: string;

  protected provider?: AIProvider;
  protected systemPrompt: string = '';
  protected skills: Map<string, (...args: unknown[]) => Promise<unknown>> = new Map();

  constructor(config: {
    name: string;
    role: AgentRole;
    capabilities: AgentCapability;
    provider?: AIProvider;
    systemPrompt?: string;
  }) {
    super();
    this.id = uuid();
    this.name = config.name;
    this.role = config.role;
    this.capabilities = config.capabilities;
    this.provider = config.provider;
    this.systemPrompt = config.systemPrompt || '';
  }

  /**
   * 작업 실행 (하위 클래스에서 구현)
   */
  abstract execute(context: AgentContext): Promise<AgentResult>;

  /**
   * AI Provider를 통한 대화
   */
  protected async chat(userMessage: string, options?: {
    systemOverride?: string;
    history?: AIMessage[];
  }): Promise<AIResponse> {
    if (!this.provider) {
      throw new Error(`Agent ${this.name} has no AI provider`);
    }

    const messages: AIMessage[] = [
      { role: 'system', content: options?.systemOverride || this.systemPrompt },
      ...(options?.history || []),
      { role: 'user', content: userMessage },
    ];

    return this.provider.chat(messages);
  }

  /**
   * 스킬 등록
   */
  protected registerSkill(
    name: string,
    handler: (...args: unknown[]) => Promise<unknown>
  ): void {
    this.skills.set(name, handler);
  }

  /**
   * 스킬 실행
   */
  protected async useSkill(name: string, ...args: unknown[]): Promise<unknown> {
    const skill = this.skills.get(name);
    if (!skill) {
      throw new Error(`Skill not found: ${name}`);
    }
    return skill(...args);
  }

  /**
   * 상태 변경
   */
  setStatus(status: 'idle' | 'busy' | 'offline'): void {
    this.status = status;
    this.emit('status:change', { agentId: this.id, status });
  }

  /**
   * 작업 할당
   */
  assignTask(taskId: string): void {
    this.currentTask = taskId;
    this.setStatus('busy');
    this.emit('task:assigned', { agentId: this.id, taskId });
  }

  /**
   * 작업 완료
   */
  releaseTask(): void {
    const taskId = this.currentTask;
    this.currentTask = undefined;
    this.setStatus('idle');
    this.emit('task:released', { agentId: this.id, taskId });
  }

  /**
   * 로깅
   */
  protected log(level: 'info' | 'warn' | 'error', message: string): void {
    const timestamp = new Date().toISOString();
    console[level](`[${this.name} ${timestamp}] ${message}`);
  }
}
