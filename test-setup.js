// Test script to validate environment setup
require('dotenv').config();

console.log('🔍 Environment Setup Validation\n');
console.log('='.repeat(60));

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
console.log(`✓ Node.js Version: ${nodeVersion}${majorVersion >= 18 ? ' (OK)' : ' ⚠️ (Need v18+)'}`);

// Check environment variables
const checks = [
  { name: 'GOOGLE_AI_API_KEY', required: true },
  { name: 'GOOGLE_APPLICATION_CREDENTIALS', required: true },
  { name: 'HUGGING_FACE_API_KEY', required: false },
  { name: 'IMAGE_GENERATOR', required: false },
  { name: 'TTS_LANGUAGE_CODE', required: false },
];

console.log('\n📋 Environment Variables:');
console.log('-'.repeat(60));

let hasErrors = false;

checks.forEach(check => {
  const value = process.env[check.name];
  const status = value
    ? (value === 'your_huggingface_api_key_here' ? '⚠️ NOT SET (using placeholder)' : '✅ SET')
    : (check.required ? '❌ MISSING (REQUIRED)' : '⚠️ NOT SET (optional)');

  if (!value && check.required) hasErrors = true;
  if (value === 'your_huggingface_api_key_here' && check.name === 'HUGGING_FACE_API_KEY') {
    console.log(`  ${check.name}: ${status}`);
    console.log(`    → Get your key at: https://huggingface.co/settings/tokens`);
  } else {
    console.log(`  ${check.name}: ${status}`);
  }
});

// Check image generator mode
console.log('\n🎨 Image Generation Mode:');
console.log('-'.repeat(60));
const imageGen = process.env.IMAGE_GENERATOR || 'placeholder';
const hfKey = process.env.HUGGING_FACE_API_KEY;
const useHF = imageGen === 'huggingface' && hfKey && hfKey !== 'your_huggingface_api_key_here';

if (useHF) {
  console.log('  ✅ Hugging Face FLUX.1 (Real Illustrations)');
  console.log('  → Cost: FREE');
} else {
  console.log('  ⚠️ Enhanced Placeholders (SVG Gradients)');
  console.log('  → To use real illustrations, set HUGGING_FACE_API_KEY in .env');
}

// Check dependencies
console.log('\n📦 Dependencies:');
console.log('-'.repeat(60));

try {
  require('@huggingface/inference');
  console.log('  ✅ @huggingface/inference installed');
} catch (e) {
  console.log('  ❌ @huggingface/inference NOT installed');
  console.log('     Run: npm install @huggingface/inference');
  hasErrors = true;
}

try {
  require('@google/generative-ai');
  console.log('  ✅ @google/generative-ai installed');
} catch (e) {
  console.log('  ❌ @google/generative-ai NOT installed');
  hasErrors = true;
}

try {
  require('@google-cloud/text-to-speech');
  console.log('  ✅ @google-cloud/text-to-speech installed');
} catch (e) {
  console.log('  ❌ @google-cloud/text-to-speech NOT installed');
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ Setup incomplete. Please fix the errors above.');
  console.log('\n📖 Read SETUP_GUIDE.md for detailed instructions.');
  process.exit(1);
} else if (!useHF) {
  console.log('⚠️ Setup complete, but using placeholders for images.');
  console.log('   Set HUGGING_FACE_API_KEY to generate real illustrations.');
  console.log('\n📖 Read SETUP_GUIDE.md for instructions.');
} else {
  console.log('✅ Setup complete! Ready to generate videos.');
  console.log('\n🚀 Try: npm run create -- -t "작은 곰의 모험" -d 1 -a 5');
}
console.log('='.repeat(60) + '\n');
