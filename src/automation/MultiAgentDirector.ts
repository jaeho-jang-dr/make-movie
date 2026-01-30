
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { promises as fs } from 'fs';
import path from 'path';

// --- Interfaces for the Squad System ---

interface MovieConfig {
    title: string;
    durationMinutes: number; // Target 10 minutes
    theme: string;
}

interface Character {
    id: string;
    name: string;
    description: string;
    visualTraits: string; // e.g., "blue robot, round head, glowing eyes"
    voiceParams: {
        name: string; // TTS voice name
        pitch: number;
        speakingRate: number;
    };
}

interface CameraInstruction {
    type: 'wide' | 'close-up' | 'pan-left' | 'pan-right' | 'zoom-in' | 'static';
    focus: string; // what to focus on
}

interface SceneDetailed {
    sceneNumber: number;
    narration: string; // The actual story text
    dialogue?: { characterId: string; text: string }[]; // Optional dialogue
    visualPrompt: string; // For the background artist
    camera: CameraInstruction;
    charactersInScene: string[]; // IDs of characters present
    actionDescription: string; // For the animator (e.g., "walking left to right")
    durationSeconds: number;
    estimatedWordCount: number;
}

// --- The Director Class ---

export class MultiAgentDirector {
    private genAI: GoogleGenerativeAI;
    private ttsClient: TextToSpeechClient;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.ttsClient = new TextToSpeechClient();
        // Updated to use the latest available model: gemini-2.5-flash
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    // --- Phase 1: Pre-Production Squad ---
    
    async startProduction(config: MovieConfig) {
        console.log("🎬 PROJECT START: " + config.title);
        console.log("👨‍👩‍👧‍👦 Squad 1 (Creative) Assembling...");

        // 1. Character Designer Agent
        const characters = await this.designCharacters(config);
        console.log("✅ Characters Designed:", characters.map(c => c.name).join(', '));

        // 2. Storyteller Agent
        const script = await this.writeScript(config, characters);
        console.log(`✅ Script Written: ${script.length} scenes generated.`);

        // --- Phase 2: Production Squad ---
        console.log("🎨 Squad 2 (Production) Moving out...");
        
        await this.generateAssets(script, characters);

        // --- Phase 3: Post-Production Squad ---
        console.log("✂️ Squad 3 (Post-Production) Editing...");
        await this.generateRemotionCode(script, characters);
        
        console.log("🎉 Production Complete!");
    }

    // Agent: Character Designer
    private async designCharacters(config: MovieConfig): Promise<Character[]> {
        console.log("  👤 Designing Characters...");
        const prompt = `
        You are a Lead Character Designer for an animated movie titled "${config.title}".
        Theme: ${config.theme}.
        
        Create 2-3 unique main characters.
        For each character, provide:
        - Name
        - Visual Traits (very detailed for SVG generation later: colors, shapes, clothing, accessories)
        - Personality
        
        Output JSON format:
        [
            { "id": "char1", "name": "...", "description": "...", "visualTraits": "..." }
        ]
        `;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        try {
            const json = JSON.parse(text.replace(/```json|```/g, '').trim());
            
            // Assign voices procedurally to ensure variety
            const voices = ['ko-KR-Neural2-A', 'ko-KR-Neural2-B', 'ko-KR-Neural2-C'];
            
            return json.map((c: any, index: number) => ({
                ...c,
                voiceParams: {
                    name: voices[index % voices.length],
                    pitch: 0.8 + Math.random() * 0.4, // Random pitch between 0.8 and 1.2
                    speakingRate: 0.9 + Math.random() * 0.2 // Random rate
                }
            }));
        } catch (e) {
            console.error("Failed to parse characters JSON:", text);
            return [];
        }
    }

    // Agent: Storyteller
    private async writeScript(config: MovieConfig, characters: Character[]): Promise<SceneDetailed[]> {
        console.log("  ✍️ Writing Script (Target: 10 mins)...");
        // 10 minutes = 600 seconds. Average scene 10s => 60 scenes.
        
        const characterContext = characters.map(c => `${c.name}: ${c.description}`).join('\n');
        
        const prompt = `
        You are a Master Screenwriter. Write a script for "${config.title}".
        Characters:
        ${characterContext}
        
        Requirements:
        1. Total Duration: Must be roughly 10 minutes (approx 60 scenes).
        2. NO META COMMENTS. Do NOT write "Scene 1 begins". Only write the narration/dialogue.
        3. Visuals: Describe the visual setting vividly for an artist.
        4. Camera: Direct the camera (Wide shot of forest, Close up of ${characters[0].name}, etc).
        5. Structure: Introduction -> Adventure -> Climax -> Resolution.
        
        Output JSON format (List of Scenes):
        [
            {
                "sceneNumber": 1,
                "narration": "Full narration text here...",
                "visualPrompt": "Detailed background description...",
                "camera": { "type": "wide", "focus": "landscape" },
                "charactersInScene": ["char1"],
                "actionDescription": "walking from left to right",
                "durationSeconds": 10
            }
        ]
        
        Generate the first 20 scenes (Introduction & Start of Adventure) effectively.
        Maximize emotional depth and visual variety.
        `;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        try {
             return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (e) {
            console.error("JSON Parse Error in Script:", text);
            return [];
        }
    }

    // --- Phase 2: Asset Generation ---

    private async generateAssets(scenes: SceneDetailed[], characters: Character[]) {
        await fs.mkdir('public/images/v2', { recursive: true });
        await fs.mkdir('public/audio/v2', { recursive: true });

        // Parallel processing would be better, but sequential for safety on API limits
        for (const scene of scenes) {
            console.log(`  🎨 Processing Scene ${scene.sceneNumber}...`);
            
            // 1. Generate Background (Agent: Background Artist)
            await this.generateBackgroundSVG(scene);
            
            // 2. Generate Character Assets (Agent: Character Animator)
            for (const charId of scene.charactersInScene) {
                const char = characters.find(c => c.id === charId);
                if (char) await this.generateCharacterSVG(scene, char);
            }

            // 3. Generate Audio (Agent: Sound Engineer)
            await this.generateAudio(scene, characters);
        }
    }

    private async generateBackgroundSVG(scene: SceneDetailed) {
        // Option A: Try Experimental Imagen 4.0 if enabled/available
        // For now, we wrap this in a try-catch and rely on SVG as primary fallback 
        // because we haven't confirmed Imagen 4.0 SDK signature.
        /*
        try {
             const imagenModel = this.genAI.getGenerativeModel({ model: 'imagen-4.0-generate-001' });
             // Placeholder for future Imagen integration
        } catch(e) {}
        */

        // Option B: High Quality SVG via Gemini 2.5 Flash
        const prompt = `
        role: Professional SVG Artist.
        task: Create a BACKGROUND for a scene.
        description: ${scene.visualPrompt}.
        mood: ${scene.camera.type} shot.
        requirements:
        - Output RAW SVG code only.
        - Width: 1920, Height: 1080.
        - Use complex paths and gradients (defs/linearGradient) for a "premium animation" look.
        - NO TEXT placeholders.
        - Style: Flat design, vibrant colors, artistic depth.
        `;
        
        try {
            const result = await this.model.generateContent(prompt);
            const svg = this.extractSvg(result.response.text());
            await fs.writeFile(`public/images/v2/scene${scene.sceneNumber}-bg.svg`, svg);
        } catch (e) {
            console.error(`    ❌ BG Gen Failed Scene ${scene.sceneNumber}:`, e);
            // Fallback: minimal valid SVG
            await fs.writeFile(`public/images/v2/scene${scene.sceneNumber}-bg.svg`, 
                `<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#333"/><text x="50" y="50" fill="white">BG Fail</text></svg>`);
        }
    }

    private async generateCharacterSVG(scene: SceneDetailed, char: Character) {
        const action = scene.actionDescription;
        const prompt = `
        role: Professional SVG Character Designer.
        task: Create a CHARACTER SPRITE.
        character: ${char.visualTraits}.
        action: ${action}.
        requirements:
        - Output RAW SVG code only.
        - ViewBox: 0 0 512 512.
        - Transparent background.
        - Character must be fully visible.
        - Style: Consistent with children's high-quality animation.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const svg = this.extractSvg(result.response.text());
             await fs.writeFile(`public/images/v2/scene${scene.sceneNumber}-${char.id}.svg`, svg);
        } catch (e) {
             // Fallback
        }
    }

    private async generateAudio(scene: SceneDetailed, characters: Character[]) {
        const request = {
            input: { text: scene.narration },
            voice: { languageCode: 'ko-KR', name: 'ko-KR-Neural2-A' },
            audioConfig: { audioEncoding: 'MP3' as const, speakingRate: 1.0, pitch: 1.0 }
        };

        try {
            const [response] = await this.ttsClient.synthesizeSpeech(request);
            if (response.audioContent) {
                 await fs.writeFile(`public/audio/v2/scene${scene.sceneNumber}.mp3`, response.audioContent, 'binary');
            }
        } catch (e) {
            console.error("    ❌ Audio Failed:", e);
        }
    }

    private extractSvg(text: string): string {
        const match = text.match(/<svg[\s\S]*<\/svg>/);
        return match ? match[0] : text;
    }

    // --- Phase 3: Post-Production ---
    
    private async generateRemotionCode(scenes: SceneDetailed[], characters: Character[]) {
        await fs.mkdir('src/StoryV2', { recursive: true });

        // Generate individual scene components
        for (const scene of scenes) {
            const componentCode = this.generateSceneComponentV2(scene);
            await fs.writeFile(`src/StoryV2/Scene${scene.sceneNumber}.tsx`, componentCode);
        }

        // Generate Main Sequence
        const mainVideoCode = this.generateMainVideoV2(scenes);
        await fs.writeFile('src/StoryVideoV2.tsx', mainVideoCode);

        // Generate Root
        const rootCode = this.generateRootV2(scenes);
        await fs.writeFile('src/RootV2.tsx', rootCode);
        
        console.log("  ✅ Remotion V2 Code Generated.");
    }

    private generateSceneComponentV2(scene: SceneDetailed): string {
        const durationFrames = Math.floor(scene.durationSeconds * 30);
        
        // Camera Movement Logic
        let bgTransform = '';
        switch(scene.camera.type) {
            case 'pan-left':
                bgTransform = `translateX(\${interpolate(frame, [0, ${durationFrames}], [0, -100])}px)`;
                break;
            case 'pan-right':
                bgTransform = `translateX(\${interpolate(frame, [0, ${durationFrames}], [-100, 0])}px)`;
                break;
            case 'zoom-in':
                bgTransform = `scale(\${interpolate(frame, [0, ${durationFrames}], [1, 1.2])})`;
                break;
            case 'close-up':
                bgTransform = `scale(1.3)`;
                break;
            default: // wide or static
                bgTransform = `scale(1)`;
        }

        // Character Animation Logic (Simple Bobbing/Walking)
        const charAnimation = scene.actionDescription.includes('walking') 
            ? `translateY(\${Math.sin(frame / 5) * 10}px)` 
            : `translateY(0px)`;

        const characterElements = scene.charactersInScene.map((charId, index) => {
            return `
            <Img
                src={staticFile("images/v2/scene${scene.sceneNumber}-${charId}.svg")}
                style={{
                    position: 'absolute',
                    bottom: 100,
                    left: ${200 + index * 400}, // simple positioning
                    width: 400,
                    height: 400,
                    transform: \`${charAnimation}\`
                }}
            />`;
        }).join('\n');

        return `import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

export const Scene${scene.sceneNumber} = () => {
    const frame = useCurrentFrame();
    
    return (
        <AbsoluteFill>
            {/* Background Layer with Camera Move */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                transform: \`${bgTransform}\`,
                transformOrigin: 'center center'
            }}>
                <Img 
                    src={staticFile("images/v2/scene${scene.sceneNumber}-bg.svg")}
                    style={{
                        width: '110%', // slightly larger for panning
                        height: '110%',
                        objectFit: 'cover',
                        left: '-5%',
                        top: '-5%'
                    }}
                />
            </div>

            {/* Characters Layer */}
            ${characterElements}

            {/* Narration Audio */}
            <Audio src={staticFile("audio/v2/scene${scene.sceneNumber}.mp3")} />

            {/* Subtitles (Simple) */}
            <div style={{
                position: 'absolute',
                bottom: 50,
                width: '100%',
                textAlign: 'center',
                color: 'white',
                fontSize: 40,
                textShadow: '2px 2px 4px black',
                padding: 20,
                backgroundColor: 'rgba(0,0,0,0.4)'
            }}>
                ${scene.narration}
            </div>
        </AbsoluteFill>
    );
};`;
    }

    private generateMainVideoV2(scenes: SceneDetailed[]): string {
        const imports = scenes.map(s => `import { Scene${s.sceneNumber} } from './StoryV2/Scene${s.sceneNumber}';`).join('\n');
        
        let currentFrame = 0;
        const sequences = scenes.map(s => {
            const dur = Math.floor(s.durationSeconds * 30);
            const seq = `<Sequence from={${currentFrame}} durationInFrames={${dur}}><Scene${s.sceneNumber} /></Sequence>`;
            currentFrame += dur;
            return seq;
        }).join('\n');

        return `import { AbsoluteFill, Sequence } from 'remotion';
${imports}

export const StoryVideoV2 = () => {
    return (
        <AbsoluteFill>
            ${sequences}
        </AbsoluteFill>
    );
};`;
    }

    private generateRootV2(scenes: SceneDetailed[]): string {
        const totalDuration = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);
        return `import { Composition } from 'remotion';
import { StoryVideoV2 } from './StoryVideoV2';

export const RemotionRootV2 = () => {
    return (
        <Composition
            id="StoryVideoV2"
            component={StoryVideoV2}
            durationInFrames={${Math.floor(totalDuration * 30)}}
            fps={30}
            width={1920}
            height={1080}
        />
    );
};`;
    }
}
