// src/automation/types.ts

export interface StoryConfig {
  title: string;
  duration: number; // 분 단위
  targetAge: string;
  theme: string;
}

export interface Scene {
  sceneNumber: number;
  duration: number; // 초 단위
  narration: string;
  backgroundDescription: string;
  characters: string[];
  actions: string[];
}

export interface GenerationOptions {
  generateMusic?: boolean;
  imageQuality?: 'standard' | 'hd';
  voiceGender?: 'male' | 'female';
  speakingRate?: number;
  pitch?: number;
}

export interface BatchStoryConfig extends StoryConfig {
  outputName?: string;
}
