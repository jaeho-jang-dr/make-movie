// src/automation/GoogleStoryGenerator.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
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

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.ttsClient = new TextToSpeechClient();
    
    // Gemini 2.0 Flash (텍스트 생성용 - 빠르고 무료)
    this.geminiModel = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp'
    });
    
    // Imagen 3 (이미지 생성용)
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

    const result = await this.geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON 추출 (```json ``` 제거)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('유효한 JSON 응답을 받지 못했습니다');
    }
    
    const storyData = JSON.parse(jsonMatch[0]);
    return storyData.scenes;
  }

  // 2단계: Imagen 3으로 이미지 생성
  async generateImages(scenes: Scene[]): Promise<void> {
    console.log('🎨 Imagen 3로 이미지 생성 중...');
    
    for (const scene of scenes) {
      try {
        // 배경 이미지 생성
        console.log(`  씬 ${scene.sceneNumber} 배경 생성 중...`);
        await this.generateSingleImage(
          scene.sceneNumber,
          'background',
          `Children's storybook illustration: ${scene.backgroundDescription}. 
           Bright, colorful, friendly style. Wide landscape view. 
           Digital art, vibrant colors, suitable for kids ages 5-7.`
        );

        // 캐릭터 이미지 생성
        for (let i = 0; i < scene.characters.length; i++) {
          const character = scene.characters[i];
          console.log(`  씬 ${scene.sceneNumber} 캐릭터 "${character}" 생성 중...`);
          
          await this.generateSingleImage(
            scene.sceneNumber,
            `character-${i}`,
            `Cute cartoon character for children's story: ${character}. 
             Simple design, big eyes, friendly expression, colorful. 
             Full body view, standing pose. White background. 
             Style: children's book illustration, vector art style.`
          );
        }
        
        // API 제한 방지를 위한 대기
        await this.sleep(2000);
        
      } catch (error) {
        console.error(`씬 ${scene.sceneNumber} 이미지 생성 실패:`, error);
        await this.createPlaceholderImage(scene.sceneNumber);
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

  private async createPlaceholderImage(sceneNumber: number): Promise<void> {
    const svg = `
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#87CEEB"/>
        <text x="50%" y="50%" text-anchor="middle" font-size="48" fill="white">
          Scene ${sceneNumber}
        </text>
      </svg>
    `;
    
    await fs.mkdir('public/images', { recursive: true });
    await fs.writeFile(
      `public/images/scene${sceneNumber}-background.png`,
      svg
    );
  }

  // 3단계: Google Cloud TTS로 나레이션 생성
  async generateNarration(scenes: Scene[]): Promise<void> {
    console.log('🎙️ Google Cloud TTS로 나레이션 생성 중...');
    
    for (const scene of scenes) {
      console.log(`  씬 ${scene.sceneNumber} 음성 생성 중...`);
      
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

    return `import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate } from 'remotion';

export const Scene${scene.sceneNumber} = () => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame,
    [0, 30, ${durationInFrames - 30}, ${durationInFrames}],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scale = interpolate(
    frame,
    [0, ${durationInFrames}],
    [1, 1.1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Img
          src="/images/scene${scene.sceneNumber}-background.png"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: \`scale(\${scale})\`
          }}
        />
      </div>

      ${hasCharacters ? scene.characters.map((char, idx) => {
        const startFrame = 30 + (idx * 15);
        const endFrame = startFrame + 30;
        return `
      <Img
        src="/images/scene${scene.sceneNumber}-character-${idx}.png"
        style={{
          position: 'absolute',
          left: ${100 + (idx * 300)},
          bottom: interpolate(
            frame,
            [${startFrame}, ${endFrame}],
            [-200, 100],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          ),
          width: 250,
          height: 250,
          objectFit: 'contain',
          opacity: interpolate(
            frame,
            [${startFrame}, ${endFrame}],
            [0, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          )
        }}
      />`;
      }).join('') : ''}

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
          textShadow: '4px 4px 8px rgba(0,0,0,0.9)',
          padding: '40px',
          fontFamily: "'Noto Sans KR', sans-serif",
          backgroundColor: 'rgba(0,0,0,0.4)',
          borderRadius: '30px',
          lineHeight: 1.6
        }}
      >
        ${scene.narration}
      </div>

      <Audio src="/audio/scene${scene.sceneNumber}-narration.mp3" />
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
}
