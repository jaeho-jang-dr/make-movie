
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error('No API Key found');
    return;
  }
  console.log('Testing with API Key:', apiKey.substring(0, 10) + '...');

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Test Gemini Pro
  try {
    console.log('Testing gemini-pro...');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    console.log('Success gemini-pro:', response.text());
  } catch (e: any) {
    console.error('Failed gemini-pro FULL ERROR:', JSON.stringify(e, null, 2));
    console.error('Error message:', e.message);
  }

  // Test with prefix
  try {
    console.log('Testing models/gemini-pro...');
    const model = genAI.getGenerativeModel({ model: 'models/gemini-pro' });
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    console.log('Success models/gemini-pro:', response.text());
  } catch (e: any) {
    console.error('Failed models/gemini-pro:', e.message);
  }

  // Test Gemini 1.5 Flash
  try {
    console.log('Testing gemini-1.5-flash...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    console.log('Success gemini-1.5-flash:', response.text());
  } catch (e: any) {
    console.error('Failed gemini-1.5-flash FULL ERROR:', JSON.stringify(e, null, 2));
    console.error('Error message:', e.message);
  }
}

test();
