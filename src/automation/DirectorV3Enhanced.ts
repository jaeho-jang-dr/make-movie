import { promises as fs } from 'fs';
import { StorySquad, V3Script, V3Scene } from './agents/StorySquad';
import { SoundSquad } from './agents/SoundSquad';
import { AssetPlanner, AssetPlan } from './AssetPlanner';

// --- Enhanced V3 Director with Pre-Production ---
export class DirectorV3Enhanced {
    private storySquad: StorySquad;
    private soundSquad: SoundSquad;
    private assetPlanner: AssetPlanner;
    private apiKey: string;
    private grokApiKey?: string;

    constructor(apiKey: string, grokApiKey?: string) {
        this.apiKey = apiKey;
        this.grokApiKey = grokApiKey;
        this.storySquad = new StorySquad(apiKey, grokApiKey);
        this.soundSquad = new SoundSquad();
        if (grokApiKey) {
            this.assetPlanner = new AssetPlanner(grokApiKey);
        } else {
            throw new Error('Grok API key required for asset planning');
        }
    }

    async produceMovieEnhanced(theme: string) {
        console.log("🎬 [V3 ENHANCED] PROFESSIONAL PRODUCTION START!");
        console.log("📋 제작 파이프라인: 기획 → 스토리 → 에셋 생성 → 조립 → 렌더링\n");

        // Phase 1: Story Development
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📝 PHASE 1: Story Development");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        const script = await this.storySquad.developStory(theme);
        console.log(`✅ Script: "${script.title}" (${script.scenes.length} scenes)`);
        await this.saveData('script.json', script);

        // Phase 2: Asset Planning (PRE-PRODUCTION)
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🎨 PHASE 2: Asset Pre-Production");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        const assetPlan = await this.assetPlanner.planAllAssets(script);
        await this.saveData('asset-plan.json', assetPlan);

        // Define style guide (simple for now)
        const style = {
            palette: ["#87CEEB", "#FFD700", "#90EE90", "#FF6B6B", "#4ECDC4"],
            lineWeight: 3,
            mood: "Warm and Adventurous"
        };

        // Phase 3: Asset Generation
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🖌️ PHASE 3: Asset Generation");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        await fs.mkdir('public/assets/characters', { recursive: true });
        await fs.mkdir('public/assets/props', { recursive: true });
        await fs.mkdir('public/assets/backgrounds', { recursive: true });
        await fs.mkdir('public/audio/v3', { recursive: true });

        // 3A. Generate Character Poses
        console.log("\n👥 Generating Character Poses...");
        for (const char of assetPlan.characters) {
            console.log(`\n  Character: ${char.name}`);
            for (const pose of char.poses) {
                const svg = await this.assetPlanner.generateCharacterPose(char.name, pose, style);
                // Sanitize filename (remove /\:*?"<>| characters)
                const safeName = pose.name.replace(/[\/\\:*?"<>|]/g, '_');
                await fs.writeFile(`public/assets/characters/${safeName}.svg`, svg);
            }
        }

        // 3B. Generate Props
        console.log("\n\n🎁 Generating Props...");
        for (const prop of assetPlan.props) {
            const svg = await this.assetPlanner.generateProp(prop, style);
            await fs.writeFile(`public/assets/props/${prop.name.replace(/\s+/g, '_')}.svg`, svg);
        }

        // 3C. Generate Backgrounds
        console.log("\n\n🏞️ Generating Backgrounds...");
        for (const bg of assetPlan.backgrounds) {
            const svg = await this.assetPlanner.generateBackground(bg);
            await fs.writeFile(`public/assets/backgrounds/scene${bg.sceneNumber}.svg`, svg);
        }

        // Phase 4: Audio Production
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🎙️ PHASE 4: Audio Production");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        const voiceMap = await this.soundSquad.castVoices(script.characters);
        for (const scene of script.scenes) {
            console.log(`  🎤 Recording Scene ${scene.number}...`);
            try {
                const audioContent = await this.soundSquad.recordScene(scene, voiceMap);
                await fs.writeFile(`public/audio/v3/scene${scene.number}.mp3`, audioContent, 'binary');
            } catch (e) {
                console.error(`  ❌ Audio failed for scene ${scene.number}`);
            }
        }

        // Phase 5: Component Assembly
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("⚛️ PHASE 5: Remotion Assembly");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        await fs.mkdir('src/StoryV3Enhanced', { recursive: true });

        for (const scene of script.scenes) {
            await this.generateEnhancedComponent(scene, assetPlan, script.characters);
        }

        await this.generateEnhancedRoot(script);

        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🎉 PRODUCTION COMPLETE!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("\n📊 생성된 에셋:");
        console.log(`   - 캐릭터 포즈: ${assetPlan.characters.reduce((sum, c) => sum + c.poses.length, 0)}개`);
        console.log(`   - 소품: ${assetPlan.props.length}개`);
        console.log(`   - 배경: ${assetPlan.backgrounds.length}개`);
        console.log(`   - 오디오: ${script.scenes.length}개`);
        console.log(`   - 컴포넌트: ${script.scenes.length}개`);
    }

    private async generateEnhancedComponent(scene: V3Scene, assetPlan: AssetPlan, characters: any[]) {
        const sceneDuration = 450; // 15초 per scene (충분한 시간)
        const transitionGap = 30; // 1초 gap (씬 사이에만)

        // Determine which character poses to use
        const mainChar = characters[0];
        const poses = assetPlan.characters.find(c => c.name === mainChar.name)?.poses || [];

        // Pick appropriate pose based on scene content
        let pose1 = poses.find(p => p.action === 'standing') || poses[0];
        let pose2 = poses.find(p => p.action === 'walking') || poses[1] || pose1;

        // Scene-specific pose selection
        if (scene.narration.includes('넘어졌') || scene.narration.includes('구부')) {
            pose1 = poses.find(p => p.action === 'bending') || pose1;
        }
        if (scene.narration.includes('손을 내밀') || scene.narration.includes('외쳤')) {
            pose1 = poses.find(p => p.action === 'pointing') || pose1;
        }
        if (scene.narration.includes('겁') || scene.narration.includes('무서')) {
            pose1 = poses.find(p => p.action === 'scared') || pose1;
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

    // Props (if any in scene ${scene.number})
    const propOpacity = interpolate(frame, [120, 150], [0, 1], { extrapolateRight: 'clamp' });

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

    private async generateEnhancedRoot(script: V3Script) {
        const GAP = 30; // 1초 gap between scenes
        const SCENE_DURATION = 300; // 10초

        const imports = script.scenes.map(s =>
            `import { Scene${s.number} } from './StoryV3Enhanced/Scene${s.number}';`
        ).join('\n');

        let currentFrame = 0;
        const sequences = script.scenes.map((s, idx) => {
            const from = currentFrame;
            currentFrame += SCENE_DURATION + GAP; // Add gap after each scene

            return `      <Sequence from={${from}} durationInFrames={${SCENE_DURATION}}>
        <Scene${s.number} />
      </Sequence>`;
        }).join('\n');

        const totalFrames = (SCENE_DURATION + GAP) * script.scenes.length;

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

    private async saveData(filename: string, data: any) {
        await fs.mkdir('data', { recursive: true });
        await fs.writeFile(`data/${filename}`, JSON.stringify(data, null, 2));
    }
}
