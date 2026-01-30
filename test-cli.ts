import { TEAMS, TOTAL_AGENTS, PRODUCTION_PHASES } from './src/config/teams';

console.log('=== Anime Maker System Status ===');
console.log(`Teams: ${TEAMS.length}`);
console.log(`Total Agents: ${TOTAL_AGENTS}`);
console.log(`Production Phases: ${PRODUCTION_PHASES.length}`);

console.log('\n[Teams]');
TEAMS.forEach((team, i) => {
    console.log(`  ${i + 1}. ${team.nameKr} (${team.name}): ${team.agents.length} agents`);
});
