#!/usr/bin/env ts-node
/**
 * Anime Maker CLI
 * 8팀 25개 Agent + Squad 기반 애니메이션 제작 도구
 *
 * Claude가 Conductor로서 전체 파이프라인 지휘
 */

import 'dotenv/config';
import { Command } from 'commander';
import { TEAMS, PRODUCTION_PHASES, TOTAL_AGENTS } from '../config/teams';
import {
    initializeConductor,
    initializeFullConductor,
    runProduction,
    printSystemStatus,
} from '../conductor';
import { createStoryTeam, createProductionTeam, createArtTeam, createAllAgents } from '../agents';

const program = new Command();

program
    .name('anime-maker')
    .description('AI 기반 일본식 애니메이션 제작 CLI - 8팀 25 Agents + Squad System')
    .version('2.0.0');

// ============ 상태 명령어 ============

program
    .command('status')
    .description('시스템 상태 확인 (팀, 에이전트, API 키)')
    .action(async () => {
        printSystemStatus();
    });

// ============ 팀 명령어 ============

program
    .command('teams')
    .description('8개 팀 목록 및 상세 정보')
    .option('-v, --verbose', '에이전트 상세 정보 포함')
    .action((options) => {
        console.log('\n╔════════════════════════════════════════════╗');
        console.log('║          🎬 8 Production Teams              ║');
        console.log('╚════════════════════════════════════════════╝\n');

        TEAMS.forEach((team, i) => {
            console.log(`${i + 1}. ${team.nameKr} (${team.name})`);
            console.log(`   📝 ${team.description}`);
            console.log(`   🤖 Primary AI: ${team.primaryAI}`);
            console.log(`   👥 Agents: ${team.agents.length}개`);

            if (options.verbose) {
                team.agents.forEach(agent => {
                    console.log(`      - ${agent.name} [${agent.ai}]: ${agent.description}`);
                });
            }
            console.log('');
        });

        console.log(`총 ${TOTAL_AGENTS}개 에이전트\n`);
    });

// ============ 단계 명령어 ============

program
    .command('phases')
    .description('프로덕션 단계 (6단계 파이프라인)')
    .action(() => {
        console.log('\n╔════════════════════════════════════════════╗');
        console.log('║         📌 Production Phases                ║');
        console.log('╚════════════════════════════════════════════╝\n');

        PRODUCTION_PHASES.forEach(phase => {
            console.log(`Phase ${phase.order}: ${phase.nameKr} (${phase.name})`);
            console.log(`   📝 ${phase.description}`);
            console.log(`   👥 Teams: ${phase.teams.join(', ')}`);
            console.log(`   📋 Tasks: ${phase.tasks.join(', ')}`);
            console.log('');
        });
    });

// ============ 에이전트 명령어 ============

program
    .command('agents')
    .description('전체 25개 에이전트 목록')
    .option('-t, --team <team>', '특정 팀 에이전트만')
    .action((options) => {
        console.log('\n╔════════════════════════════════════════════╗');
        console.log('║           👥 25 Skill Agents                ║');
        console.log('╚════════════════════════════════════════════╝\n');

        let count = 0;
        TEAMS.forEach(team => {
            if (options.team && team.id !== options.team) return;

            console.log(`[${team.nameKr}]`);
            team.agents.forEach(agent => {
                count++;
                console.log(`  ${count}. ${agent.name}`);
                console.log(`     Role: ${agent.role}`);
                console.log(`     AI: ${agent.ai}`);
                console.log(`     Skills: ${agent.skills.join(', ')}`);
                console.log(`     Tasks: ${agent.taskTypes.join(', ')}`);
                console.log('');
            });
        });

        console.log(`총 ${count}개 에이전트\n`);
    });

// ============ 스토리 생성 명령어 ============

program
    .command('story')
    .description('스토리 생성 (Story Squad 활성화)')
    .requiredOption('-p, --prompt <text>', '스토리 주제')
    .option('-g, --genre <genre>', '장르', 'fantasy')
    .option('-d, --duration <minutes>', '분량 (분)', '5')
    .action(async (options) => {
        console.log('\n╔════════════════════════════════════════════╗');
        console.log('║          📜 Story Generation                ║');
        console.log('╚════════════════════════════════════════════╝\n');

        console.log(`Prompt: ${options.prompt}`);
        console.log(`Genre: ${options.genre}`);
        console.log(`Duration: ${options.duration}분\n`);

        try {
            const conductor = await initializeFullConductor();
            const squad = conductor.getSquad('story') as import('../conductor/SquadIntegration').StorySquadAgent;

            console.log('🎭 Story Squad 활성화...\n');
            const script = await squad.developStory(options.prompt);

            console.log('\n✅ 스토리 생성 완료!');
            console.log(`   제목: ${script.title}`);
            console.log(`   씬 수: ${script.scenes?.length || 0}`);
            console.log(`   캐릭터: ${script.characters?.map((c: any) => c.name).join(', ')}`);

            // 스크립트 미리보기
            if (script.scenes && script.scenes.length > 0) {
                console.log('\n[Scene Preview]');
                script.scenes.slice(0, 3).forEach((scene: any) => {
                    console.log(`  Scene ${scene.number}: ${scene.narration?.substring(0, 50)}...`);
                });
            }
        } catch (error) {
            console.error('\n❌ 스토리 생성 실패:', error);
        }
    });

// ============ 전체 파이프라인 명령어 ============

program
    .command('create')
    .description('애니메이션 전체 생성 (Full Pipeline - 6 Phases)')
    .requiredOption('-p, --prompt <text>', '스토리 주제')
    .option('-g, --genre <genre>', '장르', 'fantasy')
    .option('-d, --duration <minutes>', '분량 (분)', '3')
    .option('-s, --style <style>', '스타일', 'anime')
    .option('-o, --output <path>', '출력 경로', './output')
    .action(async (options) => {
        console.log('\n╔════════════════════════════════════════════╗');
        console.log('║     🎬 Full Production Pipeline             ║');
        console.log('╚════════════════════════════════════════════╝\n');

        console.log(`Prompt: ${options.prompt}`);
        console.log(`Genre: ${options.genre}`);
        console.log(`Duration: ${options.duration}분`);
        console.log(`Style: ${options.style}`);
        console.log(`Output: ${options.output}\n`);

        console.log('[Pipeline Phases]');
        PRODUCTION_PHASES.forEach(phase => {
            console.log(`  ${phase.order}. ${phase.nameKr} - ${phase.teams.join(', ')}`);
        });

        console.log('\n🚀 Starting production...\n');

        try {
            const result = await runProduction({
                theme: options.prompt,
                genre: options.genre,
                duration: parseInt(options.duration),
                outputPath: options.output,
            });

            console.log('\n╔════════════════════════════════════════════╗');
            console.log('║           🎉 Production Complete            ║');
            console.log('╚════════════════════════════════════════════╝\n');
            console.log(`Status: ${result.status}`);
            console.log(`Script: ${result.script?.title || 'N/A'}`);
            console.log(`Assets: ${result.assets.size}개`);
            console.log(`Output: ${result.video || options.output}`);
        } catch (error) {
            console.error('\n❌ Production failed:', error);
        }
    });

// ============ Squad 테스트 명령어 ============

program
    .command('squad <name>')
    .description('특정 Squad 테스트 (story, art, sound, grok)')
    .action(async (name: string) => {
        console.log(`\n🧪 Testing ${name} Squad...\n`);

        try {
            const conductor = await initializeFullConductor();

            switch (name) {
                case 'story':
                    console.log('Story Squad: Ready');
                    console.log(`  Status: ${conductor.getSquad('story').status}`);
                    break;
                case 'art':
                    console.log('Art Squad: Ready');
                    console.log(`  Status: ${conductor.getSquad('art').status}`);
                    break;
                case 'sound':
                    console.log('Sound Squad: Ready');
                    console.log(`  Status: ${conductor.getSquad('sound').status}`);
                    break;
                case 'grok':
                    console.log('Grok Agent: Ready');
                    console.log(`  Status: ${conductor.getSquad('grok').status}`);
                    break;
                default:
                    console.log(`Unknown squad: ${name}`);
                    console.log('Available: story, art, sound, grok');
            }
        } catch (error) {
            console.error('Squad test failed:', error);
        }
    });

// ============ 시스템 테스트 명령어 ============

program
    .command('test')
    .description('시스템 테스트 (Agent 인스턴스 생성)')
    .option('--full', '전체 Agent 생성 테스트')
    .action(async (options) => {
        console.log('\n╔════════════════════════════════════════════╗');
        console.log('║            🧪 System Test                   ║');
        console.log('╚════════════════════════════════════════════╝\n');

        console.log('[Creating Team Instances]');

        try {
            const storyTeam = createStoryTeam();
            console.log(`  ✅ Story Team: ${Object.keys(storyTeam).length} agents`);

            const productionTeam = createProductionTeam();
            console.log(`  ✅ Production Team: ${Object.keys(productionTeam).length} agents`);

            const artTeam = createArtTeam();
            console.log(`  ✅ Art Team: ${Object.keys(artTeam).length} agents`);

            if (options.full) {
                console.log('\n[Creating All Agents]');
                const allAgents = createAllAgents();
                console.log(`  ✅ Total: ${allAgents.size} agents`);

                allAgents.forEach((agent, id) => {
                    console.log(`     - ${id}: ${agent.status}`);
                });
            }

            console.log('\n[Agent Status]');
            console.log(`  Story Writer: ${storyTeam.writer.status}`);
            console.log(`  Story Reviewer: ${storyTeam.reviewer.status}`);
            console.log(`  Animator: ${productionTeam.animator.status}`);
            console.log(`  Voice Actor: ${productionTeam.voice.status}`);
            console.log(`  Image Generator: ${artTeam.imageGenerator.status}`);

            console.log('\n✅ All tests passed!');
        } catch (error) {
            console.error('❌ Test failed:', error);
        }
    });

// ============ Conductor 테스트 ============

program
    .command('conductor')
    .description('Conductor 초기화 테스트')
    .action(async () => {
        console.log('\n🎬 Initializing UnifiedConductor...\n');

        try {
            const conductor = await initializeFullConductor();
            const status = conductor.getStatus();

            console.log('[Conductor Status]');
            console.log(`  Agents: ${status.agents.total}개`);
            console.log(`  Squads: ${status.squads.join(', ')}`);
            console.log(`  Providers: ${status.providers.join(', ') || 'none'}`);
            console.log(`  Production: ${status.production.status}`);

            console.log('\n[Teams by Agent Count]');
            for (const [team, count] of Object.entries(status.agents.byTeam)) {
                console.log(`  ${team}: ${count}`);
            }

            console.log('\n✅ Conductor ready!');
        } catch (error) {
            console.error('❌ Conductor init failed:', error);
        }
    });

// 실행
program.parse();
