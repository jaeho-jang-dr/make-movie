// src/automation/cli.ts
import { Command } from 'commander';
import { GoogleStoryVideoGenerator } from './GoogleStoryGenerator';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';

dotenv.config({ path: '.env.local' });
dotenv.config();

const execAsync = promisify(exec);

const program = new Command();

program
  .name('google-story-video')
  .description('Google AI로 어린이 이야기 동영상 자동 생성')
  .version('1.0.0');

program
  .command('create')
  .description('새로운 스토리 동영상 생성')
  .option('-t, --title <title>', '동영상 제목', '마법의 모험')
  .option('-d, --duration <minutes>', '동영상 길이 (분)', '10')
  .option('-a, --age <age>', '대상 연령', '5-7세')
  .option('--theme <theme>', '스토리 주제', '우정과 용기')
  .action(async (options) => {
    console.log('🎬 Google AI로 스토리 동영상 생성 시작!\n');
    console.log(`📌 제목: ${options.title}`);
    console.log(`⏱️ 길이: ${options.duration}분`);
    console.log(`👶 연령: ${options.age}`);
    console.log(`🎨 주제: ${options.theme}\n`);

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.error('❌ GOOGLE_AI_API_KEY가 설정되지 않았습니다.');
      console.error('   .env 파일에 GOOGLE_AI_API_KEY를 추가해주세요.');
      process.exit(1);
    }

    const generator = new GoogleStoryVideoGenerator(apiKey);

    try {
      const startTime = Date.now();

      // 1. 스토리 생성
      console.log('📝 [1/6] Gemini 2.0로 스토리 생성 중...');
      const scenes = await generator.generateStory({
        title: options.title,
        duration: parseInt(options.duration),
        targetAge: options.age,
        theme: options.theme
      });
      console.log(`✅ ${scenes.length}개 씬 생성 완료\n`);
      
      // 생성된 스토리 미리보기
      console.log('📖 생성된 스토리:');
      scenes.forEach(scene => {
        console.log(`  씬 ${scene.sceneNumber}: ${scene.narration.substring(0, 50)}...`);
      });
      console.log('');

      // 2. 이미지 생성
      console.log('🎨 [2/6] Imagen 3으로 이미지 생성 중...');
      console.log('   (시간이 걸릴 수 있습니다)\n');
      await generator.generateImages(scenes);
      console.log('✅ 이미지 생성 완료\n');

      // 3. 나레이션 생성
      console.log('🎙️ [3/6] Google Cloud TTS로 나레이션 생성 중...');
      await generator.generateNarration(scenes);
      console.log('✅ 나레이션 생성 완료\n');

      // 4. Remotion 컴포넌트 생성
      console.log('⚛️ [4/6] Remotion 컴포넌트 자동 생성 중...');
      await generator.generateRemotionComponents(scenes);
      console.log('✅ 컴포넌트 생성 완료\n');

      // 5. 동영상 렌더링
      console.log('🎥 [5/6] 동영상 렌더링 중...');
      console.log('   (10분 영상은 15-30분 정도 소요될 수 있습니다)\n');
      
      const outputFile = `output/${options.title.replace(/\s+/g, '-')}.mp4`;
      await fs.mkdir('output', { recursive: true });
      await execAsync(
        `npx remotion render src/index.ts StoryVideo ${outputFile} --concurrency 4`
      );
      
      const endTime = Date.now();
      const totalTime = Math.round((endTime - startTime) / 1000 / 60);
      
      console.log('\n🎉 완성! 동영상이 생성되었습니다!\n');
      console.log(`📁 파일 위치: ${outputFile}`);
      console.log(`⏱️ 총 소요 시간: ${totalTime}분\n`);

    } catch (error) {
      console.error('\n❌ 오류 발생:', error);
      if (error instanceof Error) {
        console.error('   상세:', error.message);
      }
      process.exit(1);
    }
  });

program
  .command('preview')
  .description('생성된 동영상 미리보기')
  .action(async () => {
    console.log('🎬 Remotion 미리보기 실행 중...\n');
    try {
      await execAsync('npm run preview');
    } catch (error) {
      console.error('미리보기 실행 오류:', error);
    }
  });

program
  .command('batch')
  .description('여러 개 동영상 한 번에 생성')
  .option('-f, --file <file>', 'JSON 파일 경로', 'stories.json')
  .action(async (options) => {
    console.log('📦 배치 생성 시작...\n');

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.error('❌ GOOGLE_AI_API_KEY가 설정되지 않았습니다.');
      process.exit(1);
    }

    try {
      const fileContent = await fs.readFile(options.file, 'utf-8');
      const stories = JSON.parse(fileContent);
      
      console.log(`📋 총 ${stories.length}개 동영상 생성 예정\n`);

      const generator = new GoogleStoryVideoGenerator(apiKey);

      for (let i = 0; i < stories.length; i++) {
        const story = stories[i];
        console.log(`\n[${i + 1}/${stories.length}] "${story.title}" 생성 중...`);

        const scenes = await generator.generateStory(story);
        await generator.generateImages(scenes);
        await generator.generateNarration(scenes);
        await generator.generateRemotionComponents(scenes);

        const outputFile = `output/${story.title.replace(/\s+/g, '-')}.mp4`;
        await execAsync(
          `npx remotion render src/index.ts StoryVideo ${outputFile} --concurrency 4`
        );

        console.log(`✅ "${story.title}" 완료!`);
      }

      console.log('\n🎉 모든 동영상 생성 완료!');

    } catch (error) {
      console.error('배치 생성 오류:', error);
      process.exit(1);
    }
  });

program
  .command('from-json <file>')
  .description('기존 씬 JSON 파일로 동영상 생성 (스토리 생성 건너뜀)')
  .option('-t, --title <title>', '동영상 제목', 'Generated Video')
  .action(async (file, options) => {
    console.log(`📂 JSON 파일에서 로드 중: ${file}`);
    
    const apiKey = process.env.GOOGLE_AI_API_KEY || 'placeholder'; // Allow placeholder if just rendering
    const generator = new GoogleStoryVideoGenerator(apiKey);

    try {
      const fileContent = await fs.readFile(file, 'utf-8');
      const scenes = JSON.parse(fileContent);
      
      console.log(`✅ ${scenes.length}개 씬 로드 완료`);

      // 2. 이미지 생성
      console.log('🎨 [2/6] 이미지 생성 중... (Imagen 3/Hugging Face)');
      await generator.generateImages(scenes);

      // 3. 나레이션 생성
      console.log('🎙️ [3/6] 나레이션 생성 중...');
      await generator.generateNarration(scenes);

      // 4. Remotion 컴포넌트 생성
      console.log('⚛️ [4/6] Remotion 컴포넌트 생성 중...');
      await generator.generateRemotionComponents(scenes);

      // 5. 동영상 렌더링
      console.log('🎥 [5/6] 동영상 렌더링 중...');
      const outputFile = `output/${options.title.replace(/\s+/g, '-')}.mp4`;
      await fs.mkdir('output', { recursive: true });
      await execAsync(
        `npx remotion render src/index.ts StoryVideo ${outputFile} --concurrency 4`
      );

      console.log(`\n🎉 완성! ${outputFile}`);

    } catch (error) {
      console.error('❌ 오류:', error);
      process.exit(1);
    }
  });



// --- V2 Command: Multi-Agent Director ---
import { MultiAgentDirector } from './MultiAgentDirector';

program
  .command('create-movie')
  .description('에이전트 스쿼드 기반 고품질 동영상 생성 (V2)')
  .option('-t, --title <title>', '동영상 제목', '모험의 시작')
  .option('-d, --duration <minutes>', '동영상 길이 (분)', '10')
  .option('--theme <theme>', '스토리 주제', '판타지')
  .action(async (options) => {
    console.log('🎬 [V2] Multi-Agent Director Start!\n');
    console.log(`📌 Title: ${options.title}`);
    console.log(`⏱️ Duration: ${options.duration} min`);
    
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.error('❌ GOOGLE_AI_API_KEY Missing');
      process.exit(1);
    }

    const director = new MultiAgentDirector(apiKey);

    try {
      // 1. Start Production (Script, Assets, Code)
      await director.startProduction({
        title: options.title,
        durationMinutes: parseInt(options.duration),
        theme: options.theme
      });

      // 2. Switch Entry Point to V2
      console.log('🔄 Updating Remotion Entry Point...');
      const indexContent = `import { registerRoot } from 'remotion';
import { RemotionRootV2 } from './RootV2';

registerRoot(RemotionRootV2);`;
      await fs.writeFile('src/index.ts', indexContent);

      // 3. Render
      console.log('🎥 Rendering Final Video (V2)...');
      const outputFile = `output/${options.title.replace(/\s+/g, '-')}-v2.mp4`;
      await execAsync(
        `npx remotion render src/index.ts StoryVideoV2 ${outputFile} --concurrency 4`
      );

      console.log(`\n🎉 V2 Movie Generated: ${outputFile}`);

    } catch (error) {
      console.error('❌ Production Failed:', error);
      process.exit(1);
    }
  });


// --- V3 Command: The Blockbuster Squad ---
import { DirectorV3 } from './DirectorV3';

program
  .command('create-movie-v3')
  .description('V3 스쿼드 시스템 (Grandma, Kid, Art 5 Agents) 기반 동영상 생성')
  .option('--theme <theme>', '스토리 주제', 'Classic meets Modern')
  .action(async (options) => {
    console.log('🎬 [V3] BLOCKBUSTER SQUAD SYSTEM START!\n');

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    const grokApiKey = process.env.GROK_API_KEY;

    if (!apiKey && !grokApiKey) {
      console.error('❌ GOOGLE_AI_API_KEY or GROK_API_KEY required');
      process.exit(1);
    }

    const director = new DirectorV3(apiKey || 'placeholder', grokApiKey);

    try {
      await director.produceMoviePreview(options.theme);

      // Switch Entry Point to V3
      console.log('🔄 Updating Remotion Entry Point to V3...');
      const indexContent = `import { registerRoot } from 'remotion';
import { RemotionRootV3 } from './RootV3';

registerRoot(RemotionRootV3);`;
      await fs.writeFile('src/index.ts', indexContent);

      console.log('\n🎉 V3 Ready! Run preview: npm run preview');
      // We do not auto-render here, as the user said "Let's see it after fixing".
      // We instruct them to preview first.

    } catch (error) {
      console.error('❌ V3 Production Failed:', error);
      process.exit(1);
    }
  });

// --- V3 Enhanced Command: Professional Pipeline ---
import { DirectorV3Enhanced } from './DirectorV3Enhanced';

program
  .command('create-pro')
  .description('🎬 전문 파이프라인: 에셋 기획 → 생성 → 조립 (Grok 필수)')
  .option('--theme <theme>', '스토리 주제', '친구와 용기')
  .action(async (options) => {
    console.log('🎬 [PROFESSIONAL PRODUCTION] START!\n');

    const grokApiKey = process.env.GROK_API_KEY;
    if (!grokApiKey) {
      console.error('❌ GROK_API_KEY required for professional production');
      console.error('   Set GROK_API_KEY in .env.local');
      process.exit(1);
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY || 'placeholder';
    const director = new DirectorV3Enhanced(apiKey, grokApiKey);

    try {
      await director.produceMovieEnhanced(options.theme);

      // Update entry point
      console.log('\n🔄 Updating Remotion Entry Point...');
      const indexContent = `import { registerRoot } from 'remotion';
import { RemotionRootV3Enhanced } from './RootV3Enhanced';

registerRoot(RemotionRootV3Enhanced);`;
      await fs.writeFile('src/index.ts', indexContent);

      console.log('\n✅ Production Ready!');
      console.log('\n📺 Next Steps:');
      console.log('   Preview: npm run preview');
      console.log('   Render:  npx remotion render src/index.ts StoryVideoV3Enhanced output/professional.mp4');

    } catch (error) {
      console.error('❌ Production Failed:', error);
      if (error instanceof Error) {
        console.error('   Details:', error.message);
      }
      process.exit(1);
    }
  });

program.parse();
