/**
 * Swarm Mode Demo - Anime Maker
 *
 * 여러 에이전트가 동시에 애니메이션 제작 작업을 수행하는 예시
 */

import 'dotenv/config';
import { createAnimeSwarm, SwarmTask } from './SwarmOrchestrator';

async function runSwarmDemo() {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║     🐝 ANIME MAKER SWARM MODE DEMO          ║');
    console.log('╚════════════════════════════════════════════╝\n');

    // 1. Swarm 생성
    const swarm = createAnimeSwarm({ pattern: 'specialist' });
    swarm.printStatus();

    // 2. Hive Pattern 데모: 병렬 작업 처리
    console.log('\n📌 Demo 1: Hive Pattern (병렬 작업)');
    console.log('   여러 에이전트가 동시에 다른 작업 수행\n');

    const hiveTasks: SwarmTask[] = [
        swarm.createTask('story_planning', '스토리 아크 기획: 마법의 숲 모험'),
        swarm.createTask('character_design', '주인공 캐릭터 디자인: 고양이 미로'),
        swarm.createTask('character_design', '조연 캐릭터 디자인: 요정 빛나비'),
        swarm.createTask('environment_design', '배경 디자인: 마법의 숲'),
        swarm.createTask('environment_design', '배경 디자인: 요정의 집'),
        swarm.createTask('color_palette', '컬러 팔레트 설정: 판타지 테마'),
    ];

    const hiveResults = await swarm.runHivePattern(hiveTasks);
    console.log(`   ✅ Hive 완료: ${hiveResults.size}개 태스크 처리됨\n`);

    // 3. Pipeline Pattern 데모: 순차 처리
    console.log('\n📌 Demo 2: Pipeline Pattern (순차 처리)');
    console.log('   스토리 → 캐릭터 → 배경 → 애니메이션 순서\n');

    const pipelineStages = [
        'story_planning',
        'character_design',
        'environment_design',
        'motion_design',
        'voice_synthesis',
        'consistency_check',
    ];

    const pipelineResult = await swarm.runPipelinePattern(
        { theme: '마법의 숲에서 길을 잃은 고양이' },
        pipelineStages
    );
    console.log('   Pipeline 결과:', pipelineResult);

    // 4. Council Pattern 데모: 투표
    console.log('\n📌 Demo 3: Council Pattern (에이전트 투표)');
    console.log('   아트 스타일 결정을 위한 에이전트 투표\n');

    const winner = await swarm.runCouncilPattern(
        '이 애니메이션에 가장 적합한 아트 스타일은?',
        ['지브리 스타일', '신카이 마코토 스타일', '교토 애니메이션 스타일', '모던 플랫 스타일']
    );
    console.log(`   선택된 스타일: ${winner}\n`);

    // 5. 최종 상태
    swarm.printStatus();

    console.log('╔════════════════════════════════════════════╗');
    console.log('║     ✅ SWARM DEMO COMPLETE                  ║');
    console.log('╚════════════════════════════════════════════╝\n');
}

// 실행
runSwarmDemo().catch(console.error);
