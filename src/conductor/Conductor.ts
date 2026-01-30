/**
 * Conductor - 멀티 AI 오케스트레이션 핵심 클래스
 *
 * 역할:
 * 1. 여러 AI Provider 조율 (Gemini, Claude, Grok)
 * 2. Sub-agent 관리 및 작업 분배
 * 3. Workflow 실행 관리
 * 4. 이벤트 기반 통신
 */

import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';
import {
  Task,
  TaskType,
  TaskStatus,
  Agent,
  AgentRole,
  Workflow,
  WorkflowExecution,
  WorkflowStep,
  ConductorConfig,
  ConductorEvent,
  ConductorEventType,
  EventHandler,
  DEFAULT_CONDUCTOR_CONFIG,
} from './types';
import { ProviderFactory, AIProvider, AIMessage } from '../providers';

export class Conductor extends EventEmitter {
  private config: ConductorConfig;
  private agents: Map<string, Agent> = new Map();
  private tasks: Map<string, Task> = new Map();
  private taskQueue: Task[] = [];
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private providers: Map<string, AIProvider> = new Map();

  constructor(config: Partial<ConductorConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONDUCTOR_CONFIG, ...config };
    this.initializeProviders();
  }

  // ============ 초기화 ============

  private initializeProviders(): void {
    // 스토리 생성용 Gemini
    try {
      this.providers.set('story', ProviderFactory.getProvider(this.config.providers.story));
    } catch (e) {
      this.log('warn', `Story provider (${this.config.providers.story}) not available`);
    }

    // 검증용 Claude
    try {
      this.providers.set('review', ProviderFactory.getProvider(this.config.providers.review));
    } catch (e) {
      this.log('warn', `Review provider (${this.config.providers.review}) not available`);
    }

    // 대화용 Grok
    try {
      this.providers.set('dialogue', ProviderFactory.getProvider(this.config.providers.dialogue));
    } catch (e) {
      this.log('warn', `Dialogue provider (${this.config.providers.dialogue}) not available`);
    }
  }

  // ============ Agent 관리 ============

  /**
   * Agent 등록
   */
  registerAgent(agent: Omit<Agent, 'id' | 'status'>): Agent {
    const newAgent: Agent = {
      ...agent,
      id: uuid(),
      status: 'idle',
    };
    this.agents.set(newAgent.id, newAgent);
    this.log('info', `Agent registered: ${newAgent.name} (${newAgent.role})`);
    return newAgent;
  }

  /**
   * Agent 조회
   */
  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  /**
   * 역할별 사용 가능한 Agent 찾기
   */
  findAvailableAgent(role: AgentRole): Agent | undefined {
    return Array.from(this.agents.values()).find(
      agent => agent.role === role && agent.status === 'idle'
    );
  }

  /**
   * 작업 유형에 맞는 Agent 찾기
   */
  findAgentForTask(taskType: TaskType): Agent | undefined {
    return Array.from(this.agents.values()).find(
      agent =>
        agent.status === 'idle' &&
        agent.capabilities.taskTypes.includes(taskType)
    );
  }

  // ============ Task 관리 ============

  /**
   * Task 생성 및 큐에 추가
   */
  createTask(
    type: TaskType,
    input: unknown,
    options: { priority?: Task['priority']; metadata?: Record<string, unknown> } = {}
  ): Task {
    const task: Task = {
      id: uuid(),
      type,
      status: 'pending',
      priority: options.priority || 'normal',
      input,
      metadata: options.metadata,
      createdAt: new Date(),
    };

    this.tasks.set(task.id, task);
    this.taskQueue.push(task);
    this.sortTaskQueue();

    this.emitEvent('task:created', task);
    this.log('info', `Task created: ${task.id} (${task.type})`);

    // 자동 처리 시작
    this.processNextTask();

    return task;
  }

  /**
   * Task 상태 업데이트
   */
  private updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    result?: { output?: unknown; error?: string }
  ): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = status;
    if (result?.output) task.output = result.output;
    if (result?.error) task.error = result.error;

    if (status === 'running') {
      task.startedAt = new Date();
      this.emitEvent('task:started', task);
    } else if (status === 'completed') {
      task.completedAt = new Date();
      this.emitEvent('task:completed', task);
    } else if (status === 'failed') {
      task.completedAt = new Date();
      this.emitEvent('task:failed', task);
    }
  }

  /**
   * 우선순위 기반 큐 정렬
   */
  private sortTaskQueue(): void {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    this.taskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * 다음 Task 처리
   */
  private async processNextTask(): Promise<void> {
    if (this.taskQueue.length === 0) return;

    const runningTasks = Array.from(this.tasks.values()).filter(t => t.status === 'running');
    if (runningTasks.length >= this.config.maxConcurrentTasks) return;

    const task = this.taskQueue.shift();
    if (!task) return;

    await this.executeTask(task);
  }

  /**
   * Task 실행
   */
  private async executeTask(task: Task): Promise<void> {
    this.updateTaskStatus(task.id, 'running');

    try {
      const result = await this.runTaskHandler(task);
      this.updateTaskStatus(task.id, 'completed', { output: result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log('error', `Task failed: ${task.id} - ${errorMessage}`);
      this.updateTaskStatus(task.id, 'failed', { error: errorMessage });
    }

    // 다음 작업 처리
    this.processNextTask();
  }

  /**
   * Task 유형별 핸들러 라우팅
   */
  private async runTaskHandler(task: Task): Promise<unknown> {
    const handlers: Partial<Record<TaskType, (input: unknown) => Promise<unknown>>> = {
      'story:generate': (input) => this.handleStoryGenerate(input),
      'story:review': (input) => this.handleStoryReview(input),
      'story:revise': (input) => this.handleStoryRevise(input),
      // TODO: 다른 핸들러 추가
    };

    const handler = handlers[task.type];
    if (!handler) {
      throw new Error(`No handler for task type: ${task.type}`);
    }

    return handler(task.input);
  }

  // ============ Task 핸들러 ============

  /**
   * 스토리 생성 (Gemini)
   */
  private async handleStoryGenerate(input: unknown): Promise<unknown> {
    const provider = this.providers.get('story');
    if (!provider) throw new Error('Story provider not available');

    const { prompt, genre, duration } = input as {
      prompt: string;
      genre?: string;
      duration?: number;
    };

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `당신은 일본 애니메이션 스토리 전문 작가입니다.
장르: ${genre || '일반'}
목표 분량: ${duration || 5}분
출력 형식: JSON (scenes 배열)`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await provider.chat(messages);
    return this.parseStoryResponse(response.content);
  }

  /**
   * 스토리 검증 (Claude)
   */
  private async handleStoryReview(input: unknown): Promise<unknown> {
    const provider = this.providers.get('review');
    if (!provider) throw new Error('Review provider not available');

    const { story } = input as { story: unknown };

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `당신은 애니메이션 스토리 검증 전문가입니다.
스토리를 분석하고 논리적 일관성, 캐릭터 일관성, 감정 흐름을 평가하세요.
개선점을 구체적으로 제안하세요.
출력 형식: JSON`,
      },
      {
        role: 'user',
        content: `다음 스토리를 검토해주세요:\n${JSON.stringify(story, null, 2)}`,
      },
    ];

    const response = await provider.chat(messages);
    return this.parseReviewResponse(response.content);
  }

  /**
   * 스토리 수정 (Gemini + Claude 피드백)
   */
  private async handleStoryRevise(input: unknown): Promise<unknown> {
    const { story, feedback } = input as { story: unknown; feedback: unknown };

    const provider = this.providers.get('story');
    if (!provider) throw new Error('Story provider not available');

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: '피드백을 반영하여 스토리를 수정하세요. 원본 구조를 유지하면서 개선하세요.',
      },
      {
        role: 'user',
        content: `원본 스토리:\n${JSON.stringify(story, null, 2)}\n\n피드백:\n${JSON.stringify(feedback, null, 2)}`,
      },
    ];

    const response = await provider.chat(messages);
    return this.parseStoryResponse(response.content);
  }

  // ============ 응답 파싱 ============

  private parseStoryResponse(content: string): unknown {
    try {
      // JSON 블록 추출
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                       content.match(/\{[\s\S]*"scenes"[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch {
      return { raw: content, parsed: false };
    }
  }

  private parseReviewResponse(content: string): unknown {
    return this.parseStoryResponse(content);
  }

  // ============ Workflow 관리 ============

  /**
   * Workflow 등록
   */
  registerWorkflow(workflow: Omit<Workflow, 'id'>): Workflow {
    const newWorkflow: Workflow = {
      ...workflow,
      id: uuid(),
    };
    this.workflows.set(newWorkflow.id, newWorkflow);
    return newWorkflow;
  }

  /**
   * Workflow 실행
   */
  async executeWorkflow(
    workflowId: string,
    variables: Record<string, unknown> = {}
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);

    const execution: WorkflowExecution = {
      id: uuid(),
      workflowId,
      status: 'running',
      completedSteps: [],
      results: {},
      startedAt: new Date(),
    };

    this.executions.set(execution.id, execution);
    this.emitEvent('workflow:started', { execution, workflow });

    try {
      const mergedVars = { ...workflow.variables, ...variables };

      for (const step of workflow.steps) {
        // 의존성 확인
        if (step.dependsOn) {
          const allDepsComplete = step.dependsOn.every(dep =>
            execution.completedSteps.includes(dep)
          );
          if (!allDepsComplete) {
            throw new Error(`Dependencies not met for step: ${step.id}`);
          }
        }

        execution.currentStep = step.id;
        this.emitEvent('workflow:step', { execution, step });

        // 입력값 해석
        const resolvedInput = this.resolveStepInput(step.input, mergedVars, execution.results);

        // Task 생성 및 실행
        const task = this.createTask(step.taskType, resolvedInput);

        // 완료 대기
        await this.waitForTask(task.id);

        const completedTask = this.tasks.get(task.id)!;
        if (completedTask.status === 'failed') {
          throw new Error(`Step failed: ${step.id} - ${completedTask.error}`);
        }

        execution.results[step.id] = completedTask.output;
        execution.completedSteps.push(step.id);
      }

      execution.status = 'completed';
      execution.completedAt = new Date();
      this.emitEvent('workflow:completed', execution);

    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      this.emitEvent('workflow:failed', { execution, error });
      throw error;
    }

    return execution;
  }

  private resolveStepInput(
    input: Record<string, unknown>,
    variables: Record<string, unknown>,
    results: Record<string, unknown>
  ): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        // $var.path 형식 해석
        if (value.startsWith('$')) {
          const path = value.slice(1).split('.');
          let current: unknown = path[0] === 'results' ? results : variables;
          for (const segment of path.slice(path[0] === 'results' ? 1 : 0)) {
            current = (current as Record<string, unknown>)?.[segment];
          }
          resolved[key] = current;
        } else {
          resolved[key] = value;
        }
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  private waitForTask(taskId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const task = this.tasks.get(taskId);
        if (!task) {
          clearInterval(checkInterval);
          reject(new Error('Task not found'));
          return;
        }

        if (task.status === 'completed' || task.status === 'failed') {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // 타임아웃
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Task timeout'));
      }, this.config.taskTimeout);
    });
  }

  // ============ 이벤트 ============

  private emitEvent(type: ConductorEventType, data: unknown): void {
    const event: ConductorEvent = {
      type,
      timestamp: new Date(),
      data,
    };
    this.emit(type, event);
    this.emit('*', event); // 모든 이벤트 수신용
  }

  onEvent(type: ConductorEventType | '*', handler: EventHandler): void {
    this.on(type, handler);
  }

  // ============ 유틸리티 ============

  private log(level: 'info' | 'warn' | 'error', message: string): void {
    if (!this.config.enableLogging) return;
    const timestamp = new Date().toISOString();
    console[level](`[Conductor ${timestamp}] ${message}`);
  }

  /**
   * 상태 조회
   */
  getStatus(): {
    agents: { total: number; idle: number; busy: number };
    tasks: { pending: number; running: number; completed: number; failed: number };
    providers: string[];
  } {
    const agents = Array.from(this.agents.values());
    const tasks = Array.from(this.tasks.values());

    return {
      agents: {
        total: agents.length,
        idle: agents.filter(a => a.status === 'idle').length,
        busy: agents.filter(a => a.status === 'busy').length,
      },
      tasks: {
        pending: tasks.filter(t => t.status === 'pending').length,
        running: tasks.filter(t => t.status === 'running').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length,
      },
      providers: Array.from(this.providers.keys()),
    };
  }
}

// 싱글톤 인스턴스
let conductorInstance: Conductor | null = null;

export function getConductor(config?: Partial<ConductorConfig>): Conductor {
  if (!conductorInstance) {
    conductorInstance = new Conductor(config);
  }
  return conductorInstance;
}
