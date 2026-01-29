// src/automation/cli.ts
import { Command } from 'commander';
import { GoogleStoryVideoGenerator } from './GoogleStoryGenerator';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';

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

program.parse();
