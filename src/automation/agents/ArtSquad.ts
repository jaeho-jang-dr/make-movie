
import { GoogleGenerativeAI } from '@google/generative-ai';
import { V3Script, V3Character } from './StorySquad';

// --- Types ---
export interface StyleGuide {
    id: string;
    palette: string[]; // ["#2C3E50", "#E74C3C", ...] - 5 colors max
    lineWeight: number; // 2 -> Thin, 5 -> Thick
    shapes: string; // "Triangles for villains, circles for heroes"
    mood: string; // "Melancholy Sci-Fi"
    fontFamily: string; // "Roboto"
}

// --- The Art Squad ---
export class ArtSquad {
    private genAI: GoogleGenerativeAI;
    private artDirector: any;
    private bgArtist: any;
    private charArtist: any;
    private propArtist: any;

    private shapeSpecialist: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        const modelName = 'models/gemini-2.5-flash';

        // 1. Lead Director
        this.artDirector = this.genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: "You are the 'Lead Art Director'. You define the overall visual direction. DO NOT DRAW. Only dictate: Mood and Atmosphere. Be precise."
        });

        // 2. Shape Specialist (The 5th Agent)
        this.shapeSpecialist = this.genAI.getGenerativeModel({
             model: modelName,
             systemInstruction: "You are the 'Shape & Form Specialist'. You define the geometric language of the world (e.g., 'Villains are sharp triangles, Heroes are soft circles'). Focus only on SHAPES and LINE WEIGHT."
        });

        // 3. Background Artist
        this.bgArtist = this.genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: "You are the 'Background Artist'. You strictly follow the Director's Palette and Shape Language. Output complex SVG landscapes with layers. Avoid characters."
        });

        // 4. Character Artist
        this.charArtist = this.genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: "You are the 'Lead Character Animator'. You design unique, expressive characters based on the Style Guide. Output SVG sprites with transparent backgrounds."
        });

        // 5. Prop Artist
        this.propArtist = this.genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: "You are the 'Prop Master'. You create detailed items (swords, potions, cars) that fit the world. SVG only."
        });
    }

    // Phase 1: Establish the Style
    async establishStyle(script: V3Script): Promise<StyleGuide> {
        console.log("🎨 Art Squad Meeting (5 Agents)...");

        try {
            // Step 1: Director sets the Mood
            const moodResult = await this.artDirector.generateContent(
                `Define the Mood and Color Palette (5 hex codes) for: "${script.title} - ${script.theme}". JSON Output: { "mood": "...", "palette": ["#...", ...] }`
            );
            const moodJson = JSON.parse(moodResult.response.text().replace(/```json|```/g, '').trim());

            // Step 2: Shape Specialist defines the Forms
            const shapeResult = await this.shapeSpecialist.generateContent(
                `Based on the mood "${moodJson.mood}", define the Shape Language (Geometry) and Line Weight (px). JSON Output: { "shapes": "...", "lineWeight": 3 }`
            );
            const shapeJson = JSON.parse(shapeResult.response.text().replace(/```json|```/g, '').trim());

            return {
                id: "style_v3",
                palette: moodJson.palette,
                mood: moodJson.mood,
                shapes: shapeJson.shapes,
                lineWeight: shapeJson.lineWeight,
                fontFamily: "Roboto"
            };
        } catch (e) {
            console.warn("⚠️ Art Squad API failed. Using fallback style guide...");
            return this.getFallbackStyle(script.theme);
        }
    }

    private getFallbackStyle(theme: string): StyleGuide {
        return {
            id: "style_v3_fallback",
            palette: ["#87CEEB", "#FFD700", "#90EE90", "#FF6B6B", "#4ECDC4"],
            mood: "Warm and Friendly Adventure",
            shapes: "Soft circles for heroes, gentle curves everywhere",
            lineWeight: 3,
            fontFamily: "Roboto"
        };
    }

    // Phase 2: Parallel Asset Creation
    async createBackground(description: string, style: StyleGuide): Promise<string> {
        try {
            const prompt = `
            Create a Background SVG.
            Style Guide:
            - Palette: ${style.palette.join(', ')} (USE THESE COLORS ONLY).
            - Mood: ${style.mood}.
            - Shapes: ${style.shapes}.

            Description: ${description}.
            Requirements:
            - 1920x1080.
            - Use <defs> for gradients.
            - No text.
            `;
            const result = await this.bgArtist.generateContent(prompt);
            return this.extractSvg(result.response.text());
        } catch (e) {
            console.warn("    ⚠️ BG API failed, using procedural generation");
            return this.createProceduralBackground(style);
        }
    }

    async createCharacter(char: V3Character, action: string, style: StyleGuide): Promise<string> {
        try {
            const prompt = `
            Create a Character SVG Sprite.
            Character: ${char.name} (${char.archetype}).
            Visuals: ${char.visualTraits}.
            Action: ${action}.

            Style Guide:
            - Palette: ${style.palette.join(', ')}.
            - Shapes: ${style.shapes}.
            - Line Weight: ${style.lineWeight}px black strokes.

            Requirements:
            - 512x512 ViewBox.
            - Transparent BG.
            - Expressive face.
            `;
            const result = await this.charArtist.generateContent(prompt);
            return this.extractSvg(result.response.text());
        } catch (e) {
            console.warn("    ⚠️ Char API failed, using procedural generation");
            return this.createProceduralCharacter(char, style);
        }
    }

    private createProceduralBackground(style: StyleGuide): string {
        const random = () => Math.random();
        const sky = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${style.palette[0]}"/>
            <stop offset="100%" stop-color="${style.palette[1]}"/>
        </linearGradient></defs>`;

        const ground = `<rect y="800" width="1920" height="280" fill="${style.palette[2]}"/>`;

        let trees = '';
        for (let i = 0; i < 10; i++) {
            const x = random() * 1920;
            const h = 100 + random() * 150;
            trees += `<circle cx="${x}" cy="${850 - h}" r="${h}" fill="${style.palette[3]}" opacity="0.7"/>`;
        }

        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
            ${sky}<rect width="100%" height="100%" fill="url(#sky)"/>
            ${ground}${trees}
        </svg>`;
    }

    private createProceduralCharacter(char: V3Character, style: StyleGuide): string {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <circle cx="256" cy="200" r="120" fill="${style.palette[4]}" stroke="black" stroke-width="${style.lineWeight}"/>
            <circle cx="220" cy="180" r="15" fill="white"/>
            <circle cx="292" cy="180" r="15" fill="white"/>
            <circle cx="220" cy="180" r="7" fill="black"/>
            <circle cx="292" cy="180" r="7" fill="black"/>
            <path d="M220 240 Q256 270 292 240" stroke="black" stroke-width="${style.lineWeight}" fill="none" stroke-linecap="round"/>
            <circle cx="256" cy="400" r="80" fill="${style.palette[4]}" stroke="black" stroke-width="${style.lineWeight}"/>
        </svg>`;
    }
    
    // Helper
    private extractSvg(text: string): string {
        const match = text.match(/<svg[\s\S]*<\/svg>/);
        return match ? match[0] : `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='50'>Error</text></svg>`;
    }
}
