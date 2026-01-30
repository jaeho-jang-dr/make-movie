// 컴포넌트만 다시 생성하는 스크립트
import { DirectorV3Enhanced } from './src/automation/DirectorV3Enhanced';
import { promises as fs } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function rebuildComponents() {
    console.log('🔄 컴포넌트 재생성 시작...\n');

    // 기존 스크립트 읽기
    const scriptData = await fs.readFile('data/script.json', 'utf-8');
    const script = JSON.parse(scriptData);

    // 기존 에셋 플랜 읽기
    const assetPlanData = await fs.readFile('data/asset-plan.json', 'utf-8');
    const assetPlan = JSON.parse(assetPlanData);

    console.log(`✅ 스크립트 로드: ${script.title} (${script.scenes.length} 씬)`);
    console.log(`✅ 에셋 플랜 로드: ${assetPlan.characters.length}명 캐릭터\n`);

    const apiKey = process.env.GOOGLE_AI_API_KEY || 'placeholder';
    const grokApiKey = process.env.GROK_API_KEY;

    const director = new DirectorV3Enhanced(apiKey, grokApiKey);

    // DirectorV3Enhanced의 private 메서드에 접근할 수 없으므로,
    // 직접 컴포넌트를 생성합니다
    console.log('⚛️ Remotion 컴포넌트 재생성 중...\n');

    await fs.mkdir('src/StoryV3Enhanced', { recursive: true });

    for (const scene of script.scenes) {
        await generateEnhancedComponent(scene, assetPlan, script.characters);
    }

    await generateEnhancedRoot(script);

    console.log('\n🎉 컴포넌트 재생성 완료!');
    console.log('\n📺 다음 명령어로 렌더링하세요:');
    console.log('   npx remotion render src/index.ts StoryVideoV3Enhanced output/용기와-우정의-빛나는-모험-v2.mp4');
}

async function generateEnhancedComponent(scene: any, assetPlan: any, characters: any[]) {
    const sceneDuration = 450; // 15초

    const mainChar = characters[0];
    const poses = assetPlan.characters.find((c: any) => c.name === mainChar.name)?.poses || [];

    let pose1 = poses.find((p: any) => p.action === 'standing') || poses[0];
    let pose2 = poses.find((p: any) => p.action === 'walking') || poses[1] || pose1;

    if (scene.narration.includes('넘어졌') || scene.narration.includes('구부')) {
        pose1 = poses.find((p: any) => p.action === 'bending') || pose1;
    }
    if (scene.narration.includes('손을 내밀') || scene.narration.includes('외쳤')) {
        pose1 = poses.find((p: any) => p.action === 'pointing') || pose1;
    }
    if (scene.narration.includes('겁') || scene.narration.includes('무서')) {
        pose1 = poses.find((p: any) => p.action === 'scared') || pose1;
    }

    const code = `import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile, spring } from 'remotion';

export const Scene${scene.number} = () => {
    const frame = useCurrentFrame();
    const duration = ${sceneDuration};

    // Scene fade in/out (씬 끝까지 완전히 보이고, 마지막에만 fade out)
    const opacity = interpolate(
        frame,
        [0, 20, duration - 20, duration],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Background slow zoom (Ken Burns effect)
    const bgScale = interpolate(frame, [0, duration], [1, 1.1]);
    const bgX = interpolate(frame, [0, duration], [0, -50]);

    // Character 1 walks in from left
    const char1X = interpolate(
        spring({ frame, fps: 30, config: { damping: 20 } }),
        [0, 1],
        [-200, 100]
    );

    // Character 2 enters later
    const char2Delay = 60;
    const char2X = interpolate(
        spring({ frame: frame - char2Delay, fps: 30, config: { damping: 20 } }),
        [0, 1],
        [-200, 400]
    );

    return (
        <AbsoluteFill style={{ opacity }}>
            {/* Background Layer */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                overflow: 'hidden'
            }}>
                <div style={{
                    transform: \`scale(\${bgScale}) translateX(\${bgX}px)\`,
                    width: '100%',
                    height: '100%'
                }}>
                    <Img
                        src={staticFile("assets/backgrounds/scene${scene.number}.svg")}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            </div>

            {/* Character 1 - ${mainChar.name} */}
            <Img
                src={staticFile("assets/characters/${pose1.name}.svg")}
                style={{
                    position: 'absolute',
                    bottom: 100,
                    left: char1X,
                    width: 300,
                    height: 400,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                }}
            />

            ${characters.length > 1 ? `
            {/* Character 2 - ${characters[1].name} */}
            <Img
                src={staticFile("assets/characters/${pose2.name}.svg")}
                style={{
                    position: 'absolute',
                    bottom: 100,
                    left: char2X,
                    width: 300,
                    height: 400,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                    opacity: frame > char2Delay ? 1 : 0
                }}
            />` : ''}

            {/* Narration Subtitle - 작고 투명하게 */}
            <div style={{
                position: 'absolute',
                bottom: 40,
                left: '10%',
                right: '10%',
                textAlign: 'center',
                fontSize: 28,
                fontWeight: '600',
                color: 'white',
                textShadow: '2px 2px 6px rgba(0,0,0,1), -1px -1px 3px rgba(0,0,0,0.8)',
                backgroundColor: 'rgba(0,0,0,0.15)',
                padding: '15px 25px',
                borderRadius: '12px',
                fontFamily: "'Noto Sans KR', sans-serif",
                lineHeight: 1.5,
                backdropFilter: 'blur(3px)'
            }}>
                ${scene.narration}
            </div>

            {/* Audio */}
            <Audio src={staticFile("audio/v3/scene${scene.number}.mp3")} />
        </AbsoluteFill>
    );
};
`;

    await fs.writeFile(`src/StoryV3Enhanced/Scene${scene.number}.tsx`, code);
    console.log(`  ✅ Scene${scene.number}.tsx`);
}

async function generateEnhancedRoot(script: any) {
    const GAP = 30; // 1초 gap between scenes (씬 사이에만)
    const SCENE_DURATION = 450; // 15초

    const imports = script.scenes.map((s: any) =>
        `import { Scene${s.number} } from './StoryV3Enhanced/Scene${s.number}';`
    ).join('\n');

    let currentFrame = 0;
    const sequences = script.scenes.map((s: any, idx: number) => {
        const from = currentFrame;
        currentFrame += SCENE_DURATION;

        // 마지막 씬이 아니면 gap 추가
        if (idx < script.scenes.length - 1) {
            currentFrame += GAP;
        }

        return `      <Sequence from={${from}} durationInFrames={${SCENE_DURATION}}>
        <Scene${s.number} />
      </Sequence>`;
    }).join('\n');

    const totalFrames = (SCENE_DURATION * script.scenes.length) + (GAP * (script.scenes.length - 1));

    const code = `import { Composition, Sequence, AbsoluteFill } from 'remotion';
${imports}

export const StoryVideoV3Enhanced = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
${sequences}
        </AbsoluteFill>
    );
};

export const RemotionRootV3Enhanced = () => (
    <Composition
        id="StoryVideoV3Enhanced"
        component={StoryVideoV3Enhanced}
        durationInFrames={${totalFrames}}
        fps={30}
        width={1920}
        height={1080}
    />
);
`;

    await fs.writeFile('src/RootV3Enhanced.tsx', code);
    console.log('  ✅ RootV3Enhanced.tsx');
}

rebuildComponents().catch(console.error);
