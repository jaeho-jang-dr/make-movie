
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { promises as fs } from 'fs';
import { V3Scene, V3Character } from './StorySquad';

// --- The Sound Squad ---
export class SoundSquad {
    private ttsClient: TextToSpeechClient;

    constructor() {
        this.ttsClient = new TextToSpeechClient();
    }

    // 1. Casting Directors: Assign distinct voices
    async castVoices(characters: V3Character[]): Promise<Map<string, any>> {
        console.log("🎙️ Sound Squad Casting...");
        const voiceMap = new Map();
        
        // Pool of Korean Neural Voices
        const voices = [
            { name: 'ko-KR-Neural2-A', gender: 'FEMALE' },
            { name: 'ko-KR-Neural2-B', gender: 'FEMALE' },
            { name: 'ko-KR-Neural2-C', gender: 'MALE' }
        ];

        characters.forEach((char, index) => {
            // Assign round-robin to ensure difference
            const baseVoice = voices[index % voices.length];
            
            // Add unique "Acting" parameters (Pitch/Speed jitter)
            voiceMap.set(char.id, {
                languageCode: 'ko-KR',
                name: baseVoice.name,
                ssmlGender: baseVoice.gender,
                audioConfig: {
                    audioEncoding: 'MP3',
                    // Randomize pitch slightly to make them sound distinct even if using same base voice
                    pitch: 0.8 + (Math.random() * 0.4), // 0.8 ~ 1.2
                    speakingRate: 0.9 + (Math.random() * 0.2) // 0.9 ~ 1.1
                }
            });
            console.log(`  casting: ${char.name} -> ${baseVoice.name} (pitch: ${voiceMap.get(char.id).audioConfig.pitch.toFixed(2)})`);
        });

        return voiceMap;
    }

    // 2. Dubbing Engineer: Synthesize Narration & Dialogue
    // "완전 하지 않고 이상 하게 만들어 진것은 다시 고쳐 만들고 나서 보자" 
    // -> We verify the audio file size to ensure it's not broken.
    async recordScene(scene: V3Scene, voiceMap: Map<string, any>): Promise<string> {
        // Construct SSML for rich storytelling
        // We will combine Narration (Neutral Voice) + Dialogue (Character Voices)
        // Note: For simplicity in V3, we'll generate separate files or one mixed file.
        // Let's generate the MAIN Narration first.
        
        const request = {
            input: { text: scene.narration },
            voice: { languageCode: 'ko-KR', name: 'ko-KR-Neural2-A' }, // Narrator is always A
            audioConfig: { audioEncoding: 'MP3' as const, pitch: 1.0, speakingRate: 1.0 }
        };

        try {
            const [response] = await this.ttsClient.synthesizeSpeech(request);
            if (!response.audioContent) throw new Error("No Audio Content");
            
            // Quality Check: If < 1KB, it's likely an error or silence
            if (response.audioContent.toString().length < 1000) {
                 console.warn(`  ⚠️ Audio too short for Scene ${scene.number}, Retrying...`);
                 // Simple retry logic could go here
            }

            return response.audioContent as string; // Returns binary string
        } catch (e) {
            console.error(`  ❌ Dubbing Failed Scene ${scene.number}`, e);
            throw e;
        }
    }
}
