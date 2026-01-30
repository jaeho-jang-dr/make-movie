// 에셋 기획 및 생성 관리 시스템
import { GrokAgent } from './agents/GrokAgent';
import { promises as fs } from 'fs';

export interface CharacterPose {
    name: string;
    angle: 'front' | 'side' | 'back' | 'three-quarter';
    action: 'standing' | 'walking' | 'running' | 'bending' | 'pointing' | 'surprised' | 'happy' | 'scared';
    description: string;
}

export interface PropAsset {
    name: string;
    description: string;
    importance: 'major' | 'minor';
}

export interface BackgroundAsset {
    sceneNumber: number;
    location: string;
    timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
    mood: string;
    description: string;
    colorPalette: string[];
}

export interface AssetPlan {
    characters: {
        name: string;
        poses: CharacterPose[];
    }[];
    props: PropAsset[];
    backgrounds: BackgroundAsset[];
}

export class AssetPlanner {
    private grok: GrokAgent;

    constructor(grokApiKey: string) {
        this.grok = new GrokAgent(grokApiKey);
    }

    // 스토리 기반 완전한 에셋 계획 생성
    async planAllAssets(script: any): Promise<AssetPlan> {
        console.log('🎨 전체 에셋 기획 중...');

        const prompt = `You are a Disney-Pixar animation asset director.

Given this story script:
${JSON.stringify(script, null, 2)}

Create a COMPLETE asset plan in **Disney/Pixar cartoon style**:

1. **Character Poses** - For each main character (민수, 지연), define 8-10 different poses:
   - Different angles: front, side, back, three_quarter (NO SLASHES IN NAMES)
   - Different actions: standing, walking, running, bending, pointing, surprised, happy, scared
   - **Disney Style Details**:
     - Expressive eyes and facial features
     - Dynamic poses with personality
     - Colorful, detailed clothing with patterns
     - Accessories (민수: red cap, backpack, worn sneakers; 지연: pink glasses, sketchbook, curly hair)
     - Cute, appealing proportions (big eyes, small nose)
   - Match poses to story needs (민수 falling, 지연 pointing flashlight, etc.)
   - IMPORTANT: Use underscores and Korean only (e.g., "민수_앞모습_서있기", "지연_옆모습_걷기")

2. **Props** - List ALL objects in Disney style:
   - Major: 개구리_로봇, 반짝이는_수정, 손전등
   - Each prop should be cute, colorful, and friendly
   - Use underscores in names

3. **Backgrounds** - For EACH of the ${script.scenes.length} scenes, design a UNIQUE background:
   - Location description (Disney environmental storytelling with rich details)
   - Time of day
   - Mood/atmosphere
   - Color palette (5 hex codes - vibrant, saturated Disney colors)
   - Make each scene visually DISTINCT

Output valid JSON only:
{
  "characters": [
    {
      "name": "민수",
      "poses": [
        {
          "name": "민수_앞모습_서있기",
          "angle": "front",
          "action": "standing",
          "description": "Red cap, freckles, friendly smile, hands at sides, full body view"
        }
      ]
    }
  ],
  "props": [
    {
      "name": "개구리_로봇",
      "description": "Large mechanical frog with glowing red eyes, metallic green body, springs for legs",
      "importance": "major"
    }
  ],
  "backgrounds": [
    {
      "sceneNumber": 1,
      "location": "Forest Edge",
      "timeOfDay": "dusk",
      "mood": "mysterious and foreboding",
      "description": "Dark twisted trees at forest edge, misty atmosphere, village lights in distance",
      "colorPalette": ["#2C3E50", "#34495E", "#7F8C8D", "#95A5A6", "#BDC3C7"]
    }
  ]
}`;

        const response = await this.grok.generateContent(
            prompt,
            "You are an expert animation pre-production planner. Create detailed, varied asset specifications. Output ONLY valid JSON, no extra text."
        );

        // Extract and clean JSON
        let jsonText = response.replace(/```json|```/g, '').trim();

        // Try to find JSON object
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonText = jsonMatch[0];
        }

        let plan;
        try {
            plan = JSON.parse(jsonText);
        } catch (e) {
            console.error("❌ JSON Parse Error. Using fallback plan...");
            plan = this.getFallbackAssetPlan();
        }

        console.log(`✅ 에셋 계획 완료:`);
        console.log(`   - 캐릭터: ${plan.characters.length}명 (총 ${plan.characters.reduce((sum: number, c: any) => sum + c.poses.length, 0)}개 포즈)`);
        console.log(`   - 소품: ${plan.props.length}개`);
        console.log(`   - 배경: ${plan.backgrounds.length}개`);

        await fs.writeFile('data/asset-plan.json', JSON.stringify(plan, null, 2));
        return plan;
    }

    private getFallbackAssetPlan(): AssetPlan {
        return {
            characters: [
                {
                    name: "민수",
                    poses: [
                        { name: "민수_앞모습_서있기", angle: "front", action: "standing", description: "Red cap, freckles, friendly smile, backpack, blue t-shirt" },
                        { name: "민수_옆모습_걷기", angle: "side", action: "walking", description: "Walking pose, one leg forward, arms swinging" },
                        { name: "민수_앞모습_놀람", angle: "front", action: "surprised", description: "Eyes wide, mouth open, hands raised" },
                        { name: "민수_앞모습_가리키기", angle: "front", action: "pointing", description: "Pointing forward with confident expression" },
                        { name: "민수_앞모습_구부리기", angle: "front", action: "bending", description: "Bending down, looking at ground" },
                        { name: "민수_옆모습_달리기", angle: "side", action: "running", description: "Running fast, determined look" }
                    ]
                },
                {
                    name: "지연",
                    poses: [
                        { name: "지연_앞모습_서있기", angle: "front", action: "standing", description: "Pink glasses, curly hair, holding sketchbook, yellow dress" },
                        { name: "지연_옆모습_걷기", angle: "side", action: "walking", description: "Walking confidently with sketchbook" },
                        { name: "지연_앞모습_웃음", angle: "front", action: "happy", description: "Big smile, glasses sparkling" },
                        { name: "지연_앞모습_손전등", angle: "front", action: "pointing", description: "Holding flashlight, shining it forward" },
                        { name: "지연_앞모습_놀람", angle: "front", action: "surprised", description: "Surprised expression, hands on face" },
                        { name: "지연_옆모습_달리기", angle: "side", action: "running", description: "Running alongside friend" }
                    ]
                }
            ],
            props: [
                { name: "개구리_로봇", description: "Giant mechanical frog with glowing red eyes, metallic green body", importance: "major" },
                { name: "반짝이는_수정", description: "Glowing blue crystal floating in pond", importance: "major" },
                { name: "손전등", description: "Yellow flashlight with bright beam", importance: "major" },
                { name: "배낭", description: "Red backpack on 민수", importance: "minor" },
                { name: "스케치북", description: "Pink sketchbook held by 지연", importance: "minor" }
            ],
            backgrounds: [
                { sceneNumber: 1, location: "Forest Edge", timeOfDay: "dusk", mood: "mysterious", description: "Dark forest edge, twisted trees, village lights in distance", colorPalette: ["#2C3E50", "#34495E", "#7F8C8D", "#95A5A6", "#ECF0F1"] },
                { sceneNumber: 2, location: "Village Path", timeOfDay: "day", mood: "cheerful", description: "Sunny village path, colorful houses", colorPalette: ["#3498DB", "#E74C3C", "#F39C12", "#2ECC71", "#ECF0F1"] },
                { sceneNumber: 3, location: "Forest Entrance", timeOfDay: "dusk", mood: "intriguing", description: "Mysterious light in forest, glowing entrance", colorPalette: ["#34495E", "#F39C12", "#E67E22", "#16A085", "#2C3E50"] },
                { sceneNumber: 4, location: "Forest Path", timeOfDay: "night", mood: "adventurous", description: "Dark forest path, moonlight filtering through trees", colorPalette: ["#2C3E50", "#34495E", "#27AE60", "#2ECC71", "#BDC3C7"] },
                { sceneNumber: 5, location: "Deep Forest", timeOfDay: "night", mood: "tense", description: "Very dark forest, roots and obstacles", colorPalette: ["#1C2833", "#34495E", "#27AE60", "#7F8C8D", "#95A5A6"] },
                { sceneNumber: 6, location: "Forest Clearing", timeOfDay: "night", mood: "hopeful", description: "Small clearing, brighter light ahead", colorPalette: ["#34495E", "#E67E22", "#F39C12", "#27AE60", "#ECF0F1"] },
                { sceneNumber: 7, location: "Magical Pond", timeOfDay: "night", mood: "magical", description: "Glowing pond with crystal, mystical atmosphere", colorPalette: ["#2C3E50", "#3498DB", "#5DADE2", "#1ABC9C", "#F4D03F"] },
                { sceneNumber: 8, location: "Pond Arena", timeOfDay: "night", mood: "dramatic", description: "Frog robot emerging from pond, splashes", colorPalette: ["#E74C3C", "#C0392B", "#34495E", "#2C3E50", "#7F8C8D"] },
                { sceneNumber: 9, location: "Pond Shore", timeOfDay: "night", mood: "touching", description: "Calmer pond, robot listening", colorPalette: ["#3498DB", "#2980B9", "#27AE60", "#F4D03F", "#ECF0F1"] },
                { sceneNumber: 10, location: "Magical Celebration", timeOfDay: "night", mood: "joyful", description: "Glowing crystal illuminating happy scene, dancing", colorPalette: ["#F4D03F", "#F39C12", "#3498DB", "#2ECC71", "#ECF0F1"] }
            ]
        };
    }

    // SVG 생성 (Grok 또는 고급 procedural)
    async generateCharacterPose(character: string, pose: CharacterPose, style: any): Promise<string> {
        console.log(`  🎭 생성 중: ${pose.name}`);

        const prompt = `Create a detailed SVG sprite for a DISNEY-PIXAR style animation character.

Character: ${character}
Pose: ${pose.description}
Angle: ${pose.angle}
Action: ${pose.action}

**Disney-Pixar Style Requirements**:
- Large, expressive eyes with sparkle/highlight
- Vibrant, saturated colors
- Smooth, rounded shapes
- Dynamic, personality-filled pose
- Detailed clothing with patterns/textures
- Accessories clearly visible (hat, glasses, backpack, etc.)
- Cute proportions (big head, small body for children)
- Clean outlines with ${style.lineWeight}px stroke
- Professional character design quality

Color Palette: ${style.palette.join(', ')}

Technical Requirements:
- ViewBox: 0 0 512 512
- Center character in frame
- Transparent background
- Clean vector paths
- Layer face features (eyes, nose, mouth on top)
- Output ONLY the SVG code, nothing else`;

        try {
            const response = await this.grok.generateContent(prompt, "You are a professional character artist.");
            const svgMatch = response.match(/<svg[\s\S]*?<\/svg>/);
            if (svgMatch) {
                return svgMatch[0];
            }
        } catch (e) {
            console.warn(`  ⚠️ Grok failed, using procedural for ${pose.name}`);
        }

        // Fallback: Enhanced procedural generation
        return this.createProceduralCharacter(character, pose, style);
    }

    async generateProp(prop: PropAsset, style: any): Promise<string> {
        console.log(`  🎁 생성 중: ${prop.name}`);

        const prompt = `Create a detailed SVG illustration of this object for a children's animation.

Object: ${prop.name}
Description: ${prop.description}

Style Guide:
- Color Palette: ${style.palette.join(', ')}
- Line Weight: ${style.lineWeight}px
- Mood: ${style.mood}

Requirements:
- ViewBox: 0 0 512 512
- Center object
- Clean, recognizable silhouette
- Suitable for children's content
- Output ONLY the SVG code`;

        try {
            const response = await this.grok.generateContent(prompt, "You are a professional prop designer.");
            const svgMatch = response.match(/<svg[\s\S]*?<\/svg>/);
            if (svgMatch) {
                return svgMatch[0];
            }
        } catch (e) {
            console.warn(`  ⚠️ Grok failed for prop, using procedural`);
        }

        return this.createProceduralProp(prop, style);
    }

    async generateBackground(bg: BackgroundAsset): Promise<string> {
        console.log(`  🏞️ 생성 중: Scene ${bg.sceneNumber} - ${bg.location}`);

        const prompt = `Create a detailed SVG background for a children's animation scene.

Scene: ${bg.location}
Time: ${bg.timeOfDay}
Mood: ${bg.mood}
Description: ${bg.description}
Color Palette: ${bg.colorPalette.join(', ')} (USE THESE COLORS ONLY)

Requirements:
- ViewBox: 0 0 1920 1080
- Layered depth (foreground, midground, background)
- Atmospheric perspective
- No characters
- Rich detail
- Output ONLY the SVG code`;

        try {
            const response = await this.grok.generateContent(prompt, "You are a professional background artist.");
            const svgMatch = response.match(/<svg[\s\S]*?<\/svg>/);
            if (svgMatch) {
                return svgMatch[0];
            }
        } catch (e) {
            console.warn(`  ⚠️ Grok failed for background, using procedural`);
        }

        return this.createProceduralBackground(bg);
    }

    // Enhanced Procedural Generators
    private createProceduralCharacter(character: string, pose: CharacterPose, style: any): string {
        const color = style.palette[Math.floor(Math.random() * style.palette.length)];
        const x = 256, y = 300;

        let rotation = 0;
        if (pose.angle === 'side') rotation = 30;
        if (pose.angle === 'back') rotation = 180;

        let bodyOffset = 0;
        if (pose.action === 'walking') bodyOffset = 20;
        if (pose.action === 'bending') bodyOffset = 50;

        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <g transform="rotate(${rotation} ${x} ${y})">
                <!-- Body -->
                <ellipse cx="${x}" cy="${y + bodyOffset}" rx="80" ry="100" fill="${color}" stroke="black" stroke-width="${style.lineWeight}"/>
                <!-- Head -->
                <circle cx="${x}" cy="${y - 80}" r="60" fill="${color}" stroke="black" stroke-width="${style.lineWeight}"/>
                <!-- Eyes -->
                <circle cx="${x - 20}" cy="${y - 85}" r="8" fill="white"/>
                <circle cx="${x + 20}" cy="${y - 85}" r="8" fill="white"/>
                <circle cx="${x - 20}" cy="${y - 85}" r="4" fill="black"/>
                <circle cx="${x + 20}" cy="${y - 85}" r="4" fill="black"/>
                <!-- Smile -->
                <path d="M${x - 20} ${y - 60} Q${x} ${y - 50} ${x + 20} ${y - 60}" stroke="black" stroke-width="${style.lineWeight}" fill="none"/>
                <!-- Arms -->
                ${pose.action === 'pointing' ?
                    `<line x1="${x}" y1="${y}" x2="${x + 80}" y2="${y - 50}" stroke="black" stroke-width="${style.lineWeight * 2}"/>` :
                    `<line x1="${x - 60}" y1="${y + 20}" x2="${x - 40}" y2="${y + 80}" stroke="black" stroke-width="${style.lineWeight * 2}"/>
                     <line x1="${x + 60}" y1="${y + 20}" x2="${x + 40}" y2="${y + 80}" stroke="black" stroke-width="${style.lineWeight * 2}"/>`
                }
                <!-- Legs -->
                <line x1="${x - 30}" y1="${y + 100}" x2="${x - 30}" y2="${y + 180}" stroke="black" stroke-width="${style.lineWeight * 2}"/>
                <line x1="${x + 30}" y1="${y + 100}" x2="${x + 30}" y2="${y + 180}" stroke="black" stroke-width="${style.lineWeight * 2}"/>
            </g>
        </svg>`;
    }

    private createProceduralProp(prop: PropAsset, style: any): string {
        // 개구리 로봇 특수 처리
        if (prop.name.includes('개구리') || prop.name.includes('로봇')) {
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <!-- Robot Frog Body -->
                <ellipse cx="256" cy="300" rx="120" ry="80" fill="#2ECC71" stroke="black" stroke-width="4"/>
                <!-- Head -->
                <ellipse cx="256" cy="200" rx="100" ry="90" fill="#27AE60" stroke="black" stroke-width="4"/>
                <!-- Eyes (glowing red) -->
                <circle cx="220" cy="180" r="30" fill="#E74C3C" opacity="0.8"/>
                <circle cx="292" cy="180" r="30" fill="#E74C3C" opacity="0.8"/>
                <circle cx="220" cy="180" r="15" fill="#C0392B"/>
                <circle cx="292" cy="180" r="15" fill="#C0392B"/>
                <!-- Mouth -->
                <path d="M200 230 Q256 250 312 230" stroke="black" stroke-width="4" fill="none"/>
                <!-- Metal Plates -->
                <rect x="200" y="250" width="112" height="20" fill="#95A5A6" stroke="black" stroke-width="2"/>
                <rect x="200" y="280" width="112" height="20" fill="#7F8C8D" stroke="black" stroke-width="2"/>
                <!-- Springs (legs) -->
                <path d="M180 350 L180 400 L170 410 L190 420 L180 430 L180 450" stroke="black" stroke-width="6" fill="none"/>
                <path d="M332 350 L332 400 L322 410 L342 420 L332 430 L332 450" stroke="black" stroke-width="6" fill="none"/>
            </svg>`;
        }

        // 수정/보물
        if (prop.name.includes('수정') || prop.name.includes('보물')) {
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <defs>
                    <radialGradient id="glow">
                        <stop offset="0%" stop-color="#FFD700" stop-opacity="1"/>
                        <stop offset="100%" stop-color="#FFA500" stop-opacity="0"/>
                    </radialGradient>
                </defs>
                <!-- Glow -->
                <circle cx="256" cy="256" r="150" fill="url(#glow)" opacity="0.5"/>
                <!-- Crystal -->
                <polygon points="256,100 350,256 256,400 162,256" fill="#3498DB" stroke="#2980B9" stroke-width="4" opacity="0.8"/>
                <polygon points="256,100 300,178 256,256 212,178" fill="#5DADE2" opacity="0.6"/>
                <!-- Sparkles -->
                <circle cx="256" cy="150" r="8" fill="white" opacity="0.9"/>
                <circle cx="300" cy="200" r="6" fill="white" opacity="0.7"/>
                <circle cx="212" cy="220" r="5" fill="white" opacity="0.8"/>
            </svg>`;
        }

        // Generic prop
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <rect x="200" y="200" width="112" height="112" fill="${style.palette[2]}" stroke="black" stroke-width="3"/>
        </svg>`;
    }

    private createProceduralBackground(bg: BackgroundAsset): string {
        const isDark = bg.timeOfDay === 'night' || bg.timeOfDay === 'dusk';
        const palette = bg.colorPalette;

        let sky = `<defs>
            <linearGradient id="sky${bg.sceneNumber}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${palette[0]}"/>
                <stop offset="100%" stop-color="${palette[1]}"/>
            </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#sky${bg.sceneNumber})"/>`;

        // Different terrain for each scene
        let terrain = '';
        const terrainType = bg.sceneNumber % 4;

        if (terrainType === 0 || bg.location.includes('숲')) {
            // Forest
            terrain = `<rect y="700" width="1920" height="380" fill="${palette[2]}"/>`;
            for (let i = 0; i < 15; i++) {
                const x = Math.random() * 1920;
                const h = 100 + Math.random() * 200;
                terrain += `<ellipse cx="${x}" cy="${750 - h/2}" rx="${40 + Math.random() * 30}" ry="${h}" fill="${palette[3]}" opacity="0.8"/>`;
            }
        } else if (terrainType === 1) {
            // Hills
            terrain = `<path d="M0 800 Q480 600 960 800 T1920 800 V1080 H0 Z" fill="${palette[2]}"/>`;
            terrain += `<path d="M0 850 Q480 700 960 850 T1920 850 V1080 H0 Z" fill="${palette[3]}" opacity="0.7"/>`;
        } else {
            // Flat with objects
            terrain = `<rect y="800" width="1920" height="280" fill="${palette[2]}"/>`;
        }

        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
            ${sky}
            ${terrain}
        </svg>`;
    }
}
