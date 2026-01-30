/**
 * Skills 시스템 진입점
 */

export * from './types';
export * from './SkillRegistry';

// 스킬 등록
import './storySkills';
// TODO: import './characterSkills';
// TODO: import './imageSkills';
// TODO: import './videoSkills';
// TODO: import './audioSkills';

import { skillRegistry } from './SkillRegistry';

// 등록된 스킬 목록 출력
export function listRegisteredSkills(): void {
  console.log('\n=== Registered Skills ===');
  const skills = skillRegistry.listAll();

  const byCategory: Record<string, string[]> = {};
  skills.forEach(skill => {
    if (!byCategory[skill.category]) {
      byCategory[skill.category] = [];
    }
    byCategory[skill.category].push(skill.name);
  });

  Object.entries(byCategory).forEach(([category, names]) => {
    console.log(`\n[${category}]`);
    names.forEach(name => console.log(`  - ${name}`));
  });
  console.log('');
}
