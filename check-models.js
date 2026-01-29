// 사용 가능한 Gemini 모델 목록 확인
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    console.log('🔍 사용 가능한 Gemini 모델 목록:\n');

    // 일반적으로 사용 가능한 모델들 테스트
    const modelsToTest = [
      'gemini-pro',
      'gemini-1.0-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-2.0-flash-exp',
      'models/gemini-pro',
      'models/gemini-1.5-flash',
    ];

    for (const modelName of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hi');
        console.log(`✅ ${modelName} - 작동함`);
      } catch (error) {
        console.log(`❌ ${modelName} - 오류: ${error.message.substring(0, 100)}`);
      }
    }

  } catch (error) {
    console.error('오류:', error);
  }
}

listModels();
