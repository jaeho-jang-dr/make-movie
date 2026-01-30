/**
 * Conductor 시스템 진입점
 *
 * 8팀 25개 Agent + 기존 Squad 시스템 통합 관리
 * Claude가 전체 프로덕션 파이프라인 지휘
 */

// Types & Core
export * from './types';
export { Conductor, getConductor } from './Conductor';
export * from './workflows';

// Squad Integration (기존 시스템)
export * from './SquadIntegration';

// Unified Conductor (통합 시스템)
export { UnifiedConductor, getUnifiedConductor, initializeUnifiedConductor } from './UnifiedConductor';

// ============ Imports ============
import { Conductor, getConductor } from './Conductor';
import { UnifiedConductor, getUnifiedConductor } from './UnifiedConductor';
import { createStoryTeam, createProductionTeam, createArtTeam, createAllAgents } from '../agents';
import { WORKFLOW_TEMPLATES } from './workflows';
import { listRegisteredSkills } from '../skills';
import { TEAMS, TOTAL_AGENTS, PRODUCTION_PHASES } from '../config/teams';

// ============ 기본 Conductor 초기화 ============

/**
 * 기본 Conductor 초기화 및 Agent 등록
 */
export async function initializeConductor(): Promise<Conductor> {
    const conductor = getConductor();

    // 스토리 팀 등록
    const { writer, reviewer } = createStoryTeam();
    conductor.registerAgent({
        name: writer.name,
        role: writer.role,
        capabilities: writer.capabilities,
    });
    conductor.registerAgent({
        name: reviewer.name,
        role: reviewer.role,
        capabilities: reviewer.capabilities,
    });

    // 프로덕션 팀 등록
    const production = createProductionTeam();
    conductor.registerAgent({
        name: production.animator.name,
        role: production.animator.role,
        capabilities: production.animator.capabilities,
    });
    conductor.registerAgent({
        name: production.voice.name,
        role: production.voice.role,
        capabilities: production.voice.capabilities,
    });

    // 아트 팀 등록
    const art = createArtTeam();
    conductor.registerAgent({
        name: art.imageGenerator.name,
        role: art.imageGenerator.role,
        capabilities: art.imageGenerator.capabilities,
    });

    // 워크플로우 등록
    Object.values(WORKFLOW_TEMPLATES).forEach(template => {
        conductor.registerWorkflow(template);
    });

    console.log('\n=== Conductor Initialized ===');
    const status = conductor.getStatus();
    console.log(`Agents: ${status.agents.total}`);
    console.log(`Providers: ${status.providers.join(', ') || 'none'}`);
    console.log('');

    try {
        listRegisteredSkills();
    } catch (e) {
        // Skip if skills not available
    }

    return conductor;
}

// ============ 통합 Conductor 초기화 (권장) ============

/**
 * 통합 Conductor 초기화
 * 8팀 25개 Agent + Squad 시스템 전체 활성화
 */
export async function initializeFullConductor(): Promise<UnifiedConductor> {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║     🎬 Anime Maker - UnifiedConductor      ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║  Teams: ${TEAMS.length}개                                  ║`);
    console.log(`║  Agents: ${TOTAL_AGENTS}개                                ║`);
    console.log(`║  Phases: ${PRODUCTION_PHASES.length}개                                 ║`);
    console.log('╚════════════════════════════════════════════╝\n');

    const conductor = getUnifiedConductor();
    return conductor;
}

// ============ 유틸리티 함수 ============

/**
 * 간편 스토리 생성
 */
export async function quickStory(options: {
    prompt: string;
    genre?: string;
    duration?: number;
}): Promise<unknown> {
    const conductor = getConductor();

    const task = conductor.createTask('story:generate', {
        prompt: options.prompt,
        genre: options.genre || '일반',
        duration: options.duration || 5,
    });

    return new Promise((resolve, reject) => {
        conductor.onEvent('task:completed', (event) => {
            if (event.data && (event.data as { id: string }).id === task.id) {
                resolve((event.data as { output: unknown }).output);
            }
        });

        conductor.onEvent('task:failed', (event) => {
            if (event.data && (event.data as { id: string }).id === task.id) {
                reject(new Error((event.data as { error: string }).error));
            }
        });
    });
}

/**
 * 전체 프로덕션 실행
 */
export async function runProduction(options: {
    theme: string;
    genre?: string;
    duration?: number;
    outputPath?: string;
}) {
    const conductor = await initializeFullConductor();
    return conductor.runFullProduction(options);
}

/**
 * 시스템 상태 출력
 */
export function printSystemStatus(): void {
    console.log('\n=== Anime Maker System Status ===\n');
    console.log(`📋 Teams: ${TEAMS.length}개`);
    console.log(`👥 Total Agents: ${TOTAL_AGENTS}개`);
    console.log(`📌 Production Phases: ${PRODUCTION_PHASES.length}개\n`);

    console.log('[Teams]');
    TEAMS.forEach((team, i) => {
        console.log(`  ${i + 1}. ${team.nameKr} (${team.name}): ${team.agents.length} agents`);
    });

    console.log('\n[Phases]');
    PRODUCTION_PHASES.forEach(phase => {
        console.log(`  ${phase.order}. ${phase.nameKr}: ${phase.teams.join(', ')}`);
    });

    console.log('\n[API Keys]');
    console.log(`  Gemini:   ${process.env.GOOGLE_AI_API_KEY ? '✅' : '❌'}`);
    console.log(`  Claude:   ${process.env.ANTHROPIC_API_KEY ? '✅' : '❌'}`);
    console.log(`  Grok:     ${process.env.XAI_API_KEY ? '✅' : '❌'}`);
    console.log(`  ComfyUI:  ${process.env.COMFYUI_URL || 'http://127.0.0.1:8188'}\n`);
}
