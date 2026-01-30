import { promises as fs } from 'fs';
import { StorySquad, V3Script, V3Scene } from './agents/StorySquad';
import { ArtSquad, StyleGuide } from './agents/ArtSquad';
import { SoundSquad } from './agents/SoundSquad';

// --- The V3 Orchestrator ---
export class DirectorV3 {
    private storySquad: StorySquad;
    private artSquad: ArtSquad;
    private soundSquad: SoundSquad;

    constructor(apiKey: string, grokApiKey?: string) {
        this.storySquad = new StorySquad(apiKey, grokApiKey);
        this.artSquad = new ArtSquad(apiKey);
        this.soundSquad = new SoundSquad();
    }

    async produceMoviePreview(theme: string) {
        console.log("🎬 PROJECT V3 START: " + theme);
        
        // 1. Story Squad
        const script = await this.storySquad.developStory(theme);
        console.log(`✅ Script Ready: ${script.title} (${script.scenes.length} Scenes)`);
        await this.saveData('script.json', script);

        // 2. Art Squad (Lead Director + Shape Specialist)
        const style = await this.artSquad.establishStyle(script);
        console.log(`✅ Style Guide: ${style.mood} / Shapes: ${style.shapes}`);
        await this.saveData('style.json', style);

        // 3. Sound Squad (Casting)
        const voiceMap = await this.soundSquad.castVoices(script.characters);

        // 4. Production Loop (Parallel Execution with Quality Checks)
        // Note: For User's "Preview", we check Scene 1-3 first.
        // If the user says "Go ahead", we do all.
        // User requested: "완전 하지 않고 이상 하게 만들어 진것은 다시 고쳐 만들고" -> Automated Retry Logic.
        
        await fs.mkdir('public/images/v3', { recursive: true });
        await fs.mkdir('public/audio/v3', { recursive: true });
        await fs.mkdir('src/StoryV3', { recursive: true });

        // Let's process ALL VALID scenes
        for (const scene of script.scenes) {
             console.log(`🎬 Action! Scene ${scene.number}...`);
             
             // A. Background (Retry Logic)
             let bgSvg = '';
             let attempts = 0;
             while (attempts < 3) {
                 try {
                     bgSvg = await this.artSquad.createBackground(
                         scene.visualKeyVisuals + `, Mood Color: ${scene.moodColor}`, 
                         style
                     );
                     // Quality Check: Size > 1KB
                     if (bgSvg.length < 1000) throw new Error("SVG too small");
                     break;
                 } catch (e) {
                     console.warn(`    ⚠️ BG Retry ${attempts+1} for Scene ${scene.number}`);
                     attempts++;
                 }
             }
             if (!bgSvg) bgSvg = this.getFallbackSvg('Background Fail');
             await fs.writeFile(`public/images/v3/scene${scene.number}-bg.svg`, bgSvg);

             // B. Characters (Main + Extras)
             // Check script for characters present
             // For V3 prototype, we generate the Main Character for every scene if not specified
             const mainChar = script.characters[0]; 
             // We should parse who is in the scene, but let's assume Main Char is always there for now.
             
             let charSvg = '';
             attempts = 0;
             while (attempts < 3) {
                 try {
                     charSvg = await this.artSquad.createCharacter(
                         mainChar, 
                         "standing/acting", // Dynamic action logic would go here
                         style
                     );
                     if (charSvg.length < 500) throw new Error("Char SVG too small");
                     break;
                 } catch (e) {
                     console.warn(`    ⚠️ Char Retry ${attempts+1}`);
                     attempts++;
                 }
             }
             await fs.writeFile(`public/images/v3/scene${scene.number}-char.svg`, charSvg);

             // C. Audio (Narration)
             try {
                const audioContent = await this.soundSquad.recordScene(scene, voiceMap);
                await fs.writeFile(`public/audio/v3/scene${scene.number}.mp3`, audioContent, 'binary');
             } catch (e) {
                 console.error("    ❌ Audio Fail");
             }

             // D. Code Gen
             await this.generateV3Component(scene);
        }

        // 5. Root Setup
        await this.generateV3Root(script);
        console.log("🎉 V3 Production Complete. Ready to Render.");
    }

    private async saveData(filename: string, data: any) {
        await fs.writeFile(`data/${filename}`, JSON.stringify(data, null, 2));
    }

    private getFallbackSvg(text: string): string {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"><rect width="100%" height="100%" fill="#333"/><text x="50" y="50" fill="white" fontSize="50">${text}</text></svg>`;
    }

    private async generateV3Component(scene: V3Scene) {
        // Advanced Camera Logic (Pan/Zoom)
        // Similar to V2 but cleaner
        const code = `import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

export const Scene${scene.number} = () => {
    const frame = useCurrentFrame();
    const duration = 300; // 10 sec default

    // Dynamic Camera Pan
    const x = interpolate(frame, [0, duration], [0, -50]);
    
    return (
        <AbsoluteFill>
            <div style={{ transform: \`translateX(\${x}px) scale(1.1)\`, width: '100%', height: '100%' }}>
                <Img src={staticFile("images/v3/scene${scene.number}-bg.svg")} style={{ width: '100%', height: '100%' }} />
            </div>
            <Img 
                src={staticFile("images/v3/scene${scene.number}-char.svg")} 
                style={{ 
                    position: 'absolute', bottom: 50, left: 100, width: 400,
                    transform: \`translateY(\${Math.sin(frame/10)*10}px)\` 
                }} 
            />
            <Audio src={staticFile("audio/v3/scene${scene.number}.mp3")} />
            <div style={{ 
                position: 'absolute', bottom: 20, left: 0, width: '100%', 
                textAlign: 'center', fontSize: 40, color: 'white', 
                textShadow: '2px 2px 4px black',
                background: 'rgba(0,0,0,0.5)', padding: 20
            }}>
                ${scene.narration}
            </div>
        </AbsoluteFill>
    );
};`;
        await fs.writeFile(`src/StoryV3/Scene${scene.number}.tsx`, code);
    }

    private async generateV3Root(script: V3Script) {
        const imports = script.scenes.map(s => `import { Scene${s.number} } from './StoryV3/Scene${s.number}';`).join('\n');
        const sequences = script.scenes.map((s, i) => 
            `<Sequence from={${i*300}} durationInFrames={300}><Scene${s.number} /></Sequence>`
        ).join('\n');

        const code = `import { Composition, Sequence } from 'remotion';
${imports}

export const StoryVideoV3 = () => (
    <>
        ${sequences}
    </>
);

export const RemotionRootV3 = () => (
    <Composition
        id="StoryVideoV3"
        component={StoryVideoV3}
        durationInFrames={${script.scenes.length * 300}}
        fps={30}
        width={1920}
        height={1080}
    />
);`;
        await fs.writeFile('src/RootV3.tsx', code);
    }
}
