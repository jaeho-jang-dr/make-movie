/**
 * Conductor 시스템 테스트
 */

import 'dotenv/config';
import { initializeConductor, quickStory, getConductor } from './conductor';
import { StoryOutput } from './agents/StoryWriterAgent';

async function main() {
  console.log('='.repeat(60));
  console.log('  Anime Maker - Conductor System Test');
  console.log('='.repeat(60));

  // 환경 변수 확인
  const envCheck = {
    GOOGLE_AI_API_KEY: !!process.env.GOOGLE_AI_API_KEY,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    XAI_API_KEY: !!process.env.XAI_API_KEY,
  };

  console.log('\n[Environment Check]');
  Object.entries(envCheck).forEach(([key, available]) => {
    console.log(`  ${available ? '✅' : '❌'} ${key}`);
  });

  if (!envCheck.GOOGLE_AI_API_KEY) {
    console.error('\n❌ GOOGLE_AI_API_KEY is required for story generation');
    console.log('   Set it in .env file or environment variable');
    process.exit(1);
  }

  // Conductor 초기화
  console.log('\n[Initializing Conductor...]');
  await initializeConductor();

  // 상태 확인
  const conductor = getConductor();
  const status = conductor.getStatus();
  console.log('\n[Conductor Status]');
  console.log(`  Agents: ${status.agents.total} (${status.agents.idle} idle)`);
  console.log(`  Providers: ${status.providers.join(', ')}`);

  // 이벤트 리스너 등록
  conductor.onEvent('*', (event) => {
    console.log(`  [Event] ${event.type} at ${event.timestamp.toISOString()}`);
  });

  // 테스트 스토리 생성
  console.log('\n[Test: Story Generation]');
  console.log('  Prompt: "학교에서 벌어지는 마법 소녀들의 우정 이야기"');

  try {
    const story = await quickStory({
      prompt: '학교에서 벌어지는 마법 소녀들의 우정 이야기',
      genre: 'fantasy',
      duration: 3, // 3분 (약 18씬)
    }) as StoryOutput;

    console.log('\n[Result]');
    console.log(`  Title: ${story.title}`);
    console.log(`  Synopsis: ${story.synopsis}`);
    console.log(`  Scenes: ${story.scenes?.length || 0}`);
    console.log(`  Total Duration: ${story.totalDuration}s`);

    if (story.scenes?.length > 0) {
      console.log('\n[First 3 Scenes]');
      story.scenes.slice(0, 3).forEach((scene, i) => {
        console.log(`\n  Scene ${i + 1}: ${scene.title}`);
        console.log(`    ${scene.description.slice(0, 100)}...`);
        console.log(`    Emotion: ${scene.emotion}`);
        console.log(`    Duration: ${scene.duration}s`);
      });
    }

    console.log('\n✅ Story generation successful!');

  } catch (error) {
    console.error('\n❌ Story generation failed:', error);
  }

  // 최종 상태
  const finalStatus = conductor.getStatus();
  console.log('\n[Final Status]');
  console.log(`  Completed Tasks: ${finalStatus.tasks.completed}`);
  console.log(`  Failed Tasks: ${finalStatus.tasks.failed}`);

  console.log('\n' + '='.repeat(60));
  console.log('  Test Complete');
  console.log('='.repeat(60));
}

main().catch(console.error);
