/**
 * Agents Registry - 8팀 25개 Agent
 */

// Base
export { BaseAgent, AgentContext, AgentResult } from './BaseAgent';

// Team 1: Story Squad
export { StoryWriterAgent, StoryInput, StoryOutput, Scene } from './StoryWriterAgent';
export { StoryReviewerAgent, ReviewInput, ReviewOutput, ReviewIssue } from './StoryReviewerAgent';

// Team 2: Character Squad
export { CharacterDesignerAgent, CharacterDesignInput, CharacterDesignOutput } from './CharacterDesignerAgent';

// Team 3: Background Squad
export { BackgroundArtistAgent, BackgroundInput, BackgroundOutput } from './BackgroundArtistAgent';
export { SceneCompositorAgent, CompositeInput, CompositeOutput } from './SceneCompositorAgent';

// Team 4: Animation Squad
export { AnimatorAgent, AnimationInput, AnimationOutput } from './AnimatorAgent';
export { LipSyncAgent, LipSyncInput, LipSyncOutput } from './LipSyncAgent';

// Team 5: Audio Squad
export { VoiceActorAgent, TTSInput, TTSOutput } from './VoiceActorAgent';

// Team 6: Edit Squad
export { VideoEditorAgent, ComposeInput, ComposeOutput } from './VideoEditorAgent';

// Team 7: QA Squad
export { QualityCheckerAgent, QAInput, QAOutput, QAIssue } from './QualityCheckerAgent';

// Team 8: Anime Squad
export { ImageGeneratorAgent, ImageGenInput, ImageGenOutput } from './ImageGeneratorAgent';

// ============ Agent Factory ============

import { BaseAgent } from './BaseAgent';
import { StoryWriterAgent } from './StoryWriterAgent';
import { StoryReviewerAgent } from './StoryReviewerAgent';
import { CharacterDesignerAgent } from './CharacterDesignerAgent';
import { BackgroundArtistAgent } from './BackgroundArtistAgent';
import { SceneCompositorAgent } from './SceneCompositorAgent';
import { AnimatorAgent } from './AnimatorAgent';
import { LipSyncAgent } from './LipSyncAgent';
import { VoiceActorAgent } from './VoiceActorAgent';
import { VideoEditorAgent } from './VideoEditorAgent';
import { QualityCheckerAgent } from './QualityCheckerAgent';
import { ImageGeneratorAgent } from './ImageGeneratorAgent';
import { AgentRole } from '../conductor/types';

// Agent ID별 생성자 매핑
const AGENT_CONSTRUCTORS: Record<string, () => BaseAgent> = {
  // Story Squad
  'story-planner': () => new StoryWriterAgent(),
  'story-writer': () => new StoryWriterAgent(),
  'story-reviewer': () => new StoryReviewerAgent(),

  // Character Squad
  'character-designer': () => new CharacterDesignerAgent(),
  'character-artist': () => new ImageGeneratorAgent(),
  'expression-artist': () => new ImageGeneratorAgent(),

  // Background Squad
  'bg-designer': () => new CharacterDesignerAgent(), // Claude 기반
  'bg-artist': () => new BackgroundArtistAgent(),
  'scene-compositor': () => new SceneCompositorAgent(),

  // Animation Squad
  'motion-designer': () => new StoryReviewerAgent(), // Claude 기반 기획
  'animator': () => new AnimatorAgent(),
  'lipsync-artist': () => new LipSyncAgent(),

  // Audio Squad
  'voice-director': () => new StoryReviewerAgent(), // Claude 기반
  'voice-actor': () => new VoiceActorAgent(),
  'sound-designer': () => new VoiceActorAgent(),

  // Edit Squad
  'video-editor': () => new VideoEditorAgent(),
  'effects-artist': () => new VideoEditorAgent(),
  'render-engineer': () => new VideoEditorAgent(),

  // QA Squad
  'quality-checker': () => new QualityCheckerAgent(),
  'continuity-checker': () => new QualityCheckerAgent(),
  'final-approver': () => new QualityCheckerAgent(),

  // Anime Squad
  'image-generator': () => new ImageGeneratorAgent(),
  'style-transfer': () => new ImageGeneratorAgent(),
  'prompt-engineer': () => new CharacterDesignerAgent(),
};

/**
 * Agent ID로 인스턴스 생성
 */
export function createAgentById(agentId: string): BaseAgent {
  const constructor = AGENT_CONSTRUCTORS[agentId];
  if (!constructor) {
    throw new Error(`Unknown agent ID: ${agentId}`);
  }
  return constructor();
}

/**
 * Role로 Agent 생성
 */
export function createAgent(role: AgentRole): BaseAgent {
  switch (role) {
    case 'story_writer':
      return new StoryWriterAgent();
    case 'story_reviewer':
      return new StoryReviewerAgent();
    case 'character_designer':
      return new CharacterDesignerAgent();
    case 'animator':
      return new AnimatorAgent();
    case 'voice_actor':
      return new VoiceActorAgent();
    case 'editor':
      return new VideoEditorAgent();
    case 'coordinator':
      return new QualityCheckerAgent();
    default:
      throw new Error(`Agent role not implemented: ${role}`);
  }
}

/**
 * 전체 팀 Agent 인스턴스 생성
 */
export function createAllAgents(): Map<string, BaseAgent> {
  const agents = new Map<string, BaseAgent>();

  for (const [id, constructor] of Object.entries(AGENT_CONSTRUCTORS)) {
    agents.set(id, constructor());
  }

  return agents;
}

/**
 * 스토리 제작 팀 (Story Squad + QA)
 */
export function createStoryTeam(): {
  writer: StoryWriterAgent;
  reviewer: StoryReviewerAgent;
  qa: QualityCheckerAgent;
} {
  return {
    writer: new StoryWriterAgent(),
    reviewer: new StoryReviewerAgent(),
    qa: new QualityCheckerAgent(),
  };
}

/**
 * 영상 제작 팀 (Animation + Audio + Edit)
 */
export function createProductionTeam(): {
  animator: AnimatorAgent;
  lipsync: LipSyncAgent;
  voice: VoiceActorAgent;
  editor: VideoEditorAgent;
} {
  return {
    animator: new AnimatorAgent(),
    lipsync: new LipSyncAgent(),
    voice: new VoiceActorAgent(),
    editor: new VideoEditorAgent(),
  };
}

/**
 * 이미지 제작 팀 (Character + Background + Anime)
 */
export function createArtTeam(): {
  characterDesigner: CharacterDesignerAgent;
  imageGenerator: ImageGeneratorAgent;
  backgroundArtist: BackgroundArtistAgent;
  compositor: SceneCompositorAgent;
} {
  return {
    characterDesigner: new CharacterDesignerAgent(),
    imageGenerator: new ImageGeneratorAgent(),
    backgroundArtist: new BackgroundArtistAgent(),
    compositor: new SceneCompositorAgent(),
  };
}
