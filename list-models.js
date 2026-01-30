const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        console.error('❌ API 키가 없습니다');
        return;
    }

    console.log('🔍 사용 가능한 모델 조회 중...\n');

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Try to list models using direct fetch
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        if (!response.ok) {
            console.error(`❌ HTTP ${response.status}: ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }

        const data = await response.json();

        if (data.models && data.models.length > 0) {
            console.log(`✅ 총 ${data.models.length}개 모델 발견:\n`);
            data.models.forEach(model => {
                console.log(`📦 ${model.name}`);
                if (model.supportedGenerationMethods) {
                    console.log(`   지원 메서드: ${model.supportedGenerationMethods.join(', ')}`);
                }
            });
        } else {
            console.log('⚠️ 모델이 없습니다');
        }

    } catch (error) {
        console.error('❌ 오류:', error.message);
    }
}

listModels();
