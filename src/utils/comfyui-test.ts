/**
 * ComfyUI 연결 테스트 유틸리티
 */

import 'dotenv/config';

const COMFYUI_URL = process.env.COMFYUI_URL || 'http://127.0.0.1:8188';

async function testComfyUIConnection(): Promise<void> {
    console.log('\n=== ComfyUI Connection Test ===\n');
    console.log(`URL: ${COMFYUI_URL}`);

    try {
        // 1. 시스템 정보 확인
        console.log('\n[1] Checking system info...');
        const sysResponse = await fetch(`${COMFYUI_URL}/system_stats`);

        if (!sysResponse.ok) {
            throw new Error(`HTTP ${sysResponse.status}`);
        }

        const sysInfo = await sysResponse.json();
        console.log('   ✅ ComfyUI is running!');
        console.log(`   VRAM: ${Math.round((sysInfo.devices?.[0]?.vram_total || 0) / 1024 / 1024 / 1024)}GB`);

        // 2. 모델 목록 확인
        console.log('\n[2] Checking available models...');
        const objResponse = await fetch(`${COMFYUI_URL}/object_info`);

        if (objResponse.ok) {
            const objInfo = await objResponse.json();
            const checkpointLoader = objInfo.CheckpointLoaderSimple;

            if (checkpointLoader?.input?.required?.ckpt_name?.[0]) {
                const models = checkpointLoader.input.required.ckpt_name[0];
                console.log(`   ✅ Found ${models.length} checkpoint models:`);
                models.slice(0, 5).forEach((m: string) => console.log(`      - ${m}`));
                if (models.length > 5) console.log(`      ... and ${models.length - 5} more`);
            }
        }

        // 3. 큐 상태 확인
        console.log('\n[3] Checking queue status...');
        const queueResponse = await fetch(`${COMFYUI_URL}/queue`);

        if (queueResponse.ok) {
            const queue = await queueResponse.json();
            console.log(`   ✅ Queue running: ${queue.queue_running?.length || 0}`);
            console.log(`   ⏳ Queue pending: ${queue.queue_pending?.length || 0}`);
        }

        console.log('\n✅ ComfyUI is ready for image generation!\n');

    } catch (error) {
        console.log('\n❌ ComfyUI connection failed!');
        console.log(`   Error: ${error}`);
        console.log('\n💡 Make sure ComfyUI is running:');
        console.log('   1. cd <comfyui-folder>');
        console.log('   2. python main.py --listen');
        console.log('   3. Open http://127.0.0.1:8188 in browser\n');
    }
}

// 이미지 생성 테스트
async function testImageGeneration(): Promise<void> {
    console.log('\n=== Image Generation Test ===\n');

    const testPrompt = {
        prompt: 'a cute anime girl with blue hair, standing in a forest',
        negative: 'ugly, deformed, blurry',
        width: 512,
        height: 512,
        steps: 20,
    };

    console.log('Test prompt:', testPrompt.prompt);
    console.log('This would generate an image via ComfyUI...');
    console.log('(Actual generation requires ComfyUI to be running)\n');
}

// CLI
const args = process.argv.slice(2);
if (args.includes('--generate')) {
    testImageGeneration();
} else {
    testComfyUIConnection();
}
