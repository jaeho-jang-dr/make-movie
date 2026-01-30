/**
 * Squad System Re-exports
 * 기존 automation/agents의 Squad들을 통합 관리
 */

// Re-export existing squads
export { StorySquad, V3Script, V3Scene, V3Character } from '../automation/agents/StorySquad';
export { ArtSquad, StyleGuide } from '../automation/agents/ArtSquad';
export { SoundSquad } from '../automation/agents/SoundSquad';
export { GrokAgent } from '../automation/agents/GrokAgent';

// Re-export directors
export { DirectorV3 } from '../automation/DirectorV3';
export { MultiAgentDirector } from '../automation/MultiAgentDirector';
