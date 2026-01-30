const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testAPI() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        console.error('❌ API 키가 없습니다');
        return;
    }

    console.log('🔑 API 키:', apiKey.substring(0, 10) + '...');

    const genAI = new GoogleGenerativeAI(apiKey);

    // Try different model names
    const modelsToTry = [
        'gemini-1.5-flash',
        'gemini-pro',
        'models/gemini-1.5-flash',
        'models/gemini-pro'
    ];

    for (const modelName of modelsToTry) {
        try {
            console.log(`\n🧪 Testing: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say hello');
            const text = result.response.text();
            console.log(`✅ SUCCESS: ${modelName}`);
            console.log(`   Response: ${text.substring(0, 50)}...`);
            break;
        } catch (error) {
            console.log(`❌ FAILED: ${modelName} - ${error.message}`);
        }
    }
}

testAPI();
