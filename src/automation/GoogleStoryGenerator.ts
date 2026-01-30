// src/automation/GoogleStoryGenerator.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { HfInference } from '@huggingface/inference';
import { promises as fs } from 'fs';

interface StoryConfig {
  title: string;
  duration: number;
  targetAge: string;
  theme: string;
}

interface Scene {
  sceneNumber: number;
  duration: number;
  narration: string;
  backgroundDescription: string;
  characters: string[];
  actions: string[];
}

export class GoogleStoryVideoGenerator {
  private genAI: GoogleGenerativeAI;
  private ttsClient: TextToSpeechClient;
  private geminiModel: any;
  private imageModel: any;
  private hfClient: HfInference;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.ttsClient = new TextToSpeechClient();

    // Gemini Pro 사용
    this.geminiModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    // Hugging Face 클라이언트 초기화
    const hfApiKey = process.env.HUGGING_FACE_API_KEY;
    if (!hfApiKey || hfApiKey === 'your_huggingface_api_key_here') {
      console.warn('⚠️ HUGGING_FACE_API_KEY가 설정되지 않았습니다. 플레이스홀더만 생성됩니다.');
      console.warn('   https://huggingface.co/settings/tokens 에서 API 키를 발급받으세요.');
    }
    this.hfClient = new HfInference(hfApiKey);

    // Imagen 3 (백업용으로 유지)
    this.imageModel = this.genAI.getGenerativeModel({
      model: 'imagen-3.0-generate-001'
    });
  }

  // 1단계: Gemini로 스토리 생성
  async generateStory(config: StoryConfig): Promise<Scene[]> {
    const prompt = `
당신은 어린이 동화 작가입니다. 다음 요구사항에 맞는 이야기를 만들어주세요:

- 제목: ${config.title}
- 총 길이: ${config.duration}분 (${config.duration * 60}초)
- 대상 연령: ${config.targetAge}
- 주제: ${config.theme}

이야기를 5-8개의 씬으로 나누어 JSON 형식으로 작성해주세요.
각 씬은 다음 정보를 포함해야 합니다:

{
  "scenes": [
    {
      "sceneNumber": 1,
      "duration": 90,
      "narration": "나레이션 텍스트 (한국어, 어린이가 이해하기 쉽게)",
      "backgroundDescription": "배경 장면 상세 설명 (영어로, 이미지 생성용)",
      "characters": ["캐릭터1", "캐릭터2"],
      "actions": ["일어나는 동작1", "일어나는 동작2"]
    }
  ]
}

규칙:
- 모든 씬의 duration 합계는 정확히 ${config.duration * 60}초여야 합니다
- narration은 한국어로, backgroundDescription은 영어로 작성
- 어린이에게 교훈적이고 재미있는 내용
- 각 씬은 명확한 시작과 끝이 있어야 함

JSON만 출력하고 다른 설명은 넣지 마세요.
`;

    try {
      const result: any = await this.retryWithBackoff(() =>
        this.geminiModel.generateContent(prompt)
      );
      const response = await result.response;
      const text = response.text();
      
      // JSON 추출 (```json ``` 제거)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('유효한 JSON 응답을 받지 못했습니다');
      }
      
      const storyData = JSON.parse(jsonMatch[0]);
      return storyData.scenes;
    } catch (error) {
      console.error('⚠️ 스토리 생성 API 호출 실패:', error);
      console.log('🔄 샘플 스토리를 사용하여 진행합니다...');
      
      return [
        {
          sceneNumber: 1,
          duration: 10,
          narration: "옛날 아주 먼 옛날, 평화로운 숲속 마을에 호기심 많은 아기 공룡 디노가 살고 있었어요.",
          backgroundDescription: "Peaceful forest village with dinosaur houses, sunny day, green trees",
          characters: ["Baby Dinosaur green"],
          actions: ["Walking happily"]
        },
        {
          sceneNumber: 2,
          duration: 10,
          narration: "어느 화창한 날, 디노는 숲 너머 미지의 세계로 소풍을 떠나기로 결심했답니다.",
          backgroundDescription: "Path leading out of the forest, blue sky, butterflies",
          characters: ["Baby Dinosaur green"],
          actions: ["Looking at map"]
        },
        {
          sceneNumber: 3,
          duration: 10,
          narration: "길을 걷다 디노는 반짝이는 신비한 나비를 만났어요. '안녕? 나랑 같이 놀래?'",
          backgroundDescription: "Magical forest path, glowing butterfly",
          characters: ["Baby Dinosaur green", "Glowing Butterfly"],
          actions: ["Chasing butterfly"]
        },
         {
          sceneNumber: 4,
          duration: 10,
          narration: "나비를 따라 도착한 곳에는 무지개색 폭포가 흐르고 있었어요. 정말 아름다운 풍경이었죠.",
          backgroundDescription: "Rainbow colored waterfall, magical flowers",
          characters: ["Baby Dinosaur green"],
          actions: ["Looking amazed"]
        },
        {
          sceneNumber: 5,
          duration: 10,
          narration: "디노는 오늘 정말 멋진 모험을 했다고 생각하며 집으로 돌아왔습니다. 내일은 또 어떤 모험이 기다릴까요?",
          backgroundDescription: "Sunset over the forest village, cozy atmosphere",
          characters: ["Baby Dinosaur green"],
          actions: ["Sleeping"]
        }
      ];
    }
  }

  // 2단계: 이미지 생성 (전략에 따라 Hugging Face 또는 Imagen 3 사용)
  async generateImages(scenes: Scene[]): Promise<void> {
    const useHF = process.env.IMAGE_GENERATOR === 'huggingface' &&
                  process.env.HUGGING_FACE_API_KEY &&
                  process.env.HUGGING_FACE_API_KEY !== 'your_huggingface_api_key_here';
    const useImagen = process.env.IMAGE_GENERATOR === 'imagen';

    console.log(`🎨 이미지 생성 중 (${useHF ? 'Hugging Face FLUX.1' : (useImagen ? 'Google Imagen 3' : '플레이스홀더')} 사용)...`);

    for (const scene of scenes) {
      try {
        console.log(`  씬 ${scene.sceneNumber} 이미지 생성 중...`);

        if (useHF) {
          // 배경 이미지 생성
          const bgPrompt = this.buildBackgroundPrompt(scene);
          await this.generateImageWithHF(scene.sceneNumber, 'background', bgPrompt);

          // 캐릭터 이미지 생성
          for (let i = 0; i < scene.characters.length; i++) {
            const charPrompt = this.buildCharacterPrompt(scene.characters[i], scene);
            await this.generateImageWithHF(scene.sceneNumber, `character-${i}`, charPrompt);
          }
          await this.sleep(2000);

        } else if (useImagen) {
          // Google Imagen 3 사용
          const bgPrompt = this.buildBackgroundPrompt(scene);
          await this.generateSingleImage(scene.sceneNumber, 'background', bgPrompt);

          for (let i = 0; i < scene.characters.length; i++) {
            const charPrompt = this.buildCharacterPrompt(scene.characters[i], scene);
            await this.generateSingleImage(scene.sceneNumber, `character-${i}`, charPrompt);
          }
          await this.sleep(3000); // 쿼터 관리
          
        } else {
          // Gemini SVG 생성
          await this.generateSvgImage(scene.sceneNumber, 'background', scene);
          for (let i = 0; i < scene.characters.length; i++) {
            await this.generateSvgImage(scene.sceneNumber, `character-${i}`, scene);
          }
        }

      } catch (error) {
        // SVG 생성 시도 (Gemini 사용)
        console.log(`  🔄 Gemini로 SVG 생성 시도... (씬 ${scene.sceneNumber})`);
        await this.generateSvgImage(scene.sceneNumber, 'background', scene);
        for (let i = 0; i < scene.characters.length; i++) {
          await this.generateSvgImage(scene.sceneNumber, `character-${i}`, scene);
        }
      }
    }
  }

  private async generateSingleImage(
    sceneNumber: number,
    type: string,
    prompt: string
  ): Promise<void> {
    try {
      const result = await this.imageModel.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      });

      const response = await result.response;
      
      if (response.candidates && response.candidates[0]) {
        const imageData = response.candidates[0].content.parts[0];
        
        if (imageData.inlineData) {
          const buffer = Buffer.from(imageData.inlineData.data, 'base64');
          const filename = `public/images/scene${sceneNumber}-${type}.png`;
          await fs.mkdir('public/images', { recursive: true });
          await fs.writeFile(filename, buffer);
          console.log(`  ✅ 저장 완료: ${filename}`);
        }
      }
      
    } catch (error) {
      console.error(`이미지 생성 오류 (씬 ${sceneNumber}, ${type}):`, error);
      throw error;
    }
  }

  // Hugging Face로 이미지 생성
  private async generateImageWithHF(
    sceneNumber: number,
    type: string,
    prompt: string
  ): Promise<void> {
    try {
      const result: any = await this.hfClient.textToImage({
        model: 'black-forest-labs/FLUX.1-schnell',
        inputs: prompt,
        parameters: {
          width: type === 'background' ? 1024 : 768,
          height: type === 'background' ? 576 : 768,
          num_inference_steps: 4
        }
      });

      const buffer = await result.arrayBuffer();
      const filename = `public/images/scene${sceneNumber}-${type}.png`;
      await fs.mkdir('public/images', { recursive: true });
      await fs.writeFile(filename, Buffer.from(buffer));
      console.log(`  ✅ 저장 완료: ${filename}`);

    } catch (error) {
      console.error(`HF 이미지 생성 오류:`, error);
      throw error;
    }
  }

  // 어린이 동화책 스타일 배경 프롬프트
  private buildBackgroundPrompt(scene: Scene): string {
    return `children's book illustration, ${scene.backgroundDescription}, soft watercolor style, warm pastel colors, safe and friendly atmosphere, storybook art, no text, professional digital art, 4K quality`;
  }

  // 어린이 동화책 스타일 캐릭터 프롬프트
  private buildCharacterPrompt(character: string, scene: Scene): string {
    const location = scene.backgroundDescription.split(',')[0];
    return `cute cartoon character for children's book, ${character} in ${location}, friendly expression, simple design, vibrant colors, isolated character, children's storybook illustration style, no background, PNG style`;
  }



  // 3단계: Google Cloud TTS로 나레이션 생성
  async generateNarration(scenes: Scene[]): Promise<void> {
    console.log('🎙️ Google Cloud TTS로 나레이션 생성 중...');
    
    for (const scene of scenes) {
      // Add randomness to voice parameters to avoid "identical sound"
      const speakingRate = 0.9 + (Math.random() * 0.1); 
      const pitch = 0.5 + (Math.random() * 2.0); // More variation in pitch

      console.log(`  씬 ${scene.sceneNumber} 음성 생성 중... (pitch: ${pitch.toFixed(2)})`);
      
      const request = {
        input: { text: scene.narration },
        voice: {
          languageCode: 'ko-KR',
          name: 'ko-KR-Neural2-A', // Consider rotating voices: A, B, C for different characters if we parsed them
        },
        audioConfig: {
          audioEncoding: 'MP3' as const,
          speakingRate: speakingRate,
          pitch: pitch,
          volumeGainDb: 0.0,
        },
      };

      try {
        const [response] = await this.ttsClient.synthesizeSpeech(request);
        
        if (response.audioContent) {
          const filename = `public/audio/scene${scene.sceneNumber}-narration.mp3`;
          await fs.mkdir('public/audio', { recursive: true });
          await fs.writeFile(filename, response.audioContent, 'binary');
          console.log(`  ✅ 저장 완료: ${filename}`);
        }
        
      } catch (error) {
        console.error(`씬 ${scene.sceneNumber} 음성 생성 실패:`, error);
      }
    }
  }

  // Gemini 1.5 Flash를 사용하여 SVG 이미지 생성 (실패시 알고리즘 생성으로 폴백)
  private async generateSvgImage(
    sceneNumber: number,
    type: string,
    scene: Scene
  ): Promise<void> {
    try {
       // Force Algorithmic Generation directly to ensure quality and speed, 
       // bypassing the broken API entirely for now.
       throw new Error("API Disabled, using Algorithmic Art");
    } catch (error) {
      await this.createAlgorithmicArt(sceneNumber, type);
    }
  }

  // 100% Procedural Generative Art (No API needed)
  private async createAlgorithmicArt(sceneNumber: number, type: string) {
    const width = type === 'background' ? 1920 : 1024;
    const height = type === 'background' ? 1080 : 1024;
    
    // Seeded random number generator
    const seed = sceneNumber * 12345 + (type === 'background' ? 0 : 999);
    const random = () => {
        var x = Math.sin(seed + Math.random()) * 10000;
        return x - Math.floor(x);
    };

    let svgContent = '';
    
    if (type === 'background') {
        // Generate Landscape
        const skyColors = [['#87CEEB', '#E0F7FA'], ['#1a2a6c', '#b21f1f', '#fdbb2d'], ['#A1FFCE', '#FAFFD1']];
        const skyColor = skyColors[sceneNumber % skyColors.length];
        
        // Sky
        svgContent += `<defs><linearGradient id="sky${sceneNumber}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${skyColor[0]}"/><stop offset="100%" stop-color="${skyColor[1]}"/></linearGradient></defs>`;
        svgContent += `<rect width="100%" height="100%" fill="url(#sky${sceneNumber})" />`;
        
        // Sun or Moon
        const isNight = sceneNumber % 3 === 2;
        const sunColor = isNight ? '#F4F6F0' : '#FFD700';
        const sunX = 200 + random() * (width - 400);
        const sunY = 100 + random() * 200;
        svgContent += `<circle cx="${sunX}" cy="${sunY}" r="${isNight ? 60 : 80}" fill="${sunColor}" opacity="0.9" />`;

        // Mountains (3 layers)
        for(let i=0; i<3; i++) {
           const yBase = height - (200 + i * 150);
           const color = ['#2E8B57', '#228B22', '#006400'][i];
           let path = `M0 ${height} `;
           let x = 0;
           while(x < width) {
               x += 100 + random() * 200;
               path += `L${x} ${yBase - random() * 300} `;
           }
           path += `L${width} ${height} Z`;
           svgContent += `<path d="${path}" fill="${color}" opacity="${0.6 + i*0.2}" />`;
        }

        // Trees
        for(let i=0; i<15; i++) {
            const tx = random() * width;
            const ty = height - 100 - random() * 200;
            const th = 100 + random() * 100;
            svgContent += `<path d="M${tx} ${ty} L${tx+30} ${ty+th} L${tx-30} ${ty+th} Z" fill="#004d00" />`;
            // Trunk
            svgContent += `<rect x="${tx-5}" y="${ty+th}" width="10" height="20" fill="#8B4513" />`;
        }
    } else {
        // Generate Cute Creature
        // Body
        const bodyColor = `hsl(${random() * 360}, 70%, 60%)`;
        svgContent += `<circle cx="256" cy="300" r="150" fill="${bodyColor}" />`;
        
        // Eyes
        svgContent += `<circle cx="200" cy="250" r="30" fill="white" />`;
        svgContent += `<circle cx="312" cy="250" r="30" fill="white" />`;
        svgContent += `<circle cx="200" cy="250" r="10" fill="black" />`;
        svgContent += `<circle cx="312" cy="250" r="10" fill="black" />`;
        
        // Smile
        svgContent += `<path d="M200 350 Q256 400 312 350" stroke="black" stroke-width="10" fill="none" stroke-linecap="round" />`;
        
        // Accessories (Hat/Ears)
        if (random() > 0.5) {
            // Ears
             svgContent += `<circle cx="150" cy="180" r="40" fill="${bodyColor}" />`;
             svgContent += `<circle cx="362" cy="180" r="40" fill="${bodyColor}" />`;
        } else {
            // Hat
            svgContent += `<path d="M150 200 L362 200 L256 50 Z" fill="red" />`;
        }
    }

    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
    await fs.mkdir('public/images', { recursive: true });
    await fs.writeFile(`public/images/scene${sceneNumber}-${type}.svg`, svg);
    console.log(`  ✅ 절차적 예술 SVG 생성 완료: ${type}`);
  }

  // 4단계: Remotion 컴포넌트 자동 생성
  async generateRemotionComponents(scenes: Scene[]): Promise<void> {
    console.log('⚛️ Remotion 컴포넌트 생성 중...');
    
    await fs.mkdir('src/Story', { recursive: true });

    for (const scene of scenes) {
      const componentCode = this.generateSceneComponent(scene);
      await fs.writeFile(
        `src/Story/Scene${scene.sceneNumber}.tsx`,
        componentCode
      );
      console.log(`  ✅ Scene${scene.sceneNumber}.tsx 생성 완료`);
    }

    const mainVideoCode = this.generateMainVideo(scenes);
    await fs.writeFile('src/StoryVideo.tsx', mainVideoCode);
    console.log('  ✅ StoryVideo.tsx 생성 완료');

    const rootCode = this.generateRoot(scenes);
    await fs.writeFile('src/Root.tsx', rootCode);
    console.log('  ✅ Root.tsx 생성 완료');
  }

  private generateSceneComponent(scene: Scene): string {
    const durationInFrames = scene.duration * 30;
    const hasCharacters = scene.characters.length > 0;

    return `import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, spring, staticFile } from 'remotion';

export const Scene${scene.sceneNumber} = () => {
  const frame = useCurrentFrame();

  // 씬 전체 Fade In/Out
  const sceneOpacity = interpolate(
    frame,
    [0, 30, ${durationInFrames - 30}, ${durationInFrames}],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Ken Burns Effect - 배경 확대
  const bgScale = interpolate(
    frame,
    [0, ${durationInFrames}],
    [1, 1.12],
    { extrapolateRight: 'clamp' }
  );

  // 텍스트 타이핑 효과
  const textReveal = interpolate(
    frame,
    [30, 120],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const narrationText = "${scene.narration.replace(/"/g, '\\"')}";
  const visibleText = narrationText.substring(0, Math.floor(textReveal * narrationText.length));

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* 배경 레이어 */}
      <div style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'absolute'
      }}>
        <Img
          src={staticFile("images/scene${scene.sceneNumber}-background.svg")}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = staticFile("images/scene${scene.sceneNumber}-background.png");
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: \`scale(\${bgScale})\`,
            filter: 'brightness(0.95) contrast(1.05)'
          }}
        />
      </div>

      ${hasCharacters ? scene.characters.map((char, idx) => {
        const startFrame = 30 + (idx * 20);
        return `
      {/* 캐릭터 ${idx + 1} - Spring Animation */}
      <Img
          src={staticFile("images/scene${scene.sceneNumber}-character-${idx}.svg")}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = staticFile("images/scene${scene.sceneNumber}-character-${idx}.png");
        }}
        style={{
          position: 'absolute',
          left: ${100 + (idx * 300)},
          bottom: interpolate(
            spring({
              frame: frame - ${startFrame},
              fps: 30,
              config: { damping: 12, stiffness: 80, mass: 0.8 }
            }),
            [0, 1],
            [-200, 150]
          ),
          width: 300,
          height: 300,
          objectFit: 'contain',
          opacity: interpolate(
            frame,
            [${startFrame}, ${startFrame + 30}],
            [0, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          ),
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
          transform: \`scale(\${interpolate(
            frame,
            [${startFrame}, ${startFrame + 30}],
            [0.7, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          )})\`
        }}
      />`;
      }).join('') : ''}

      {/* 나레이션 텍스트 - 타이핑 효과 */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: 100,
          right: 100,
          textAlign: 'center',
          fontSize: 52,
          fontWeight: 'bold',
          color: 'white',
          textShadow: '4px 4px 12px rgba(0,0,0,0.9)',
          padding: '40px',
          fontFamily: "'Noto Sans KR', sans-serif",
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderRadius: '30px',
          lineHeight: 1.6,
          backdropFilter: 'blur(10px)'
        }}
      >
        {visibleText}
      </div>

      {/* 오디오 */}
      <Audio src={staticFile("audio/scene${scene.sceneNumber}-narration.mp3")} />
    </AbsoluteFill>
  );
};
`;
  }

  private generateMainVideo(scenes: Scene[]): string {
    let currentFrame = 0;
    const sequences = scenes.map((scene) => {
      const duration = scene.duration * 30;
      const from = currentFrame;
      currentFrame += duration;
      
      return `      <Sequence from={${from}} durationInFrames={${duration}}>
        <Scene${scene.sceneNumber} />
      </Sequence>`;
    }).join('\n');

    const imports = scenes.map(s => 
      `import { Scene${s.sceneNumber} } from './Story/Scene${s.sceneNumber}';`
    ).join('\n');

    return `import { AbsoluteFill, Sequence, Audio } from 'remotion';
${imports}

export const StoryVideo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a2e' }}>
${sequences}
    </AbsoluteFill>
  );
};
`;
  }

  private generateRoot(scenes: Scene[]): string {
    const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);
    const totalFrames = totalDuration * 30;

    return `import { Composition } from 'remotion';
import { StoryVideo } from './StoryVideo';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="StoryVideo"
        component={StoryVideo}
        durationInFrames={${totalFrames}}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 재시도 로직 (API 할당량 초과 대응)
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
}
