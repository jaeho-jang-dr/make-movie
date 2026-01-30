/**
 * Conductor 시스템 타입 정의
 */

import { AIProviderType } from '../providers/types';

// ============ Task & Job Types ============

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type TaskPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Task {
  id: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  input: unknown;
  output?: unknown;
  error?: string;
  assignedAgent?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  metadata?: Record<string, unknown>;
}

export type TaskType =
  // 스토리 관련
  | 'story:generate'
  | 'story:review'
  | 'story:revise'
  // 캐릭터 관련
  | 'character:design'
  | 'character:generate'
  | 'character:expression'
  // 영상 관련
  | 'video:animate'
  | 'video:lipsync'
  | 'video:compose'
  // 오디오 관련
  | 'audio:tts'
  | 'audio:bgm'
  | 'audio:sfx'
  // 출력
  | 'export:render'
  | 'export:preview';

// ============ Agent Types ============

export interface AgentCapability {
  taskTypes: TaskType[];
  provider?: AIProviderType;
  skills: string[];
  maxConcurrent: number;
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  capabilities: AgentCapability;
  status: 'idle' | 'busy' | 'offline';
  currentTask?: string;
}

export type AgentRole =
  | 'story_writer'      // 스토리 작성 (Gemini)
  | 'story_reviewer'    // 스토리 검증 (Claude)
  | 'dialogue_writer'   // 대사 작성 (Grok)
  | 'character_designer'// 캐릭터 디자인 (ComfyUI)
  | 'animator'          // 애니메이션 생성
  | 'voice_actor'       // TTS
  | 'editor'            // 편집/합성
  | 'coordinator';      // 조율 (Conductor)

// ============ Workflow Types ============

export interface WorkflowStep {
  id: string;
  taskType: TaskType;
  agent?: AgentRole;
  input: Record<string, unknown>;
  dependsOn?: string[];
  condition?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  variables?: Record<string, unknown>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: TaskStatus;
  currentStep?: string;
  completedSteps: string[];
  results: Record<string, unknown>;
  startedAt: Date;
  completedAt?: Date;
}

// ============ Event Types ============

export type ConductorEventType =
  | 'task:created'
  | 'task:started'
  | 'task:completed'
  | 'task:failed'
  | 'agent:assigned'
  | 'agent:released'
  | 'workflow:started'
  | 'workflow:step'
  | 'workflow:completed'
  | 'workflow:failed';

export interface ConductorEvent {
  type: ConductorEventType;
  timestamp: Date;
  data: unknown;
}

export type EventHandler = (event: ConductorEvent) => void | Promise<void>;

// ============ Conductor Config ============

export interface ConductorConfig {
  maxConcurrentTasks: number;
  taskTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableLogging: boolean;
  providers: {
    story: AIProviderType;
    review: AIProviderType;
    dialogue: AIProviderType;
  };
}

export const DEFAULT_CONDUCTOR_CONFIG: ConductorConfig = {
  maxConcurrentTasks: 5,
  taskTimeout: 60000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableLogging: true,
  providers: {
    story: 'gemini',
    review: 'claude',
    dialogue: 'grok',
  },
};
