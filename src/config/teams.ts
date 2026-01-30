/**
 * 7팀 22개 Skill Agents 구성
 * Claude가 Conductor로서 전체 조율
 */

import { AIProviderType } from '../providers/types';
import { AgentRole, TaskType } from '../conductor/types';

// ============ 팀 구성 ============

export interface TeamConfig {
  id: string;
  name: string;
  nameKr: string;
  description: string;
  agents: AgentConfig[];
  primaryAI: AIProviderType;
}

export interface AgentConfig {
  id: string;
  name: string;
  role: AgentRole;
  skills: string[];
  taskTypes: TaskType[];
  ai: AIProviderType;
  description: string;
}

// ============ 7개 팀 정의 ============

export const TEAMS: TeamConfig[] = [
  // ===== TEAM 1: Story Squad =====
  {
    id: 'story',
    name: 'Story Squad',
    nameKr: '스토리팀',
    description: '스토리 기획, 작성, 검증 담당',
    primaryAI: 'gemini',
    agents: [
      {
        id: 'story-planner',
        name: 'StoryPlanner',
        role: 'story_writer',
        skills: ['plan_story_arc', 'create_synopsis', 'define_themes'],
        taskTypes: ['story:generate'],
        ai: 'gemini',
        description: '스토리 구조 및 아크 기획',
      },
      {
        id: 'story-writer',
        name: 'StoryWriter',
        role: 'story_writer',
        skills: ['write_scenes', 'create_dialogue', 'build_tension'],
        taskTypes: ['story:generate', 'story:revise'],
        ai: 'gemini',
        description: '씬별 상세 스토리 작성',
      },
      {
        id: 'story-reviewer',
        name: 'StoryReviewer',
        role: 'story_reviewer',
        skills: ['review_plot', 'check_consistency', 'suggest_improvements'],
        taskTypes: ['story:review'],
        ai: 'claude',
        description: '스토리 검증 및 피드백',
      },
    ],
  },

  // ===== TEAM 2: Character Squad =====
  {
    id: 'character',
    name: 'Character Squad',
    nameKr: '캐릭터팀',
    description: '캐릭터 설계, 생성, 표정 담당',
    primaryAI: 'claude',
    agents: [
      {
        id: 'character-designer',
        name: 'CharacterDesigner',
        role: 'character_designer',
        skills: ['design_appearance', 'create_personality', 'write_backstory'],
        taskTypes: ['character:design'],
        ai: 'claude',
        description: '캐릭터 설정 및 외형 디자인',
      },
      {
        id: 'character-artist',
        name: 'CharacterArtist',
        role: 'character_designer',
        skills: ['generate_base_image', 'create_turnaround', 'refine_design'],
        taskTypes: ['character:generate'],
        ai: 'local', // ComfyUI
        description: '캐릭터 이미지 생성 (ComfyUI)',
      },
      {
        id: 'expression-artist',
        name: 'ExpressionArtist',
        role: 'character_designer',
        skills: ['generate_expressions', 'create_poses', 'emotion_variants'],
        taskTypes: ['character:expression'],
        ai: 'local',
        description: '표정 및 포즈 변형 생성',
      },
    ],
  },

  // ===== TEAM 3: Background Squad =====
  {
    id: 'background',
    name: 'Background Squad',
    nameKr: '배경팀',
    description: '배경 디자인 및 생성 담당',
    primaryAI: 'local',
    agents: [
      {
        id: 'bg-designer',
        name: 'BackgroundDesigner',
        role: 'character_designer',
        skills: ['design_locations', 'create_mood_boards', 'plan_lighting'],
        taskTypes: ['character:design'],
        ai: 'claude',
        description: '배경 컨셉 및 분위기 설계',
      },
      {
        id: 'bg-artist',
        name: 'BackgroundArtist',
        role: 'character_designer',
        skills: ['generate_backgrounds', 'create_variations', 'time_of_day'],
        taskTypes: ['character:generate'],
        ai: 'local',
        description: '배경 이미지 생성 (ComfyUI)',
      },
      {
        id: 'scene-compositor',
        name: 'SceneCompositor',
        role: 'editor',
        skills: ['composite_layers', 'adjust_lighting', 'add_effects'],
        taskTypes: ['video:compose'],
        ai: 'local',
        description: '캐릭터+배경 합성',
      },
    ],
  },

  // ===== TEAM 4: Animation Squad =====
  {
    id: 'animation',
    name: 'Animation Squad',
    nameKr: '애니메이션팀',
    description: '모션 및 애니메이션 생성 담당',
    primaryAI: 'local',
    agents: [
      {
        id: 'motion-designer',
        name: 'MotionDesigner',
        role: 'animator',
        skills: ['plan_motion', 'create_keyframes', 'design_transitions'],
        taskTypes: ['video:animate'],
        ai: 'claude',
        description: '모션 기획 및 키프레임 설계',
      },
      {
        id: 'animator',
        name: 'Animator',
        role: 'animator',
        skills: ['generate_animation', 'interpolate_frames', 'smooth_motion'],
        taskTypes: ['video:animate'],
        ai: 'local', // AnimateDiff
        description: '애니메이션 생성 (AnimateDiff)',
      },
      {
        id: 'lipsync-artist',
        name: 'LipSyncArtist',
        role: 'animator',
        skills: ['sync_lips', 'match_phonemes', 'blend_expressions'],
        taskTypes: ['video:lipsync'],
        ai: 'local', // SadTalker
        description: '립싱크 생성 (SadTalker)',
      },
    ],
  },

  // ===== TEAM 5: Audio Squad =====
  {
    id: 'audio',
    name: 'Audio Squad',
    nameKr: '오디오팀',
    description: '음성, 음악, 효과음 담당',
    primaryAI: 'local',
    agents: [
      {
        id: 'voice-director',
        name: 'VoiceDirector',
        role: 'voice_actor',
        skills: ['direct_performance', 'assign_voices', 'adjust_emotion'],
        taskTypes: ['audio:tts'],
        ai: 'claude',
        description: '음성 연출 및 캐스팅',
      },
      {
        id: 'voice-actor',
        name: 'VoiceActor',
        role: 'voice_actor',
        skills: ['generate_speech', 'apply_emotion', 'multilingual'],
        taskTypes: ['audio:tts'],
        ai: 'local', // VITS/Coqui
        description: 'TTS 음성 생성',
      },
      {
        id: 'sound-designer',
        name: 'SoundDesigner',
        role: 'voice_actor',
        skills: ['select_bgm', 'add_sfx', 'mix_audio'],
        taskTypes: ['audio:bgm', 'audio:sfx'],
        ai: 'local',
        description: 'BGM 및 효과음 설계',
      },
    ],
  },

  // ===== TEAM 6: Edit Squad =====
  {
    id: 'edit',
    name: 'Edit Squad',
    nameKr: '편집팀',
    description: '영상 편집 및 합성 담당',
    primaryAI: 'local',
    agents: [
      {
        id: 'video-editor',
        name: 'VideoEditor',
        role: 'editor',
        skills: ['cut_clips', 'arrange_timeline', 'add_transitions'],
        taskTypes: ['video:compose'],
        ai: 'local',
        description: '영상 컷 편집',
      },
      {
        id: 'effects-artist',
        name: 'EffectsArtist',
        role: 'editor',
        skills: ['add_vfx', 'color_grade', 'add_subtitles'],
        taskTypes: ['video:compose'],
        ai: 'local',
        description: '시각 효과 및 자막',
      },
      {
        id: 'render-engineer',
        name: 'RenderEngineer',
        role: 'editor',
        skills: ['encode_video', 'optimize_quality', 'export_formats'],
        taskTypes: ['export:render'],
        ai: 'local',
        description: '최종 렌더링 및 인코딩',
      },
    ],
  },

  // ===== TEAM 7: QA Squad =====
  {
    id: 'qa',
    name: 'QA Squad',
    nameKr: 'QA팀',
    description: '품질 검증 및 최종 승인 담당',
    primaryAI: 'claude',
    agents: [
      {
        id: 'quality-checker',
        name: 'QualityChecker',
        role: 'story_reviewer',
        skills: ['check_quality', 'detect_issues', 'verify_sync'],
        taskTypes: ['story:review'],
        ai: 'claude',
        description: '품질 검사 및 이슈 탐지',
      },
      {
        id: 'continuity-checker',
        name: 'ContinuityChecker',
        role: 'story_reviewer',
        skills: ['check_continuity', 'verify_consistency', 'spot_errors'],
        taskTypes: ['story:review'],
        ai: 'claude',
        description: '연속성 및 일관성 검증',
      },
      {
        id: 'final-approver',
        name: 'FinalApprover',
        role: 'coordinator',
        skills: ['final_review', 'approve_release', 'generate_report'],
        taskTypes: ['export:preview'],
        ai: 'claude',
        description: '최종 승인 및 리포트',
      },
    ],
  },

  // ===== TEAM 8: Anime Squad =====
  {
    id: 'anime',
    name: 'Anime Squad',
    nameKr: '애니메이션 스타일팀',
    description: '애니메이션 특화 이미지 생성 및 스타일 적용',
    primaryAI: 'local',
    agents: [
      {
        id: 'image-generator',
        name: 'ImageGenerator',
        role: 'character_designer',
        skills: ['generate_image', 'upscale', 'inpaint', 'img2img'],
        taskTypes: ['character:generate'],
        ai: 'local',
        description: 'ComfyUI 기반 이미지 생성',
      },
      {
        id: 'style-transfer',
        name: 'StyleTransfer',
        role: 'character_designer',
        skills: ['apply_style', 'convert_to_anime', 'match_palette'],
        taskTypes: ['character:generate'],
        ai: 'local',
        description: '스타일 변환 및 적용',
      },
      {
        id: 'prompt-engineer',
        name: 'PromptEngineer',
        role: 'character_designer',
        skills: ['optimize_prompt', 'translate_to_tags', 'enhance_description'],
        taskTypes: ['character:design'],
        ai: 'claude',
        description: '프롬프트 최적화 전문가',
      },
    ],
  },
];

// ============ 프로덕션 단계 정의 ============

export interface ProductionPhase {
  id: string;
  name: string;
  nameKr: string;
  order: number;
  teams: string[];
  tasks: TaskType[];
  description: string;
}

export const PRODUCTION_PHASES: ProductionPhase[] = [
  {
    id: 'pre-production',
    name: 'Pre-Production',
    nameKr: '사전 제작',
    order: 1,
    teams: ['story', 'character'],
    tasks: ['story:generate', 'story:review', 'story:revise', 'character:design'],
    description: '스토리 기획, 캐릭터 설계, 전체 구조 확정',
  },
  {
    id: 'asset-creation',
    name: 'Asset Creation',
    nameKr: '에셋 생성',
    order: 2,
    teams: ['character', 'background', 'anime'],
    tasks: ['character:generate', 'character:expression'],
    description: '캐릭터 이미지, 배경, 필요 에셋 생성',
  },
  {
    id: 'animation',
    name: 'Animation',
    nameKr: '애니메이션',
    order: 3,
    teams: ['animation', 'audio'],
    tasks: ['video:animate', 'video:lipsync', 'audio:tts'],
    description: '모션 생성, 립싱크, 음성 합성',
  },
  {
    id: 'post-production',
    name: 'Post-Production',
    nameKr: '후반 작업',
    order: 4,
    teams: ['edit', 'audio'],
    tasks: ['video:compose', 'audio:bgm', 'audio:sfx'],
    description: '편집, 합성, 오디오 믹싱',
  },
  {
    id: 'quality-assurance',
    name: 'Quality Assurance',
    nameKr: '품질 검증',
    order: 5,
    teams: ['qa'],
    tasks: ['story:review', 'export:preview'],
    description: '품질 검사, 수정, 최종 승인',
  },
  {
    id: 'export',
    name: 'Export',
    nameKr: '출력',
    order: 6,
    teams: ['edit'],
    tasks: ['export:render'],
    description: '최종 렌더링 및 내보내기',
  },
];

// ============ AI 매칭 테이블 ============

export const AI_TASK_MAPPING: Record<TaskType, AIProviderType[]> = {
  'story:generate': ['gemini', 'grok'],
  'story:review': ['claude'],
  'story:revise': ['gemini', 'claude'],
  'character:design': ['claude', 'gemini'],
  'character:generate': ['local'],
  'character:expression': ['local'],
  'video:animate': ['local'],
  'video:lipsync': ['local'],
  'video:compose': ['local'],
  'audio:tts': ['local'],
  'audio:bgm': ['local'],
  'audio:sfx': ['local'],
  'export:render': ['local'],
  'export:preview': ['local', 'claude'],
};

// ============ 유틸리티 함수 ============

export function getTeamById(teamId: string): TeamConfig | undefined {
  return TEAMS.find(t => t.id === teamId);
}

export function getAgentById(agentId: string): AgentConfig | undefined {
  for (const team of TEAMS) {
    const agent = team.agents.find(a => a.id === agentId);
    if (agent) return agent;
  }
  return undefined;
}

export function getAgentsForTask(taskType: TaskType): AgentConfig[] {
  const agents: AgentConfig[] = [];
  for (const team of TEAMS) {
    for (const agent of team.agents) {
      if (agent.taskTypes.includes(taskType)) {
        agents.push(agent);
      }
    }
  }
  return agents;
}

export function getPhaseByOrder(order: number): ProductionPhase | undefined {
  return PRODUCTION_PHASES.find(p => p.order === order);
}

export function getTeamsForPhase(phaseId: string): TeamConfig[] {
  const phase = PRODUCTION_PHASES.find(p => p.id === phaseId);
  if (!phase) return [];
  return phase.teams.map(tid => getTeamById(tid)).filter(Boolean) as TeamConfig[];
}

// 전체 Agent 수 계산
export const TOTAL_AGENTS = TEAMS.reduce((sum, team) => sum + team.agents.length, 0);
// 결과: 25개 (8팀)
