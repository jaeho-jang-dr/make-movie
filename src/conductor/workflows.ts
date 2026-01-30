/**
 * 사전 정의된 Workflow 템플릿
 */

import { Workflow, WorkflowStep } from './types';

/**
 * 스토리 생성 + 검증 워크플로우
 * Gemini로 생성 → Claude로 검증 → 필요시 수정
 */
export const STORY_CREATION_WORKFLOW: Omit<Workflow, 'id'> = {
  name: 'story_creation',
  description: '스토리 생성, 검증, 수정 전체 파이프라인',
  variables: {
    maxRevisions: 3,
    approvalThreshold: 75,
  },
  steps: [
    {
      id: 'generate',
      taskType: 'story:generate',
      agent: 'story_writer',
      input: {
        prompt: '$prompt',
        genre: '$genre',
        duration: '$duration',
        characters: '$characters',
      },
    },
    {
      id: 'review',
      taskType: 'story:review',
      agent: 'story_reviewer',
      input: {
        story: '$results.generate',
        strictness: 'normal',
      },
      dependsOn: ['generate'],
    },
    {
      id: 'revise',
      taskType: 'story:revise',
      agent: 'story_writer',
      input: {
        story: '$results.generate',
        feedback: '$results.review',
      },
      dependsOn: ['review'],
      condition: '$results.review.approved === false',
    },
  ],
};

/**
 * 캐릭터 디자인 워크플로우
 */
export const CHARACTER_DESIGN_WORKFLOW: Omit<Workflow, 'id'> = {
  name: 'character_design',
  description: '캐릭터 설정 기반 이미지 생성',
  steps: [
    {
      id: 'design_prompt',
      taskType: 'character:design',
      input: {
        name: '$name',
        personality: '$personality',
        appearance: '$appearance',
        style: '$style',
      },
    },
    {
      id: 'generate_base',
      taskType: 'character:generate',
      input: {
        prompt: '$results.design_prompt.visualPrompt',
        style: '$style',
      },
      dependsOn: ['design_prompt'],
    },
    {
      id: 'generate_expressions',
      taskType: 'character:expression',
      input: {
        baseImage: '$results.generate_base',
        expressions: ['neutral', 'happy', 'sad', 'angry', 'surprised'],
      },
      dependsOn: ['generate_base'],
    },
  ],
};

/**
 * 씬 애니메이션 워크플로우
 */
export const SCENE_ANIMATION_WORKFLOW: Omit<Workflow, 'id'> = {
  name: 'scene_animation',
  description: '씬 이미지 생성 및 애니메이션화',
  steps: [
    {
      id: 'generate_background',
      taskType: 'character:generate', // 배경도 같은 생성기 사용
      input: {
        prompt: '$scene.visualPrompt',
        type: 'background',
      },
    },
    {
      id: 'generate_character_pose',
      taskType: 'character:generate',
      input: {
        characterId: '$characterId',
        expression: '$scene.emotion',
        pose: '$scene.pose',
      },
    },
    {
      id: 'animate',
      taskType: 'video:animate',
      input: {
        background: '$results.generate_background',
        character: '$results.generate_character_pose',
        duration: '$scene.duration',
        motion: '$motionType',
      },
      dependsOn: ['generate_background', 'generate_character_pose'],
    },
    {
      id: 'lipsync',
      taskType: 'video:lipsync',
      input: {
        video: '$results.animate',
        audio: '$audioPath',
      },
      dependsOn: ['animate'],
      condition: '$audioPath !== undefined',
    },
  ],
};

/**
 * 전체 애니메이션 제작 워크플로우
 */
export const FULL_PRODUCTION_WORKFLOW: Omit<Workflow, 'id'> = {
  name: 'full_production',
  description: '스토리부터 최종 영상까지 전체 파이프라인',
  steps: [
    // Phase 1: 스토리
    {
      id: 'story',
      taskType: 'story:generate',
      input: {
        prompt: '$prompt',
        genre: '$genre',
        duration: '$duration',
      },
    },
    {
      id: 'story_review',
      taskType: 'story:review',
      input: { story: '$results.story' },
      dependsOn: ['story'],
    },

    // Phase 2: 캐릭터 (스토리 완료 후)
    {
      id: 'characters',
      taskType: 'character:design',
      input: {
        characters: '$results.story.characters',
        style: '$style',
      },
      dependsOn: ['story_review'],
    },

    // Phase 3: TTS (스토리 완료 후)
    {
      id: 'audio',
      taskType: 'audio:tts',
      input: {
        scenes: '$results.story.scenes',
        voice: '$voice',
      },
      dependsOn: ['story_review'],
    },

    // Phase 4: 씬별 애니메이션
    {
      id: 'animations',
      taskType: 'video:animate',
      input: {
        scenes: '$results.story.scenes',
        characters: '$results.characters',
      },
      dependsOn: ['characters'],
    },

    // Phase 5: 립싱크
    {
      id: 'lipsync',
      taskType: 'video:lipsync',
      input: {
        videos: '$results.animations',
        audios: '$results.audio',
      },
      dependsOn: ['animations', 'audio'],
    },

    // Phase 6: 최종 합성
    {
      id: 'compose',
      taskType: 'video:compose',
      input: {
        clips: '$results.lipsync',
        transitions: '$transitions',
        bgm: '$bgmPath',
      },
      dependsOn: ['lipsync'],
    },

    // Phase 7: 렌더링
    {
      id: 'render',
      taskType: 'export:render',
      input: {
        composition: '$results.compose',
        format: '$format',
        quality: '$quality',
      },
      dependsOn: ['compose'],
    },
  ],
};

// 워크플로우 레지스트리
export const WORKFLOW_TEMPLATES: Record<string, Omit<Workflow, 'id'>> = {
  story_creation: STORY_CREATION_WORKFLOW,
  character_design: CHARACTER_DESIGN_WORKFLOW,
  scene_animation: SCENE_ANIMATION_WORKFLOW,
  full_production: FULL_PRODUCTION_WORKFLOW,
};

export function getWorkflowTemplate(name: string): Omit<Workflow, 'id'> | undefined {
  return WORKFLOW_TEMPLATES[name];
}
