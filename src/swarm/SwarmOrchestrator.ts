/**
 * Anime Maker - Swarm Mode Orchestrator
 *
 * Claude Code Swarm 패턴을 활용한 멀티 에이전트 오케스트레이션
 * 여러 전문 에이전트가 동시에 작업을 수행
 */

import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';

// ============ Swarm Types ============

export type SwarmPattern = 'hive' | 'pipeline' | 'council' | 'watchdog' | 'specialist';

export interface SwarmAgent {
    id: string;
    name: string;
    role: string;
    specialty: string[];
    status: 'idle' | 'working' | 'waiting' | 'done';
    currentTask?: SwarmTask;
}

export interface SwarmTask {
    id: string;
    type: string;
    description: string;
    priority: 'low' | 'normal' | 'high' | 'critical';
    status: 'pending' | 'claimed' | 'in_progress' | 'review' | 'done' | 'failed';
    assignedTo?: string;
    dependencies?: string[];
    result?: unknown;
    createdAt: Date;
    completedAt?: Date;
}

export interface SwarmMessage {
    from: string;
    to: string | 'all';
    type: 'task_claim' | 'task_complete' | 'request_help' | 'vote' | 'broadcast';
    content: string;
    data?: unknown;
    timestamp: Date;
}

// ============ Swarm Configuration ============

export interface SwarmConfig {
    pattern: SwarmPattern;
    maxAgents: number;
    taskTimeout: number;
    enableVoting: boolean;
    autoScale: boolean;
}

const DEFAULT_SWARM_CONFIG: SwarmConfig = {
    pattern: 'specialist',
    maxAgents: 8,
    taskTimeout: 300000, // 5분
    enableVoting: false,
    autoScale: true,
};

// ============ Anime Maker Swarm Agents ============

const ANIME_SWARM_AGENTS: Omit<SwarmAgent, 'id' | 'status'>[] = [
    {
        name: 'StoryMaster',
        role: 'leader',
        specialty: ['story_planning', 'scene_direction', 'narrative_flow'],
    },
    {
        name: 'CharacterArchitect',
        role: 'specialist',
        specialty: ['character_design', 'personality', 'visual_prompt'],
    },
    {
        name: 'BackgroundArtist',
        role: 'specialist',
        specialty: ['environment_design', 'mood_setting', 'color_palette'],
    },
    {
        name: 'AnimationDirector',
        role: 'specialist',
        specialty: ['motion_design', 'timing', 'transitions'],
    },
    {
        name: 'AudioEngineer',
        role: 'specialist',
        specialty: ['voice_synthesis', 'sound_design', 'music_selection'],
    },
    {
        name: 'QualityGuardian',
        role: 'watchdog',
        specialty: ['consistency_check', 'error_detection', 'style_validation'],
    },
    {
        name: 'RenderOptimizer',
        role: 'specialist',
        specialty: ['performance', 'compression', 'export_settings'],
    },
    {
        name: 'LocalizationExpert',
        role: 'specialist',
        specialty: ['translation', 'cultural_adaptation', 'subtitle_timing'],
    },
];

// ============ Swarm Orchestrator ============

export class SwarmOrchestrator extends EventEmitter {
    private config: SwarmConfig;
    private agents: Map<string, SwarmAgent> = new Map();
    private taskBoard: Map<string, SwarmTask> = new Map();
    private messageQueue: SwarmMessage[] = [];
    private isRunning: boolean = false;

    constructor(config: Partial<SwarmConfig> = {}) {
        super();
        this.config = { ...DEFAULT_SWARM_CONFIG, ...config };
        this.initializeAgents();
    }

    // ============ 초기화 ============

    private initializeAgents(): void {
        for (const agentDef of ANIME_SWARM_AGENTS) {
            const agent: SwarmAgent = {
                id: uuid(),
                ...agentDef,
                status: 'idle',
            };
            this.agents.set(agent.id, agent);
        }
        console.log(`🐝 Swarm 초기화: ${this.agents.size}개 에이전트 준비`);
    }

    // ============ Task Board ============

    createTask(type: string, description: string, options: Partial<SwarmTask> = {}): SwarmTask {
        const task: SwarmTask = {
            id: uuid(),
            type,
            description,
            priority: options.priority || 'normal',
            status: 'pending',
            dependencies: options.dependencies || [],
            createdAt: new Date(),
        };
        this.taskBoard.set(task.id, task);
        this.emit('task:created', task);
        console.log(`📋 Task 생성: [${task.type}] ${task.description.substring(0, 50)}...`);
        return task;
    }

    getTaskBoard(): SwarmTask[] {
        return Array.from(this.taskBoard.values());
    }

    getPendingTasks(): SwarmTask[] {
        return this.getTaskBoard().filter(t => t.status === 'pending');
    }

    // ============ Agent Management ============

    getAgents(): SwarmAgent[] {
        return Array.from(this.agents.values());
    }

    getIdleAgents(): SwarmAgent[] {
        return this.getAgents().filter(a => a.status === 'idle');
    }

    findBestAgent(task: SwarmTask): SwarmAgent | null {
        const idleAgents = this.getIdleAgents();

        // 전문성 매칭
        for (const agent of idleAgents) {
            if (agent.specialty.some(s => task.type.includes(s) || task.description.includes(s))) {
                return agent;
            }
        }

        // 전문성 매칭 없으면 아무 idle 에이전트
        return idleAgents[0] || null;
    }

    // ============ Message System ============

    sendMessage(message: Omit<SwarmMessage, 'timestamp'>): void {
        const msg: SwarmMessage = {
            ...message,
            timestamp: new Date(),
        };
        this.messageQueue.push(msg);
        this.emit('message', msg);

        if (message.to === 'all') {
            console.log(`📢 [${message.from}] → ALL: ${message.content}`);
        } else {
            console.log(`💬 [${message.from}] → [${message.to}]: ${message.content}`);
        }
    }

    // ============ Swarm Patterns ============

    /**
     * Hive Pattern: 모든 에이전트가 공유 큐에서 작업
     */
    async runHivePattern(tasks: SwarmTask[]): Promise<Map<string, unknown>> {
        console.log('\n🐝 === HIVE PATTERN START ===');
        const results = new Map<string, unknown>();

        // 모든 태스크를 보드에 추가
        for (const task of tasks) {
            this.taskBoard.set(task.id, task);
        }

        // 에이전트들이 자유롭게 태스크 선택
        while (this.getPendingTasks().length > 0) {
            const pending = this.getPendingTasks();
            const idle = this.getIdleAgents();

            for (const agent of idle) {
                const task = pending.find(t =>
                    !t.dependencies?.length ||
                    t.dependencies.every(d => this.taskBoard.get(d)?.status === 'done')
                );

                if (task) {
                    await this.assignAndExecute(agent, task, results);
                }
            }

            // 잠시 대기
            await this.delay(100);
        }

        console.log('🐝 === HIVE PATTERN COMPLETE ===\n');
        return results;
    }

    /**
     * Pipeline Pattern: 순차적 단계별 처리
     */
    async runPipelinePattern(input: unknown, stages: string[]): Promise<unknown> {
        console.log('\n🔗 === PIPELINE PATTERN START ===');
        let currentData = input;

        for (const stage of stages) {
            console.log(`  📍 Stage: ${stage}`);
            const agent = this.getAgents().find(a => a.specialty.includes(stage));

            if (agent) {
                const task = this.createTask(stage, `Pipeline stage: ${stage}`);
                task.status = 'in_progress';
                agent.status = 'working';
                agent.currentTask = task;

                // 시뮬레이션 (실제 구현에서는 AI 호출)
                await this.delay(500);
                currentData = { ...currentData as object, [`${stage}_processed`]: true };

                task.status = 'done';
                task.result = currentData;
                agent.status = 'idle';
                console.log(`    ✅ ${agent.name} completed ${stage}`);
            }
        }

        console.log('🔗 === PIPELINE PATTERN COMPLETE ===\n');
        return currentData;
    }

    /**
     * Council Pattern: 에이전트 투표/토론
     */
    async runCouncilPattern(topic: string, options: string[]): Promise<string> {
        console.log('\n🏛️ === COUNCIL PATTERN START ===');
        console.log(`   Topic: ${topic}`);

        const votes: Map<string, number> = new Map();
        options.forEach(o => votes.set(o, 0));

        for (const agent of this.getAgents()) {
            // 각 에이전트가 투표 (시뮬레이션)
            const choice = options[Math.floor(Math.random() * options.length)];
            votes.set(choice, (votes.get(choice) || 0) + 1);

            this.sendMessage({
                from: agent.name,
                to: 'all',
                type: 'vote',
                content: `I vote for: ${choice}`,
                data: { choice },
            });
        }

        // 결과 집계
        let winner = '';
        let maxVotes = 0;
        for (const [option, count] of votes) {
            console.log(`   ${option}: ${count} votes`);
            if (count > maxVotes) {
                maxVotes = count;
                winner = option;
            }
        }

        console.log(`   🏆 Winner: ${winner}`);
        console.log('🏛️ === COUNCIL PATTERN COMPLETE ===\n');
        return winner;
    }

    /**
     * Watchdog Pattern: 백그라운드 모니터링
     */
    startWatchdog(checkInterval: number = 5000): void {
        console.log('\n🐕 Watchdog started');

        const watchdog = this.getAgents().find(a => a.role === 'watchdog');
        if (!watchdog) return;

        setInterval(() => {
            // 작업 중인 태스크 모니터링
            const inProgress = this.getTaskBoard().filter(t => t.status === 'in_progress');

            for (const task of inProgress) {
                const elapsed = Date.now() - task.createdAt.getTime();
                if (elapsed > this.config.taskTimeout) {
                    this.sendMessage({
                        from: watchdog.name,
                        to: 'all',
                        type: 'broadcast',
                        content: `⚠️ Task timeout: ${task.description}`,
                    });
                }
            }
        }, checkInterval);
    }

    // ============ Execution ============

    private async assignAndExecute(
        agent: SwarmAgent,
        task: SwarmTask,
        results: Map<string, unknown>
    ): Promise<void> {
        task.status = 'claimed';
        task.assignedTo = agent.id;
        agent.status = 'working';
        agent.currentTask = task;

        this.sendMessage({
            from: agent.name,
            to: 'all',
            type: 'task_claim',
            content: `Claiming task: ${task.description}`,
        });

        task.status = 'in_progress';

        // 작업 실행 (시뮬레이션)
        await this.delay(Math.random() * 1000 + 500);

        task.status = 'done';
        task.completedAt = new Date();
        task.result = { completed: true, by: agent.name };
        results.set(task.id, task.result);

        agent.status = 'idle';
        agent.currentTask = undefined;

        this.sendMessage({
            from: agent.name,
            to: 'all',
            type: 'task_complete',
            content: `Completed: ${task.description}`,
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ============ Status ============

    getStatus(): object {
        return {
            pattern: this.config.pattern,
            agents: {
                total: this.agents.size,
                idle: this.getIdleAgents().length,
                working: this.getAgents().filter(a => a.status === 'working').length,
            },
            tasks: {
                total: this.taskBoard.size,
                pending: this.getPendingTasks().length,
                completed: this.getTaskBoard().filter(t => t.status === 'done').length,
            },
            messages: this.messageQueue.length,
        };
    }

    printStatus(): void {
        console.log('\n🐝 === SWARM STATUS ===');
        console.log(`Pattern: ${this.config.pattern}`);
        console.log('\nAgents:');
        for (const agent of this.getAgents()) {
            const taskInfo = agent.currentTask ? ` → ${agent.currentTask.description.substring(0, 30)}...` : '';
            console.log(`  [${agent.status.padEnd(7)}] ${agent.name} (${agent.role})${taskInfo}`);
        }
        console.log('\nTask Board:');
        for (const task of this.getTaskBoard().slice(-5)) {
            console.log(`  [${task.status.padEnd(11)}] ${task.description.substring(0, 50)}`);
        }
        console.log('========================\n');
    }
}

// ============ Export ============

export function createAnimeSwarm(config?: Partial<SwarmConfig>): SwarmOrchestrator {
    return new SwarmOrchestrator(config);
}
