/**
 * Squad Integration Layer
 * 기존 Squad 시스템과 새로운 Agent 시스템을 통합
 */

import { StorySquad, V3Script, V3Scene, V3Character } from '../automation/agents/StorySquad';
import { ArtSquad, StyleGuide } from '../automation/agents/ArtSquad';
import { SoundSquad } from '../automation/agents/SoundSquad';
import { GrokAgent } from '../automation/agents/GrokAgent';
import { BaseAgent, AgentContext, AgentResult } from '../agents/BaseAgent';

// ============ Squad Wrapper Agents ============

/**
 * StorySquad를 Agent 인터페이스로 래핑
 */
export class StorySquadAgent extends BaseAgent {
    private squad: StorySquad | null = null;

    constructor() {
        super({
            name: 'Story Squad',
            role: 'story_writer',
            capabilities: {
                taskTypes: ['story:generate'],
                provider: 'gemini',
                skills: ['develop_story', 'brainstorm', 'synthesize'],
                maxConcurrent: 1,
            },
        });
    }

    private ensureSquad(): StorySquad {
        if (!this.squad) {
            const geminiKey = process.env.GOOGLE_AI_API_KEY || '';
            const grokKey = process.env.XAI_API_KEY;
            this.squad = new StorySquad(geminiKey, grokKey);
        }
        return this.squad;
    }

    async execute(context: AgentContext): Promise<AgentResult> {
        this.assignTask(context.taskId);
        try {
            const input = context.input as { theme: string };
            const squad = this.ensureSquad();
            const script = await squad.developStory(input.theme);
            this.releaseTask();
            return { success: true, output: script };
        } catch (error) {
            this.releaseTask();
            return { success: false, error: String(error) };
        }
    }

    // 직접 호출용 헬퍼
    async developStory(theme: string): Promise<V3Script> {
        const squad = this.ensureSquad();
        return squad.developStory(theme);
    }
}

/**
 * ArtSquad를 Agent 인터페이스로 래핑
 */
export class ArtSquadAgent extends BaseAgent {
    private squad: ArtSquad | null = null;

    constructor() {
        super({
            name: 'Art Squad',
            role: 'character_designer',
            capabilities: {
                taskTypes: ['character:design', 'character:generate'],
                provider: 'gemini',
                skills: ['establish_style', 'create_background', 'create_character'],
                maxConcurrent: 1,
            },
        });
    }

    private ensureSquad(): ArtSquad {
        if (!this.squad) {
            const geminiKey = process.env.GOOGLE_AI_API_KEY || '';
            this.squad = new ArtSquad(geminiKey);
        }
        return this.squad;
    }

    async execute(context: AgentContext): Promise<AgentResult> {
        this.assignTask(context.taskId);
        try {
            const input = context.input as { script?: V3Script };
            if (input.script) {
                const squad = this.ensureSquad();
                const style = await squad.establishStyle(input.script);
                this.releaseTask();
                return { success: true, output: style };
            }
            this.releaseTask();
            return { success: false, error: 'Invalid input' };
        } catch (error) {
            this.releaseTask();
            return { success: false, error: String(error) };
        }
    }

    // 직접 호출용 헬퍼
    async establishStyle(script: V3Script): Promise<StyleGuide> {
        const squad = this.ensureSquad();
        return squad.establishStyle(script);
    }

    async createBackground(description: string, style: StyleGuide): Promise<string> {
        const squad = this.ensureSquad();
        return squad.createBackground(description, style);
    }

    async createCharacter(char: V3Character, action: string, style: StyleGuide): Promise<string> {
        const squad = this.ensureSquad();
        return squad.createCharacter(char, action, style);
    }
}

/**
 * SoundSquad를 Agent 인터페이스로 래핑
 */
export class SoundSquadAgent extends BaseAgent {
    private squad: SoundSquad | null = null;

    constructor() {
        super({
            name: 'Sound Squad',
            role: 'voice_actor',
            capabilities: {
                taskTypes: ['audio:tts'],
                provider: 'local',
                skills: ['cast_voices', 'record_scene', 'dubbing'],
                maxConcurrent: 1,
            },
        });
    }

    private ensureSquad(): SoundSquad {
        if (!this.squad) {
            this.squad = new SoundSquad();
        }
        return this.squad;
    }

    async execute(context: AgentContext): Promise<AgentResult> {
        this.assignTask(context.taskId);
        try {
            const input = context.input as { characters?: V3Character[] };
            if (input.characters) {
                const squad = this.ensureSquad();
                const voiceMap = await squad.castVoices(input.characters);
                this.releaseTask();
                return { success: true, output: voiceMap };
            }
            this.releaseTask();
            return { success: false, error: 'Invalid input' };
        } catch (error) {
            this.releaseTask();
            return { success: false, error: String(error) };
        }
    }

    // 직접 호출용 헬퍼
    async castVoices(characters: V3Character[]): Promise<Map<string, unknown>> {
        const squad = this.ensureSquad();
        return squad.castVoices(characters);
    }

    async recordScene(scene: V3Scene, voiceMap: Map<string, unknown>): Promise<string> {
        const squad = this.ensureSquad();
        return squad.recordScene(scene, voiceMap);
    }
}

/**
 * GrokAgent를 Agent 인터페이스로 래핑
 */
export class GrokSquadAgent extends BaseAgent {
    private grok: GrokAgent | null = null;

    constructor() {
        super({
            name: 'Grok Agent',
            role: 'story_writer',
            capabilities: {
                taskTypes: ['story:generate'],
                provider: 'grok',
                skills: ['generate_content', 'creative_writing', 'dialogue'],
                maxConcurrent: 1,
            },
        });
    }

    private ensureGrok(): GrokAgent {
        if (!this.grok) {
            const grokKey = process.env.XAI_API_KEY || '';
            this.grok = new GrokAgent(grokKey);
        }
        return this.grok;
    }

    async execute(context: AgentContext): Promise<AgentResult> {
        this.assignTask(context.taskId);
        try {
            const input = context.input as { prompt: string; system?: string };
            const grok = this.ensureGrok();
            const content = await grok.generateContent(input.prompt, input.system);
            this.releaseTask();
            return { success: true, output: content };
        } catch (error) {
            this.releaseTask();
            return { success: false, error: String(error) };
        }
    }

    // 직접 호출용 헬퍼
    async generateContent(prompt: string, systemInstruction?: string): Promise<string> {
        const grok = this.ensureGrok();
        return grok.generateContent(prompt, systemInstruction);
    }
}

// ============ Integration Factory ============

/**
 * 통합 Squad 팩토리
 */
export function createIntegratedSquads() {
    return {
        storySquad: new StorySquadAgent(),
        artSquad: new ArtSquadAgent(),
        soundSquad: new SoundSquadAgent(),
        grokAgent: new GrokSquadAgent(),
    };
}

/**
 * Squad ID로 래핑된 Agent 생성
 */
export function createSquadAgent(squadId: string): BaseAgent {
    switch (squadId) {
        case 'story-squad':
            return new StorySquadAgent();
        case 'art-squad':
            return new ArtSquadAgent();
        case 'sound-squad':
            return new SoundSquadAgent();
        case 'grok-agent':
            return new GrokSquadAgent();
        default:
            throw new Error(`Unknown squad: ${squadId}`);
    }
}
