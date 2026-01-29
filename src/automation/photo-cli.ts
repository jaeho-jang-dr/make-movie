#!/usr/bin/env node
// src/automation/photo-cli.ts
// 사진 스토리북 생성 CLI

import { Command } from 'commander';
import * as dotenv from 'dotenv';
import { PhotoStoryGenerator } from './PhotoStoryGenerator';

dotenv.config();

const program = new Command();

program
  .name('photo-story')
  .description('사진 기반 어린이 스토리북 생성기 (토큰 절약 버전)')
  .version('1.0.0');

program
  .command('create')
  .description('새로운 사진 스토리북 생성')
  .requiredOption('-t, --title <title>', '스토리 제목')
  .option('-d, --duration <minutes>', '길이 (분)', '10')
  .option('-a, --age <age>', '대상 연령', '5')
  .option('--theme <theme>', '주제', '모험과 우정')
  .action(async (options) => {
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      console.error('❌ GOOGLE_AI_API_KEY가 설정되지 않았습니다.');
      console.error('   .env 파일을 확인해주세요.');
      process.exit(1);
    }

    const config = {
      title: options.title,
      duration: parseInt(options.duration),
      targetAge: options.age,
      theme: options.theme,
    };

    console.log('\n🎨 사진 스토리북 생성기 시작...\n');
    console.log('='.repeat(60));
    console.log(`📖 제목: ${config.title}`);
    console.log(`⏱️  길이: ${config.duration}분`);
    console.log(`👶 연령: ${config.targetAge}세`);
    console.log(`🎭 주제: ${config.theme}`);
    console.log('='.repeat(60) + '\n');

    try {
      const generator = new PhotoStoryGenerator(apiKey);
      await generator.generatePhotoStory(config);

      const dirname = config.title
        .replace(/[^a-zA-Z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();

      console.log('\n' + '='.repeat(60));
      console.log('🎉 생성 완료!');
      console.log('='.repeat(60));
      console.log('\n📂 생성된 파일:');
      console.log(`   스토리북 폴더: public/storybooks/${dirname}/`);
      console.log(`   HTML 뷰어: public/storybooks/${dirname}/index.html`);
      console.log(`   메타데이터: public/storybooks/${dirname}/metadata.json`);
      console.log('\n🌐 브라우저에서 열어보기:');
      console.log(`   file:///${process.cwd().replace(/\\/g, '/')}/public/storybooks/${dirname}/index.html`);
      console.log('\n💡 다음 단계:');
      console.log('   1. HTML 파일을 브라우저에서 열기');
      console.log('   2. 전체 재생 버튼으로 스토리 들어보기');
      console.log('   3. 나중에 이 사진들로 동영상 생성하기\n');

    } catch (error) {
      console.error('\n❌ 생성 실패:', error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('생성된 스토리북 목록 보기')
  .action(async () => {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      const storybooksDir = 'public/storybooks';
      const dirs = await fs.readdir(storybooksDir);

      console.log('\n📚 생성된 스토리북 목록:\n');
      console.log('='.repeat(60));

      for (const dir of dirs) {
        const metadataPath = path.join(storybooksDir, dir, 'metadata.json');
        try {
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
          console.log(`\n📖 ${metadata.title}`);
          console.log(`   길이: ${metadata.duration}분 | 장면: ${metadata.sceneCount}개`);
          console.log(`   연령: ${metadata.targetAge}세 | 주제: ${metadata.theme}`);
          console.log(`   생성: ${new Date(metadata.generatedAt).toLocaleString('ko-KR')}`);
          console.log(`   경로: public/storybooks/${dir}/index.html`);
        } catch (e) {
          console.log(`\n📁 ${dir} (메타데이터 없음)`);
        }
      }

      console.log('\n' + '='.repeat(60) + '\n');

    } catch (error) {
      console.error('❌ 스토리북 목록을 가져오지 못했습니다:', error);
    }
  });

program.parse(process.argv);
