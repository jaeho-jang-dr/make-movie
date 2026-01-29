// src/automation/PhotoStoryGenerator.ts
// 사진 기반 스토리북 생성기 (토큰 절약 버전)
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { HfInference } from '@huggingface/inference';
import { SVGIllustrationGenerator } from './SVGIllustrationGenerator';
import { promises as fs } from 'fs';
import * as path from 'path';

interface StoryConfig {
  title: string;
  duration: number; // 총 시간 (분)
  targetAge: string;
  theme: string;
}

interface Scene {
  sceneNumber: number;
  duration: number; // 초
  narration: string;
  backgroundDescription: string;
  characters: string[];
  actions: string[];
}

export class PhotoStoryGenerator {
  private genAI: GoogleGenerativeAI;
  private ttsClient: TextToSpeechClient;
  private geminiModel: any;
  private svgModel: any;
  private hfClient: HfInference;
  private svgGenerator: SVGIllustrationGenerator;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.ttsClient = new TextToSpeechClient();
    this.svgGenerator = new SVGIllustrationGenerator();

    // Gemini Pro 사용 (SVG 생성과 스토리 생성)
    this.geminiModel = this.genAI.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    // SVG 생성용 별도 모델 (JSON 형식 불필요)
    this.svgModel = this.genAI.getGenerativeModel({
      model: 'gemini-pro'
    });

    // Hugging Face 클라이언트 초기화
    const hfApiKey = process.env.HUGGING_FACE_API_KEY;
    if (!hfApiKey || hfApiKey === 'your_huggingface_api_key_here') {
      console.warn('⚠️ HUGGING_FACE_API_KEY가 설정되지 않았습니다. 플레이스홀더만 생성됩니다.');
      console.warn('   https://huggingface.co/settings/tokens 에서 API 키를 발급받으세요.');
    }
    this.hfClient = new HfInference(hfApiKey);
  }

  // 전체 스토리북 생성 프로세스
  async generatePhotoStory(config: StoryConfig): Promise<void> {
    console.log('\n🎨 사진 기반 스토리북 생성 시작...');
    console.log(`📖 제목: ${config.title}`);
    console.log(`⏱️ 길이: ${config.duration}분`);
    console.log(`👶 연령: ${config.targetAge}세`);
    console.log(`🎭 주제: ${config.theme}\n`);

    // 1단계: 스토리 생성
    const scenes = await this.generateStory(config);
    console.log(`✅ ${scenes.length}개 장면 생성 완료\n`);

    // 2단계: 이미지 생성
    await this.generateImages(scenes);
    console.log('✅ 모든 이미지 생성 완료\n');

    // 3단계: 나레이션 생성
    await this.generateNarration(scenes);
    console.log('✅ 모든 나레이션 생성 완료\n');

    // 4단계: HTML 스토리북 생성
    await this.generateHTMLStorybook(config, scenes);
    console.log('✅ HTML 스토리북 생성 완료\n');

    // 5단계: 메타데이터 저장
    await this.saveMetadata(config, scenes);
    console.log('✅ 메타데이터 저장 완료\n');

    console.log('🎉 사진 스토리북 생성 완료!');
    console.log(`📂 파일 위치: public/storybooks/${this.sanitizeFilename(config.title)}/`);
    console.log(`🌐 HTML 뷰어: public/storybooks/${this.sanitizeFilename(config.title)}/index.html`);
  }

  // 1단계: Gemini로 스토리 생성
  private async generateStory(config: StoryConfig): Promise<Scene[]> {
    console.log('📝 AI로 스토리 생성 중...');

    const prompt = `
당신은 어린이 동화 작가입니다. 다음 요구사항에 맞는 이야기를 만들어주세요:

- 제목: ${config.title}
- 총 길이: ${config.duration}분 (${config.duration * 60}초)
- 대상 연령: ${config.targetAge}세
- 주제: ${config.theme}

이야기를 ${Math.ceil(config.duration * 6)}개의 장면으로 나누어 JSON 형식으로 작성해주세요.
각 장면은 약 10초 분량입니다.

{
  "scenes": [
    {
      "sceneNumber": 1,
      "duration": 10,
      "narration": "나레이션 텍스트 (한국어, 어린이가 이해하기 쉽게)",
      "backgroundDescription": "배경 장면 상세 설명 (영어로, 이미지 생성용)",
      "characters": ["캐릭터 설명 (영어)"],
      "actions": ["일어나는 동작"]
    }
  ]
}

규칙:
- 모든 장면의 duration 합계는 정확히 ${config.duration * 60}초
- narration은 한국어, backgroundDescription과 characters는 영어
- 어린이에게 교훈적이고 재미있는 내용
- 각 장면은 시각적으로 명확해야 함

JSON만 출력하고 다른 설명은 넣지 마세요.
`;

    try {
      const result: any = await this.retryWithBackoff(() =>
        this.geminiModel.generateContent(prompt)
      );
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('유효한 JSON 응답을 받지 못했습니다');
      }

      const storyData = JSON.parse(jsonMatch[0]);
      return storyData.scenes;

    } catch (error) {
      console.error('⚠️ 스토리 생성 실패:', error);
      console.log('🔄 샘플 스토리를 사용합니다...');
      return this.getSampleStory(config.duration);
    }
  }

  // 2단계: 이미지 생성
  private async generateImages(scenes: Scene[]): Promise<void> {
    const useHF = process.env.HUGGING_FACE_API_KEY &&
                  process.env.HUGGING_FACE_API_KEY !== 'your_huggingface_api_key_here';

    console.log(`🎨 이미지 생성 중 (${useHF ? 'Hugging Face FLUX.1' : '프로그래밍 SVG 일러스트레이션'})...`);

    for (const scene of scenes) {
      try {
        console.log(`  장면 ${scene.sceneNumber}/${scenes.length}: ${scene.narration.substring(0, 30)}...`);

        if (useHF) {
          // Hugging Face로 PNG 이미지 생성
          const prompt = this.buildScenePrompt(scene);
          await this.generateImageWithHF(scene.sceneNumber, prompt);
          await this.sleep(2000);
        } else {
          // 프로그래밍 SVG 일러스트레이션 생성 (완전 무료, API 불필요)
          await this.createEnhancedPlaceholder(scene);
        }

      } catch (error) {
        console.error(`  ⚠️ 장면 ${scene.sceneNumber} 이미지 생성 실패:`, error);
        await this.createEnhancedPlaceholder(scene);
      }
    }
  }

  // Hugging Face로 이미지 생성
  private async generateImageWithHF(sceneNumber: number, prompt: string): Promise<void> {
    try {
      const result: any = await this.hfClient.textToImage({
        model: 'black-forest-labs/FLUX.1-schnell',
        inputs: prompt,
        parameters: {
          width: 1024,
          height: 768,
          num_inference_steps: 4
        }
      });

      const buffer = await result.arrayBuffer();
      const filename = `public/images/scene${sceneNumber}.png`;
      await fs.mkdir('public/images', { recursive: true });
      await fs.writeFile(filename, Buffer.from(buffer));
      console.log(`    ✅ 저장: scene${sceneNumber}.png`);

    } catch (error) {
      throw error;
    }
  }

  // Gemini로 SVG 일러스트레이션 생성 (구글 생태계, 무료)
  private async generateSVGWithGemini(scene: Scene): Promise<void> {
    const prompt = `
당신은 어린이 동화책 일러스트레이터입니다. 다음 장면에 대한 SVG 일러스트레이션을 만들어주세요.

장면 설명:
- 나레이션: ${scene.narration}
- 배경: ${scene.backgroundDescription}
- 캐릭터: ${scene.characters.join(', ')}
- 액션: ${scene.actions.join(', ')}

요구사항:
1. 1024x768 크기의 SVG
2. 어린이 동화책 스타일 (밝고 친근한 색상)
3. 간단하면서도 매력적인 디자인
4. 캐릭터는 귀엽고 친근하게
5. 배경은 장면 분위기에 맞게
6. SVG 코드만 출력 (설명 없이)

SVG 코드:`;

    try {
      const result: any = await this.retryWithBackoff(() =>
        this.svgModel.generateContent(prompt)
      );
      const response = await result.response;
      const text = response.text();

      // SVG 코드 추출
      let svgCode = text;

      // ```svg ... ``` 형식이면 추출
      const svgMatch = text.match(/```svg?\s*([\s\S]*?)```/);
      if (svgMatch) {
        svgCode = svgMatch[1];
      } else {
        // <svg ... </svg> 직접 찾기
        const directMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
        if (directMatch) {
          svgCode = directMatch[0];
        }
      }

      // SVG가 올바른 형식인지 확인
      if (!svgCode.includes('<svg')) {
        throw new Error('유효한 SVG 코드를 생성하지 못했습니다');
      }

      // 파일 저장
      const filename = `public/images/scene${scene.sceneNumber}.svg`;
      await fs.mkdir('public/images', { recursive: true });
      await fs.writeFile(filename, svgCode);
      console.log(`    ✅ 저장: scene${scene.sceneNumber}.svg (Gemini 생성)`);

    } catch (error) {
      console.error(`    ⚠️ Gemini SVG 생성 실패, 플레이스홀더 사용:`, error);
      await this.createEnhancedPlaceholder(scene);
    }
  }

  // 장면 통합 프롬프트 생성
  private buildScenePrompt(scene: Scene): string {
    const charDesc = scene.characters.length > 0 ? `, featuring ${scene.characters.join(' and ')}` : '';
    return `children's book illustration, ${scene.backgroundDescription}${charDesc}, soft watercolor style, warm pastel colors, friendly atmosphere, storybook art, professional digital art, 4K quality, no text`;
  }

  // 개선된 플레이스홀더 - SVG 일러스트레이션 생성기 사용
  private async createEnhancedPlaceholder(scene: Scene): Promise<void> {
    const svg = this.svgGenerator.generateIllustration(scene);

    await fs.mkdir('public/images', { recursive: true });
    await fs.writeFile(`public/images/scene${scene.sceneNumber}.svg`, svg);
    console.log(`    ✅ 저장: scene${scene.sceneNumber}.svg (프로그래밍 생성)`);
  }

  // 3단계: 나레이션 생성
  private async generateNarration(scenes: Scene[]): Promise<void> {
    console.log('🎙️ Google TTS로 나레이션 생성 중...');

    for (const scene of scenes) {
      console.log(`  장면 ${scene.sceneNumber}/${scenes.length} 음성 생성...`);

      const request = {
        input: { text: scene.narration },
        voice: {
          languageCode: 'ko-KR',
          name: 'ko-KR-Neural2-A',
        },
        audioConfig: {
          audioEncoding: 'MP3' as const,
          speakingRate: 0.9,
          pitch: 2.0,
          volumeGainDb: 0.0,
        },
      };

      try {
        const [response] = await this.ttsClient.synthesizeSpeech(request);

        if (response.audioContent) {
          const filename = `public/audio/scene${scene.sceneNumber}.mp3`;
          await fs.mkdir('public/audio', { recursive: true });
          await fs.writeFile(filename, response.audioContent, 'binary');
          console.log(`    ✅ 저장: scene${scene.sceneNumber}.mp3`);
        }

      } catch (error) {
        console.error(`  ⚠️ 장면 ${scene.sceneNumber} 음성 생성 실패:`, error);
      }
    }
  }

  // 4단계: HTML 스토리북 생성
  private async generateHTMLStorybook(config: StoryConfig, scenes: Scene[]): Promise<void> {
    console.log('📄 HTML 스토리북 생성 중...');

    const dirname = this.sanitizeFilename(config.title);
    const storybookDir = `public/storybooks/${dirname}`;
    await fs.mkdir(storybookDir, { recursive: true });

    // 이미지와 오디오 파일 복사
    for (const scene of scenes) {
      const imgSrc = `public/images/scene${scene.sceneNumber}.png`;
      const imgSrcSvg = `public/images/scene${scene.sceneNumber}.svg`;
      const imgDest = `${storybookDir}/scene${scene.sceneNumber}.png`;
      const imgDestSvg = `${storybookDir}/scene${scene.sceneNumber}.svg`;
      const audioSrc = `public/audio/scene${scene.sceneNumber}.mp3`;
      const audioDest = `${storybookDir}/scene${scene.sceneNumber}.mp3`;

      try {
        await fs.copyFile(imgSrc, imgDest);
      } catch {
        try {
          await fs.copyFile(imgSrcSvg, imgDestSvg);
        } catch (e) {
          console.warn(`    ⚠️ 장면 ${scene.sceneNumber} 이미지 복사 실패`);
        }
      }

      try {
        await fs.copyFile(audioSrc, audioDest);
      } catch (e) {
        console.warn(`    ⚠️ 장면 ${scene.sceneNumber} 오디오 복사 실패`);
      }
    }

    // HTML 생성
    const html = this.generateHTMLContent(config, scenes);
    await fs.writeFile(`${storybookDir}/index.html`, html);
    console.log(`  ✅ 스토리북 HTML 생성 완료`);
  }

  // HTML 컨텐츠 생성
  private generateHTMLContent(config: StoryConfig, scenes: Scene[]): string {
    const sceneCards = scenes.map(scene => {
      const hasImage = true; // 이미지는 항상 있다고 가정 (PNG 또는 SVG)
      return `
        <div class="scene-card" id="scene-${scene.sceneNumber}">
          <div class="scene-number">장면 ${scene.sceneNumber}</div>
          <div class="scene-image">
            <img src="scene${scene.sceneNumber}.png"
                 onerror="this.onerror=null; this.src='scene${scene.sceneNumber}.svg';"
                 alt="장면 ${scene.sceneNumber}">
          </div>
          <div class="scene-narration">
            <p>${scene.narration}</p>
          </div>
          <div class="scene-controls">
            <audio id="audio-${scene.sceneNumber}" src="scene${scene.sceneNumber}.mp3"></audio>
            <button onclick="playAudio(${scene.sceneNumber})">🔊 들어보기</button>
            <button onclick="stopAudio(${scene.sceneNumber})">⏸️ 정지</button>
          </div>
        </div>
      `;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title} - 사진 스토리북</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Noto Sans KR', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      background: white;
      border-radius: 20px;
      padding: 40px;
      margin-bottom: 30px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }

    .header h1 {
      font-size: 3em;
      color: #333;
      margin-bottom: 10px;
    }

    .header p {
      font-size: 1.2em;
      color: #666;
    }

    .controls {
      background: white;
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: center;
      gap: 20px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .controls button {
      background: #667eea;
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 10px;
      font-size: 1.1em;
      cursor: pointer;
      transition: all 0.3s;
    }

    .controls button:hover {
      background: #764ba2;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }

    .scene-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 30px;
      margin-bottom: 50px;
    }

    .scene-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      transition: transform 0.3s;
    }

    .scene-card:hover {
      transform: translateY(-5px);
    }

    .scene-number {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      font-size: 1.3em;
      font-weight: bold;
      text-align: center;
    }

    .scene-image {
      width: 100%;
      height: 400px;
      overflow: hidden;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .scene-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .scene-narration {
      padding: 30px;
      font-size: 1.2em;
      line-height: 1.8;
      color: #333;
      min-height: 150px;
    }

    .scene-controls {
      padding: 20px;
      border-top: 2px solid #f0f0f0;
      display: flex;
      gap: 10px;
      justify-content: center;
    }

    .scene-controls button {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1em;
      transition: all 0.2s;
    }

    .scene-controls button:hover {
      background: #764ba2;
    }

    .footer {
      background: white;
      border-radius: 20px;
      padding: 30px;
      text-align: center;
      color: #666;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .playing {
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    @media (max-width: 768px) {
      .scene-grid {
        grid-template-columns: 1fr;
      }

      .header h1 {
        font-size: 2em;
      }

      .controls {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${config.title}</h1>
      <p>총 ${scenes.length}개 장면 · ${config.duration}분 · ${config.targetAge}세</p>
    </div>

    <div class="controls">
      <button onclick="playAll()">▶️ 전체 재생</button>
      <button onclick="stopAll()">⏹️ 모두 정지</button>
      <button onclick="downloadStory()">💾 스토리 다운로드</button>
    </div>

    <div class="scene-grid">
      ${sceneCards}
    </div>

    <div class="footer">
      <p>🎨 Google AI + Hugging Face로 생성된 스토리북</p>
      <p>생성 시간: ${new Date().toLocaleString('ko-KR')}</p>
    </div>
  </div>

  <script>
    let currentScene = 0;
    let isPlayingAll = false;

    function playAudio(sceneNumber) {
      const audio = document.getElementById('audio-' + sceneNumber);
      const card = document.getElementById('scene-' + sceneNumber);

      stopAll();

      // 자동 스크롤 (부드럽게)
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });

      audio.play();
      card.classList.add('playing');

      audio.onended = () => {
        card.classList.remove('playing');
        if (isPlayingAll && sceneNumber < ${scenes.length}) {
          setTimeout(() => playAudio(sceneNumber + 1), 500);
        } else {
          isPlayingAll = false;
        }
      };
    }

    function stopAudio(sceneNumber) {
      const audio = document.getElementById('audio-' + sceneNumber);
      const card = document.getElementById('scene-' + sceneNumber);

      audio.pause();
      audio.currentTime = 0;
      card.classList.remove('playing');
    }

    function playAll() {
      isPlayingAll = true;
      playAudio(1);
    }

    function stopAll() {
      isPlayingAll = false;
      for (let i = 1; i <= ${scenes.length}; i++) {
        stopAudio(i);
      }
    }

    function downloadStory() {
      const metadata = {
        title: "${config.title}",
        duration: ${config.duration},
        targetAge: "${config.targetAge}",
        theme: "${config.theme}",
        scenes: ${JSON.stringify(scenes, null, 2)}
      };

      const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '${this.sanitizeFilename(config.title)}-metadata.json';
      a.click();
    }

    // 키보드 단축키
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlayingAll) {
          stopAll();
        } else {
          playAll();
        }
      }
    });
  </script>
</body>
</html>`;
  }

  // 5단계: 메타데이터 저장
  private async saveMetadata(config: StoryConfig, scenes: Scene[]): Promise<void> {
    const dirname = this.sanitizeFilename(config.title);
    const metadata = {
      title: config.title,
      duration: config.duration,
      targetAge: config.targetAge,
      theme: config.theme,
      generatedAt: new Date().toISOString(),
      sceneCount: scenes.length,
      scenes: scenes
    };

    const metadataPath = `public/storybooks/${dirname}/metadata.json`;
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  // 유틸리티: 파일명 정리
  private sanitizeFilename(title: string): string {
    return title
      .replace(/[^a-zA-Z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  // 유틸리티: 대기
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 유틸리티: 재시도 로직
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        if (error?.status === 429 || error?.message?.includes('quota')) {
          const waitTime = Math.pow(2, i) * 2000;
          console.log(`⏳ API 할당량 초과. ${waitTime/1000}초 대기 후 재시도... (${i+1}/${maxRetries})`);
          await this.sleep(waitTime);
        } else {
          throw error;
        }
      }
    }
    throw new Error('최대 재시도 횟수 초과');
  }

  // 프로그래밍으로 다양한 스토리 생성 (API 실패 시)
  private getSampleStory(duration: number): Scene[] {
    const scenesPerMinute = 6;
    const totalScenes = duration * scenesPerMinute;
    const sceneDuration = 10;

    // 스토리 템플릿
    const storyTemplates = [
      // 모험 이야기
      { narration: "옛날 아주 먼 옛날, 평화로운 숲속 마을에 호기심 많은 아기 토끼가 살고 있었어요.", bg: "peaceful forest village with houses, sunny day, green trees", chars: ["cute white rabbit"], actions: ["looking around curiously"] },
      { narration: "어느 화창한 날, 토끼는 숲 너머 미지의 세계로 모험을 떠나기로 결심했답니다.", bg: "forest path leading to adventure, blue sky, butterflies", chars: ["white rabbit with backpack"], actions: ["walking with determination"] },
      { narration: "길을 걷다 토끼는 반짝이는 신비한 나비를 만났어요. '안녕? 나랑 같이 놀래?'", bg: "magical forest path with glowing elements", chars: ["white rabbit", "glowing butterfly"], actions: ["chasing playfully"] },
      { narration: "나비를 따라 도착한 곳에는 무지개색 폭포가 흐르고 있었어요. 정말 아름다운 풍경이었죠.", bg: "rainbow waterfall with magical flowers", chars: ["white rabbit"], actions: ["looking amazed"] },
      { narration: "갑자기 작은 새가 나타나서 말했어요. '여기는 마법의 숲이란다. 조심해야 해!'", bg: "enchanted forest with mysterious atmosphere", chars: ["white rabbit", "wise little bird"], actions: ["talking together"] },
      { narration: "토끼는 새 친구와 함께 숲속 깊은 곳으로 들어갔어요. 모험이 계속되었죠.", bg: "deep forest with tall trees and shadows", chars: ["white rabbit", "little bird"], actions: ["exploring together"] },

      // 우정 이야기
      { narration: "숲속에서 토끼는 길을 잃은 작은 다람쥐를 발견했어요. 다람쥐는 울고 있었답니다.", bg: "forest clearing with worried atmosphere", chars: ["white rabbit", "crying squirrel"], actions: ["comforting"] },
      { narration: "'걱정하지 마. 내가 도와줄게!' 토끼는 용감하게 말했어요.", bg: "friendly forest scene with warm sunlight", chars: ["white rabbit", "squirrel"], actions: ["helping"] },
      { narration: "둘은 함께 다람쥐의 집을 찾아 나섰어요. 서로 힘을 합쳐서요.", bg: "forest path with adventure mood", chars: ["white rabbit", "squirrel"], actions: ["searching together"] },
      { narration: "큰 바위 뒤에서 다람쥐의 집을 발견했어요! 다람쥐는 정말 기뻐했답니다.", bg: "tree house behind a big rock", chars: ["white rabbit", "happy squirrel"], actions: ["celebrating"] },

      // 배움 이야기
      { narration: "어느 날 현명한 올빼미 할아버지가 토끼에게 말했어요. '인생에는 소중한 교훈이 있단다.'", bg: "wise owl's tree house at twilight", chars: ["white rabbit", "wise owl"], actions: ["listening carefully"] },
      { narration: "'친구를 돕는 것이 가장 큰 기쁨이란다.' 올빼미가 가르쳐 주었어요.", bg: "peaceful evening forest scene", chars: ["white rabbit", "wise owl"], actions: ["learning"] },
      { narration: "토끼는 올빼미의 말을 가슴 깊이 새겼어요. 정말 멋진 교훈이었죠.", bg: "thoughtful scene with stars appearing", chars: ["white rabbit"], actions: ["thinking deeply"] },

      // 도전 이야기
      { narration: "숲속에 높은 언덕이 나타났어요. 토끼는 올라갈 수 있을까요?", bg: "tall hill with challenging path", chars: ["white rabbit"], actions: ["looking up at challenge"] },
      { narration: "'나는 할 수 있어!' 토끼는 용기를 내어 한 걸음씩 올라가기 시작했어요.", bg: "hill climb scene with determination", chars: ["white rabbit"], actions: ["climbing bravely"] },
      { narration: "힘들었지만 포기하지 않았어요. 친구들이 응원해 주었답니다.", bg: "climbing scene with friends cheering", chars: ["white rabbit", "animal friends"], actions: ["encouraging"] },
      { narration: "드디어 정상에 도착했어요! 아름다운 풍경이 펼쳐졌답니다.", bg: "mountain top with beautiful view", chars: ["white rabbit"], actions: ["celebrating success"] },

      // 계절 이야기
      { narration: "봄이 왔어요. 숲속 곳곳에 예쁜 꽃들이 피어났답니다.", bg: "spring forest with blooming flowers", chars: ["white rabbit"], actions: ["enjoying flowers"] },
      { narration: "여름이 왔어요. 시원한 개울에서 물장난을 치며 놀았어요.", bg: "summer stream with cool water", chars: ["white rabbit", "friends"], actions: ["playing in water"] },
      { narration: "가을이 왔어요. 나뭇잎이 빨갛고 노랗게 물들었답니다.", bg: "autumn forest with colorful leaves", chars: ["white rabbit"], actions: ["collecting leaves"] },
      { narration: "겨울이 왔어요. 하얀 눈이 소복소복 내렸어요.", bg: "winter forest with snow", chars: ["white rabbit"], actions: ["playing in snow"] },

      // 밤 이야기
      { narration: "해가 지고 밤이 되었어요. 하늘에 별들이 반짝이기 시작했답니다.", bg: "night sky with twinkling stars", chars: ["white rabbit"], actions: ["stargazing"] },
      { narration: "달님이 밝게 빛나며 길을 비춰주었어요. 정말 아름다웠죠.", bg: "moonlit forest path", chars: ["white rabbit"], actions: ["walking under moonlight"] },
      { narration: "반딧불이들이 춤을 추며 토끼와 함께 놀았어요.", bg: "night forest with fireflies", chars: ["white rabbit", "fireflies"], actions: ["dancing together"] },

      // 축제 이야기
      { narration: "오늘은 숲속 동물들의 축제날이에요! 모두가 모였답니다.", bg: "forest festival with decorations", chars: ["white rabbit", "many animals"], actions: ["celebrating"] },
      { narration: "맛있는 음식도 먹고, 재미있는 게임도 했어요.", bg: "festival games and food", chars: ["white rabbit", "friends"], actions: ["playing games"] },
      { narration: "다같이 노래를 부르며 춤을 췄어요. 정말 즐거운 하루였죠.", bg: "festival dance scene", chars: ["all animals"], actions: ["dancing and singing"] },

      // 마무리 이야기
      { narration: "하루의 모험을 마치고 토끼는 집으로 돌아왔어요.", bg: "sunset over the forest", chars: ["white rabbit"], actions: ["walking home"] },
      { narration: "따뜻한 집에서 오늘 있었던 일들을 생각했어요.", bg: "cozy home interior at evening", chars: ["white rabbit"], actions: ["resting at home"] },
      { narration: "정말 멋진 하루였어요. 내일은 또 어떤 모험이 기다릴까요?", bg: "peaceful bedroom with stars outside", chars: ["white rabbit"], actions: ["sleeping peacefully"] },
      { narration: "토끼는 행복한 꿈을 꾸며 잠이 들었답니다. 좋은 밤 되세요!", bg: "dreamy night scene with sleeping rabbit", chars: ["white rabbit"], actions: ["dreaming"] }
    ];

    const scenes: Scene[] = [];
    for (let i = 1; i <= totalScenes; i++) {
      // 템플릿을 순환하며 사용 (템플릿보다 장면이 많으면 반복)
      const template = storyTemplates[(i - 1) % storyTemplates.length];

      scenes.push({
        sceneNumber: i,
        duration: sceneDuration,
        narration: template.narration,
        backgroundDescription: template.bg,
        characters: template.chars,
        actions: template.actions
      });
    }

    return scenes;
  }
}
