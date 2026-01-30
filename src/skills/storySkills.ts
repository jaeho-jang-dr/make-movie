/**
 * Story 관련 스킬들
 */

import { registerSkill } from './SkillRegistry';
import { SkillResult } from './types';
import { Scene } from '../agents/StoryWriterAgent';

// ============ 스토리 유틸리티 스킬들 ============

/**
 * 씬 병합
 */
registerSkill<{ scenes: Scene[]; indices: number[] }, Scene[]>({
  name: 'story:mergeScenes',
  description: '여러 씬을 하나로 병합',
  category: 'story',
  handler: async (input): Promise<SkillResult<Scene[]>> => {
    const { scenes, indices } = input;

    if (indices.length < 2) {
      return { success: false, error: '병합할 씬이 2개 이상 필요합니다' };
    }

    const toMerge = indices.map(i => scenes[i]).filter(Boolean);
    if (toMerge.length < 2) {
      return { success: false, error: '유효한 씬 인덱스가 아닙니다' };
    }

    const merged: Scene = {
      id: toMerge[0].id,
      title: toMerge.map(s => s.title).join(' + '),
      description: toMerge.map(s => s.description).join('\n\n'),
      dialogue: toMerge.map(s => s.dialogue).filter(Boolean).join('\n'),
      emotion: toMerge[toMerge.length - 1].emotion,
      duration: toMerge.reduce((sum, s) => sum + s.duration, 0),
      visualPrompt: toMerge.map(s => s.visualPrompt).join(', '),
      characters: [...new Set(toMerge.flatMap(s => s.characters || []))],
    };

    // 병합된 씬으로 교체
    const result = scenes.filter((_, i) => !indices.includes(i));
    result.splice(indices[0], 0, merged);

    // ID 재정렬
    result.forEach((s, i) => (s.id = i + 1));

    return { success: true, data: result };
  },
});

/**
 * 씬 분할
 */
registerSkill<{ scene: Scene; splitAt: string }, Scene[]>({
  name: 'story:splitScene',
  description: '하나의 씬을 여러 씬으로 분할',
  category: 'story',
  handler: async (input): Promise<SkillResult<Scene[]>> => {
    const { scene, splitAt } = input;

    const descriptions = scene.description.split(splitAt).filter(Boolean);
    if (descriptions.length < 2) {
      return { success: false, error: '분할 지점을 찾을 수 없습니다' };
    }

    const splitScenes: Scene[] = descriptions.map((desc, i) => ({
      id: scene.id + i,
      title: `${scene.title} (${i + 1}/${descriptions.length})`,
      description: desc.trim(),
      dialogue: i === 0 ? scene.dialogue : undefined,
      emotion: scene.emotion,
      duration: Math.ceil(scene.duration / descriptions.length),
      visualPrompt: scene.visualPrompt,
      characters: scene.characters,
    }));

    return { success: true, data: splitScenes };
  },
});

/**
 * 씬 순서 변경
 */
registerSkill<{ scenes: Scene[]; from: number; to: number }, Scene[]>({
  name: 'story:reorderScene',
  description: '씬 순서 변경',
  category: 'story',
  handler: async (input): Promise<SkillResult<Scene[]>> => {
    const { scenes, from, to } = input;

    if (from < 0 || from >= scenes.length || to < 0 || to >= scenes.length) {
      return { success: false, error: '유효하지 않은 인덱스' };
    }

    const result = [...scenes];
    const [moved] = result.splice(from, 1);
    result.splice(to, 0, moved);

    // ID 재정렬
    result.forEach((s, i) => (s.id = i + 1));

    return { success: true, data: result };
  },
});

/**
 * 씬 시간 조정
 */
registerSkill<{ scenes: Scene[]; targetDuration: number }, Scene[]>({
  name: 'story:adjustTiming',
  description: '전체 시간에 맞게 씬 시간 조정',
  category: 'story',
  handler: async (input): Promise<SkillResult<Scene[]>> => {
    const { scenes, targetDuration } = input;

    const currentTotal = scenes.reduce((sum, s) => sum + s.duration, 0);
    const ratio = targetDuration / currentTotal;

    const adjusted = scenes.map(scene => ({
      ...scene,
      duration: Math.max(1, Math.round(scene.duration * ratio)),
    }));

    return { success: true, data: adjusted };
  },
});

/**
 * 캐릭터 등장 분석
 */
registerSkill<{ scenes: Scene[] }, Record<string, number[]>>({
  name: 'story:analyzeCharacters',
  description: '캐릭터별 등장 씬 분석',
  category: 'story',
  handler: async (input): Promise<SkillResult<Record<string, number[]>>> => {
    const { scenes } = input;

    const characterAppearances: Record<string, number[]> = {};

    scenes.forEach((scene, index) => {
      (scene.characters || []).forEach(char => {
        if (!characterAppearances[char]) {
          characterAppearances[char] = [];
        }
        characterAppearances[char].push(index + 1);
      });
    });

    return { success: true, data: characterAppearances };
  },
});

/**
 * 감정 흐름 분석
 */
registerSkill<{ scenes: Scene[] }, Array<{ sceneId: number; emotion: string }>>({
  name: 'story:analyzeEmotions',
  description: '씬별 감정 흐름 분석',
  category: 'story',
  handler: async (input): Promise<SkillResult<Array<{ sceneId: number; emotion: string }>>> => {
    const { scenes } = input;

    const emotionFlow = scenes.map(scene => ({
      sceneId: scene.id,
      emotion: scene.emotion,
    }));

    return { success: true, data: emotionFlow };
  },
});

/**
 * Visual Prompt 일괄 개선
 */
registerSkill<{ scenes: Scene[]; style: string }, Scene[]>({
  name: 'story:enhanceVisualPrompts',
  description: 'Visual Prompt에 스타일 태그 추가',
  category: 'story',
  handler: async (input): Promise<SkillResult<Scene[]>> => {
    const { scenes, style } = input;

    const styleMap: Record<string, string> = {
      shoujo: 'shoujo manga style, soft colors, sparkles, flowery background',
      shounen: 'shounen anime style, dynamic pose, bold colors, action lines',
      ghibli: 'studio ghibli style, watercolor, soft lighting, detailed background',
      moe: 'moe anime style, cute, big eyes, pastel colors',
      realistic: 'semi-realistic anime style, detailed shading, cinematic lighting',
    };

    const styleTag = styleMap[style] || style;

    const enhanced = scenes.map(scene => ({
      ...scene,
      visualPrompt: `${scene.visualPrompt}, ${styleTag}, masterpiece, best quality`,
    }));

    return { success: true, data: enhanced };
  },
});
