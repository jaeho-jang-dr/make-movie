
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { GrokAgent } from './GrokAgent';

// --- Interfaces for Story ---
export interface V3Scene {
    number: number;
    narration: string;
    dialogue?: { charId: string; text: string; mood: string }[];
    visualKeyVisuals: string; // "A glowing blue crystal in a triangular cave"
    propKey: string; // "Crystal"
    moodColor: string; // "Dark Azure"
}

export interface V3Character {
    id: string;
    name: string;
    archetype: string; // "The Wise Trickster"
    visualTraits: string; // "Triangular face, purple scarf"
    personality: string;
}

export interface V3Script {
    title: string;
    theme: string;
    characters: V3Character[];
    scenes: V3Scene[];
}

// --- The Story Squad ---

export class StorySquad {
    private grandmaAgent: GenerativeModel | GrokAgent;
    private kidAgent: GenerativeModel | GrokAgent;
    private synthAgent: GenerativeModel | GrokAgent;
    private useGrok: boolean;

    constructor(apiKey: string, grokApiKey?: string) {
        this.useGrok = !!grokApiKey;

        if (this.useGrok && grokApiKey) {
            console.log("🤖 Using Grok AI (X.AI) for Story Squad");
            this.grandmaAgent = new GrokAgent(grokApiKey);
            this.kidAgent = new GrokAgent(grokApiKey);
            this.synthAgent = new GrokAgent(grokApiKey);
        } else {
            console.log("🤖 Using Google Gemini for Story Squad");
            const genAI = new GoogleGenerativeAI(apiKey);
            const modelName = 'models/gemini-2.5-flash';

            this.grandmaAgent = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: "You are 'Story Grandma'. You know every classic folktale (Aesop, Grimm, Pansori). You value moral structure, clear archetypes, and timeless wisdom. Speak with authority and warmth."
            });

            this.kidAgent = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: "You are 'Story Kid'. You love modern cartoons, sci-fi, video games, and unexpected plot twists. You value humor, action, and breaking traditional rules. Challenge the old ways!"
            });

            this.synthAgent = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: "You are the 'Chief Story Editor'. Your job is to take the conflicting ideas from Grandma and Kid and synthesize them into a coherent V3Script masterpiece. Ensure pacing is perfect for a 10-minute video."
            });
        }
    }

    async developStory(theme: string): Promise<V3Script> {
        console.log("📜 Story Squad Assembling...");

        try {
            if (this.useGrok) {
                return await this.developStoryWithGrok(theme);
            }

            // 1. Brainstorming Phase (Gemini)
            const grandmaIdea = await this.generateWithRetry(this.grandmaAgent as GenerativeModel,
                `Propose a classic story foundation about: "${theme}". Focus on moral lessons and traditional structure.`
            );

            const kidIdea = await this.generateWithRetry(this.kidAgent as GenerativeModel,
                `Take this classic theme: "${theme}" and make it WILD! Add robots, space, magic, or weird humor. Twist the ending!`
            );

            console.log("  👵 Grandma says:", grandmaIdea.response.text().substring(0, 100) + "...");
            console.log("  👦 Kid says:", kidIdea.response.text().substring(0, 100) + "...");

            // 2. Synthesis Phase
            const prompt = `
            Synthesize these two perspectives into a single Master Script.

            [Grandma's Classic Input]: ${grandmaIdea.response.text()}
            [Kid's Modern Input]: ${kidIdea.response.text()}

            Theme: ${theme}
            Format: JSON only.
            Structure:
            {
              "title": "...",
              "theme": "...",
              "characters": [{ "id": "c1", "name": "...", "archetype": "...", "visualTraits": "..." }],
              "scenes": [
                 {
                   "number": 1,
                   "narration": "...",
                   "visualKeyVisuals": "...",
                   "propKey": "...",
                   "moodColor": "..."
                 }
                 ... (Total 10 engaging scenes)
              ]
            }
            `;

            const result = await this.generateWithRetry(this.synthAgent as GenerativeModel, prompt);
            const text = result.response.text();

            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (e) {
            console.warn("⚠️ Story Squad API failed. Using fallback sample story...");
            return this.getFallbackStory(theme);
        }
    }

    private async developStoryWithGrok(theme: string): Promise<V3Script> {
        console.log("🚀 Grok Squad in action!");

        // Single prompt for Grok (simpler, more efficient)
        const prompt = `You are a master storyteller combining classic wisdom with modern creativity.

Create an engaging children's story about: "${theme}"

Requirements:
- Blend traditional storytelling (moral lessons, clear structure) with modern elements (humor, unexpected twists)
- 10 scenes total
- Each scene should have Korean narration, visual description, and mood color
- Output ONLY valid JSON in this exact format:

{
  "title": "Story Title in Korean",
  "theme": "${theme}",
  "characters": [
    {
      "id": "c1",
      "name": "Character Name",
      "archetype": "The Hero/Trickster/etc",
      "visualTraits": "Blue hat, big eyes, etc",
      "personality": "Brave and curious"
    }
  ],
  "scenes": [
    {
      "number": 1,
      "narration": "Korean narration text",
      "visualKeyVisuals": "English visual description for image generation",
      "propKey": "Key prop name",
      "moodColor": "#HEX color code"
    }
  ]
}`;

        const grok = this.grandmaAgent as GrokAgent;
        const text = await grok.generateContent(prompt, "You are an expert children's story creator.");

        return JSON.parse(text.replace(/```json|```/g, '').trim());
    }

    private getFallbackStory(theme: string): V3Script {
        return {
            title: "용감한 친구들의 모험",
            theme: theme,
            characters: [
                {
                    id: "c1",
                    name: "루나",
                    archetype: "용감한 탐험가",
                    visualTraits: "파란 모자, 배낭, 큰 눈",
                    personality: "호기심 많고 용감함"
                },
                {
                    id: "c2",
                    name: "토비",
                    archetype: "현명한 조력자",
                    visualTraits: "안경, 초록 스카프",
                    personality: "신중하고 똑똑함"
                }
            ],
            scenes: [
                {
                    number: 1,
                    narration: "숲 속 마을에 루나와 토비가 살고 있었어요.",
                    visualKeyVisuals: "Peaceful forest village, sunny day",
                    propKey: "Houses",
                    moodColor: "#87CEEB"
                },
                {
                    number: 2,
                    narration: "어느 날, 친구들은 신비한 지도를 발견했습니다.",
                    visualKeyVisuals: "Magical glowing map on a table",
                    propKey: "Map",
                    moodColor: "#FFD700"
                },
                {
                    number: 3,
                    narration: "둘은 용기를 내어 모험을 떠나기로 결심했어요.",
                    visualKeyVisuals: "Path leading into mysterious forest",
                    propKey: "Backpack",
                    moodColor: "#90EE90"
                }
            ]
        };
    }

    private async generateWithRetry(model: GenerativeModel, prompt: string, retries = 3): Promise<any> {
        for (let i = 0; i < retries; i++) {
            try {
                return await model.generateContent(prompt);
            } catch (error: any) {
                if (error.status === 429 || error.message?.includes('429')) {
                    const waitTime = (i + 1) * 5000; // 5s, 10s, 15s
                    console.log(`    ⚠️ Rate Limit (429). Waiting ${waitTime/1000}s before retry...`);
                    await new Promise(r => setTimeout(r, waitTime));
                    continue;
                }
                throw error;
            }
        }
        throw new Error("Max Retries Exceeded for Gemini API");
    }
}
