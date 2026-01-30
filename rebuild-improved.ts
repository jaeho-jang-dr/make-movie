// 개선된 재생성 스크립트
import { ImprovedAssetGenerator } from './src/automation/ImprovedAssetGenerator';
import { getSceneMappings } from './src/automation/ScenePropMapper';
import { promises as fs } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function rebuildImproved() {
    console.log('🎬 개선된 컴포넌트 생성 시작\n');

    const grokApiKey = process.env.GROK_API_KEY;
    if (!grokApiKey) {
        console.error('❌ GROK_API_KEY 필요');
        process.exit(1);
    }

    const generator = new ImprovedAssetGenerator(grokApiKey);

    // 1. 깜깜이 에셋 생성
    await generator.generateKkamkkamCharacter();

    // 2. 씬별 매핑 가져오기
    const sceneMappings = getSceneMappings();

    console.log('⚛️ 개선된 Remotion 컴포넌트 생성 중...\n');
    await fs.mkdir('src/StoryV3Improved', { recursive: true });

    // 3. 각 씬 컴포넌트 생성
    for (const mapping of sceneMappings) {
        await generateImprovedScene(mapping);
    }

    // 4. Root 생성
    await generateImprovedRoot(sceneMappings);

    // 5. index.ts 업데이트
    const indexContent = `import { registerRoot } from 'remotion';
import { RemotionRootV3Improved } from './RootV3Improved';

registerRoot(RemotionRootV3Improved);`;
    await fs.writeFile('src/index.ts', indexContent);

    console.log('\n🎉 완료!');
    console.log('\n📺 렌더링:');
    console.log('   npx remotion render src/index.ts StoryVideoV3Improved output/용기와-우정의-빛나는-모험-FINAL.mp4');
}

async function generateImprovedScene(mapping: any) {
    const { sceneNumber, characters, duration, narration, backgroundProps = [] } = mapping;

    // 캐릭터 배치 계산
    const charCount = characters.length;
    const positions = [150, 300, 450]; // 3명 기준

    const characterElements = characters.map((char: any, idx: number) => {
        const hasProps = char.props && char.props.length > 0;
        const poseName = char.pose;

        // 소품이 있으면 통합, 없으면 일반 캐릭터
        let imagePath = '';
        if (char.name === '깜깜이') {
            imagePath = `assets/characters/kkamkkam/${poseName}.svg`;
        } else {
            imagePath = `assets/characters/${poseName}.svg`;
        }

        return `
            {/* ${char.name} */}
            <Img
                src={staticFile("${imagePath}")}
                style={{
                    position: 'absolute',
                    bottom: ${char.name === '깜깜이' ? 200 : 100},
                    left: interpolate(
                        spring({ frame, fps: 30, config: { damping: 20 } }),
                        [0, 1],
                        [-200, ${positions[idx]}]
                    ),
                    width: ${char.name === '깜깜이' ? 200 : 300},
                    height: ${char.name === '깜깜이' ? 200 : 400},
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                }}
            />
            ${hasProps ? char.props.map((prop: any) => `
            {/* ${prop.propName} */}
            <Img
                src={staticFile("assets/props/${prop.propName}.svg")}
                style={{
                    position: 'absolute',
                    bottom: ${char.name === '깜깜이' ? 250 : 200},
                    left: interpolate(
                        spring({ frame, fps: 30, config: { damping: 20 } }),
                        [0, 1],
                        [-200, ${positions[idx] + (prop.position === 'right-hand' ? 50 : -50)}]
                    ),
                    width: 80,
                    height: 80,
                    objectFit: 'contain',
                    opacity: frame > 30 ? 1 : 0
                }}
            />`).join('') : ''}`;
    }).join('');

    // 배경 소품 렌더링 (일단 비활성화 - SVG 오류 때문에)
    const backgroundPropsElements = ''; // backgroundProps를 사용하지 않음

    const code = `import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile, spring } from 'remotion';

export const Scene${sceneNumber} = () => {
    const frame = useCurrentFrame();
    const duration = ${duration};

    // 씬 완전히 재생 후 페이드아웃 (마지막 10프레임만)
    const opacity = interpolate(
        frame,
        [0, 15, duration - 10, duration],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Background
    const bgScale = interpolate(frame, [0, duration], [1, 1.08]);
    const bgX = interpolate(frame, [0, duration], [0, -30]);

    return (
        <AbsoluteFill style={{ opacity }}>
            {/* Background */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
                <div style={{ transform: \`scale(\${bgScale}) translateX(\${bgX}px)\`, width: '100%', height: '100%' }}>
                    <Img
                        src={staticFile("assets/backgrounds/scene${sceneNumber}.svg")}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            </div>

            {/* Background Props */}
            ${backgroundPropsElements}

            {/* Characters + Props */}
            ${characterElements}

            {/* Subtitle */}
            <div style={{
                position: 'absolute',
                bottom: 50,
                left: '10%',
                right: '10%',
                textAlign: 'center',
                fontSize: 26,
                fontWeight: '600',
                color: 'white',
                textShadow: '3px 3px 8px rgba(0,0,0,1), -1px -1px 4px rgba(0,0,0,0.9)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: '12px 20px',
                borderRadius: '10px',
                fontFamily: "'Noto Sans KR', sans-serif",
                lineHeight: 1.6,
                backdropFilter: 'blur(4px)',
                opacity: interpolate(frame, [10, 20, duration - 20, duration - 10], [0, 1, 1, 0])
            }}>
                ${narration}
            </div>

            {/* Audio */}
            <Audio src={staticFile("audio/v3/scene${sceneNumber}.mp3")} />
        </AbsoluteFill>
    );
};
`;

    await fs.writeFile(`src/StoryV3Improved/Scene${sceneNumber}.tsx`, code);
    console.log(`  ✅ Scene${sceneNumber}.tsx (${duration} 프레임 = ${Math.ceil(duration / 30)}초)`);
}

async function generateImprovedRoot(sceneMappings: any[]) {
    const GAP = 30; // 1초 gap

    const imports = sceneMappings.map(s =>
        `import { Scene${s.sceneNumber} } from './StoryV3Improved/Scene${s.sceneNumber}';`
    ).join('\n');

    let currentFrame = 0;
    const sequences = sceneMappings.map((s, idx) => {
        const from = currentFrame;
        currentFrame += s.duration;

        if (idx < sceneMappings.length - 1) {
            currentFrame += GAP; // 마지막 제외하고 gap 추가
        }

        return `      <Sequence from={${from}} durationInFrames={${s.duration}}>
        <Scene${s.sceneNumber} />
      </Sequence>`;
    }).join('\n');

    const totalFrames = sceneMappings.reduce((sum, s) => sum + s.duration, 0) + (GAP * (sceneMappings.length - 1));

    const code = `import { Composition, Sequence, AbsoluteFill } from 'remotion';
${imports}

export const StoryVideoV3Improved = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
${sequences}
        </AbsoluteFill>
    );
};

export const RemotionRootV3Improved = () => (
    <Composition
        id="StoryVideoV3Improved"
        component={StoryVideoV3Improved}
        durationInFrames={${totalFrames}}
        fps={30}
        width={1920}
        height={1080}
    />
);
`;

    await fs.writeFile('src/RootV3Improved.tsx', code);
    console.log('  ✅ RootV3Improved.tsx');
    console.log(`\n📊 총 길이: ${totalFrames} 프레임 = ${Math.ceil(totalFrames / 30)}초`);
}

rebuildImproved().catch(console.error);
