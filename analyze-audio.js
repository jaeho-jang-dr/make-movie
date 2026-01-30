// 오디오 파일 길이 분석
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function analyzeAudio() {
    console.log('🎵 오디오 파일 길이 분석 중...\n');

    const audioLengths = [];

    for (let i = 1; i <= 10; i++) {
        const file = `public/audio/v3/scene${i}.mp3`;

        try {
            const stats = fs.statSync(file);
            // MP3 평균 비트레이트 128kbps 가정
            // 대략적인 길이 계산 (정확하지 않지만 추정)
            const durationSeconds = Math.ceil((stats.size / 16000) + 2); // 여유 2초

            audioLengths.push({
                scene: i,
                size: stats.size,
                estimatedDuration: durationSeconds,
                recommendedFrames: Math.ceil(durationSeconds * 30) + 60 // 2초 여유
            });

            console.log(`Scene ${i}: ${stats.size} bytes → 약 ${durationSeconds}초 추정 → ${Math.ceil(durationSeconds * 30) + 60} 프레임 권장`);
        } catch (e) {
            console.error(`Scene ${i}: 파일 없음`);
        }
    }

    // 평균 계산
    const avgDuration = Math.ceil(audioLengths.reduce((sum, a) => sum + a.estimatedDuration, 0) / audioLengths.length);
    const recommendedSceneDuration = avgDuration * 30 + 90; // 3초 여유

    console.log(`\n평균 오디오 길이: ${avgDuration}초`);
    console.log(`권장 씬 길이: ${recommendedSceneDuration} 프레임 (${Math.ceil(recommendedSceneDuration / 30)}초)`);

    // 결과 저장
    fs.writeFileSync('data/audio-analysis.json', JSON.stringify({
        scenes: audioLengths,
        avgDuration,
        recommendedSceneDuration
    }, null, 2));
}

analyzeAudio().catch(console.error);
