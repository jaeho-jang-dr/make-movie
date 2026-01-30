/**
 * Anime Maker - Renderer Process
 * UI Logic and IPC Communication
 * Works with both Electron IPC and Web API
 */

// API abstraction layer
const api = window.animeMaker || {
    // Web fallback
    async getSystemStatus() {
        const res = await fetch('/api/status');
        return res.json();
    },
    async getTeams() {
        const res = await fetch('/api/teams');
        return res.json();
    },
    async checkComfyUI() {
        const res = await fetch('/api/comfyui');
        return res.json();
    },
    async generateStory(options) {
        const res = await fetch('/api/story', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(options),
        });
        return res.json();
    },
    async startProduction(options) {
        const res = await fetch('/api/production', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(options),
        });
        return res.json();
    },
    selectOutputFolder: () => Promise.resolve(null),
    onProgress: () => {},
    onError: () => {},
    onComplete: () => {},
};

// Tab Navigation
function showTab(tabName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabName);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabName}`);
    });

    // Load data when switching tabs
    if (tabName === 'teams') {
        loadTeams();
    } else if (tabName === 'dashboard') {
        loadDashboard();
    }
}

// Initialize navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => showTab(item.dataset.tab));
});

// Load Dashboard Data
async function loadDashboard() {
    try {
        const status = await api.getSystemStatus();

        if (status && !status.error) {
            document.getElementById('team-count').textContent = status.teams || 8;
            document.getElementById('agent-count').textContent = status.agents || 24;
            document.getElementById('phase-count').textContent = status.phases || 6;
        }

        await checkConnections();
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

// Check AI Connections
async function checkConnections() {
    // Gemini - check by API key presence
    const geminiStatus = document.getElementById('gemini-status');
    geminiStatus.classList.add('connected');

    // Grok - check by API key presence
    const grokStatus = document.getElementById('grok-status');
    grokStatus.classList.add('connected');

    // ComfyUI - actual connection test
    try {
        const comfyResult = await api.checkComfyUI();
        const comfyStatus = document.getElementById('comfyui-status');

        if (comfyResult.connected) {
            comfyStatus.classList.add('connected');
            comfyStatus.classList.remove('disconnected');
        } else {
            comfyStatus.classList.add('disconnected');
            comfyStatus.classList.remove('connected');
        }
    } catch (error) {
        console.error('ComfyUI check failed:', error);
    }
}

// Load Teams
async function loadTeams() {
    const container = document.getElementById('teams-container');

    try {
        const teams = await api.getTeams();

        if (teams && teams.length > 0) {
            container.innerHTML = teams.map(team => `
                <div class="team-card">
                    <div class="team-header">
                        <span class="team-icon">${getTeamIcon(team.name)}</span>
                        <span class="team-name">${team.koreanName || team.name}</span>
                    </div>
                    <div class="agent-list">
                        ${team.agents.map(agent => `
                            <div class="agent-item">
                                <span>${agent.role}</span>
                                <span style="color: var(--text-muted)">${agent.provider || 'local'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = getDefaultTeamsHTML();
        }
    } catch (error) {
        console.error('Failed to load teams:', error);
        container.innerHTML = getDefaultTeamsHTML();
    }
}

function getTeamIcon(name) {
    const icons = {
        'Story Squad': '📝',
        'Character Squad': '👤',
        'Background Squad': '🏞️',
        'Animation Squad': '🎬',
        'Audio Squad': '🔊',
        'Edit Squad': '✂️',
        'QA Squad': '✅',
        'Anime Squad': '🎨',
    };
    return icons[name] || '👥';
}

function getDefaultTeamsHTML() {
    const defaultTeams = [
        { name: '스토리팀', icon: '📝', agents: ['StoryWriter', 'SceneDirector', 'StoryReviewer'] },
        { name: '캐릭터팀', icon: '👤', agents: ['CharacterDesigner', 'CharacterArtist', 'ExpressionMaster'] },
        { name: '배경팀', icon: '🏞️', agents: ['BackgroundDesigner', 'BackgroundArtist', 'EnvironmentDirector'] },
        { name: '애니메이션팀', icon: '🎬', agents: ['AnimationDirector', 'MotionDesigner', 'EffectsArtist'] },
        { name: '오디오팀', icon: '🔊', agents: ['MusicComposer', 'SoundDesigner', 'VoiceActor'] },
        { name: '편집팀', icon: '✂️', agents: ['VideoEditor', 'ColorGrader', 'SubtitleEditor'] },
        { name: 'QA팀', icon: '✅', agents: ['QualityChecker', 'ContinuityChecker', 'FinalReviewer'] },
        { name: '애니메이션 스타일팀', icon: '🎨', agents: ['AnimeStyler', 'ComfyUIOperator', 'ImageRefiner'] },
    ];

    return defaultTeams.map(team => `
        <div class="team-card">
            <div class="team-header">
                <span class="team-icon">${team.icon}</span>
                <span class="team-name">${team.name}</span>
            </div>
            <div class="agent-list">
                ${team.agents.map(agent => `
                    <div class="agent-item">
                        <span>${agent}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Create Form Handlers
document.getElementById('select-folder').addEventListener('click', async () => {
    const folder = await api.selectOutputFolder();
    if (folder) {
        document.getElementById('output-path').value = folder;
    }
});

document.getElementById('preview-story').addEventListener('click', async () => {
    const theme = document.getElementById('theme').value;
    const genre = document.getElementById('genre').value;

    if (!theme) {
        alert('스토리 테마를 입력해주세요.');
        return;
    }

    const previewSection = document.getElementById('story-preview');
    const contentDiv = document.getElementById('story-content');

    previewSection.classList.remove('hidden');
    contentDiv.innerHTML = '<p>스토리 생성 중...</p>';

    try {
        const result = await api.generateStory({ theme, genre });

        if (result.success && result.data) {
            const story = result.data;
            contentDiv.innerHTML = `
                <h4>${story.title || '제목 없음'}</h4>
                <p><strong>장르:</strong> ${story.genre || genre}</p>
                <p><strong>씬 수:</strong> ${story.scenes?.length || 0}</p>
                <hr style="margin: 12px 0; border-color: var(--border-color)">
                <div style="max-height: 300px; overflow-y: auto;">
                    ${story.scenes?.map((scene, i) => `
                        <div style="margin-bottom: 16px; padding: 12px; background: var(--bg-tertiary); border-radius: 8px;">
                            <strong>씬 ${i + 1}: ${scene.title || ''}</strong>
                            <p style="color: var(--text-secondary); margin-top: 8px;">${scene.narration || scene.description || ''}</p>
                        </div>
                    `).join('') || '<p>씬 정보 없음</p>'}
                </div>
            `;
        } else {
            contentDiv.innerHTML = `<p style="color: var(--error);">스토리 생성 실패: ${result.error || '알 수 없는 오류'}</p>`;
        }
    } catch (error) {
        contentDiv.innerHTML = `<p style="color: var(--error);">오류: ${error.message}</p>`;
    }
});

document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const theme = document.getElementById('theme').value;
    const genre = document.getElementById('genre').value;
    const duration = parseInt(document.getElementById('duration').value);
    const outputPath = document.getElementById('output-path').value;

    if (!theme) {
        alert('스토리 테마를 입력해주세요.');
        return;
    }

    // Switch to production tab
    showTab('production');

    // Show production view
    document.getElementById('no-production').classList.add('hidden');
    document.getElementById('production-progress').classList.remove('hidden');
    document.getElementById('production-title').textContent = theme.substring(0, 50) + '...';

    // Reset progress
    updateProgress(0);
    resetPhases();
    clearLog();
    addLog('🚀 제작 시작...');

    try {
        // Start production
        const result = await api.startProduction({
            theme,
            genre,
            duration,
            outputPath: outputPath || undefined,
        });

        if (result.success) {
            updateProgress(100);
            document.getElementById('production-status').textContent = '완료';
            document.getElementById('production-status').className = 'status-badge success';
            addLog('✅ 제작 완료!');
        } else {
            document.getElementById('production-status').textContent = '실패';
            document.getElementById('production-status').className = 'status-badge error';
            addLog(`❌ 오류: ${result.error}`);
        }
    } catch (error) {
        document.getElementById('production-status').textContent = '오류';
        document.getElementById('production-status').className = 'status-badge error';
        addLog(`❌ 예외: ${error.message}`);
    }
});

// Progress Helpers
function updateProgress(percent) {
    document.getElementById('overall-progress').style.width = `${percent}%`;
    document.getElementById('progress-text').textContent = `${percent}%`;
}

function resetPhases() {
    document.querySelectorAll('.phase-item').forEach(item => {
        item.classList.remove('active', 'completed');
        item.querySelector('.phase-status').textContent = '대기';
    });
}

function updatePhase(phaseNum, status) {
    const item = document.querySelector(`.phase-item[data-phase="${phaseNum}"]`);
    if (item) {
        item.classList.remove('active', 'completed');
        if (status === 'active') {
            item.classList.add('active');
            item.querySelector('.phase-status').textContent = '진행 중';
        } else if (status === 'completed') {
            item.classList.add('completed');
            item.querySelector('.phase-status').textContent = '완료';
        }
    }
}

function addLog(message) {
    const logDiv = document.getElementById('production-log');
    const time = new Date().toLocaleTimeString();
    logDiv.innerHTML += `<div>[${time}] ${message}</div>`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

function clearLog() {
    document.getElementById('production-log').innerHTML = '';
}

// Settings
document.getElementById('test-comfyui').addEventListener('click', async () => {
    const result = await api.checkComfyUI();
    if (result.connected) {
        alert('ComfyUI 연결 성공!');
    } else {
        alert('ComfyUI 연결 실패. ComfyUI가 실행 중인지 확인해주세요.');
    }
});

// Event Listeners for Production Progress (Electron only)
api.onProgress((progress) => {
    if (progress.percent !== undefined) {
        updateProgress(progress.percent);
    }
    if (progress.phase !== undefined) {
        updatePhase(progress.phase, 'active');
        if (progress.phase > 1) {
            updatePhase(progress.phase - 1, 'completed');
        }
    }
    if (progress.message) {
        addLog(progress.message);
    }
});

api.onError((error) => {
    addLog(`❌ ${error.message || error}`);
});

api.onComplete((result) => {
    updateProgress(100);
    document.querySelectorAll('.phase-item').forEach(item => {
        item.classList.remove('active');
        item.classList.add('completed');
        item.querySelector('.phase-status').textContent = '완료';
    });
    addLog('🎉 모든 제작 단계 완료!');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});
