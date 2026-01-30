/**
 * VoiceActorAgent - TTS 음성 생성 담당
 */

import { BaseAgent, AgentContext, AgentResult } from './BaseAgent';
import * as fs from 'fs';
import * as path from 'path';

export interface TTSInput {
  text: string;
  language: 'ko' | 'ja' | 'en' | 'zh';
  voice?: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised';
  speed?: number;
  pitch?: number;
}

export interface TTSOutput {
  audioPath: string;
  duration: number;
  sampleRate: number;
}

export class VoiceActorAgent extends BaseAgent {
  private outputDir: string;
  private ttsProvider: 'google' | 'vits' | 'coqui';

  constructor(provider: 'google' | 'vits' | 'coqui' = 'google') {
    super({
      name: 'VoiceActor',
      role: 'voice_actor',
      capabilities: {
        taskTypes: ['audio:tts'],
        provider: 'local',
        skills: ['generate_speech', 'apply_emotion', 'multilingual'],
        maxConcurrent: 2,
      },
      systemPrompt: '',
    });

    this.ttsProvider = provider;
    this.outputDir = path.join(process.cwd(), 'output', 'audio');

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    this.assignTask(context.taskId);

    try {
      const input = context.input as TTSInput;
      const output = await this.generateSpeech(input);

      this.releaseTask();
      return { success: true, output };
    } catch (error) {
      this.releaseTask();
      return { success: false, error: String(error) };
    }
  }

  private async generateSpeech(input: TTSInput): Promise<TTSOutput> {
    switch (this.ttsProvider) {
      case 'google':
        return this.generateWithGoogle(input);
      case 'vits':
        return this.generateWithVITS(input);
      case 'coqui':
        return this.generateWithCoqui(input);
      default:
        throw new Error(`Unknown TTS provider: ${this.ttsProvider}`);
    }
  }

  private async generateWithGoogle(input: TTSInput): Promise<TTSOutput> {
    const textToSpeech = await import('@google-cloud/text-to-speech');
    const client = new textToSpeech.TextToSpeechClient();

    const languageCode = {
      ko: 'ko-KR',
      ja: 'ja-JP',
      en: 'en-US',
      zh: 'zh-CN',
    }[input.language];

    const [response] = await client.synthesizeSpeech({
      input: { text: input.text },
      voice: {
        languageCode,
        name: input.voice || `${languageCode}-Neural2-A`,
        ssmlGender: 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: input.speed || 1.0,
        pitch: input.pitch || 0,
      },
    });

    const filename = `tts_${Date.now()}.mp3`;
    const outputPath = path.join(this.outputDir, filename);

    fs.writeFileSync(outputPath, response.audioContent as Buffer);

    return {
      audioPath: outputPath,
      duration: 0, // TODO: 실제 길이 계산
      sampleRate: 24000,
    };
  }

  private async generateWithVITS(input: TTSInput): Promise<TTSOutput> {
    // VITS API 호출 (로컬 서버 필요)
    const vitsUrl = process.env.VITS_URL || 'http://127.0.0.1:5000';

    const response = await fetch(`${vitsUrl}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: input.text,
        language: input.language,
        speaker_id: input.voice || 0,
        speed: input.speed || 1.0,
      }),
    });

    if (!response.ok) {
      throw new Error(`VITS error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const filename = `tts_vits_${Date.now()}.wav`;
    const outputPath = path.join(this.outputDir, filename);

    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));

    return {
      audioPath: outputPath,
      duration: 0,
      sampleRate: 22050,
    };
  }

  private async generateWithCoqui(input: TTSInput): Promise<TTSOutput> {
    // Coqui TTS API
    const coquiUrl = process.env.COQUI_URL || 'http://127.0.0.1:5002';

    const response = await fetch(`${coquiUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: input.text,
        speaker_id: input.voice || 'default',
        language_id: input.language,
      }),
    });

    if (!response.ok) {
      throw new Error(`Coqui error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const filename = `tts_coqui_${Date.now()}.wav`;
    const outputPath = path.join(this.outputDir, filename);

    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));

    return {
      audioPath: outputPath,
      duration: 0,
      sampleRate: 22050,
    };
  }
}
