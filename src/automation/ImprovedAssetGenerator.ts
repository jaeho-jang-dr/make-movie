// 개선된 에셋 생성기 - 깜깜이 + 소품 통합
import { GrokAgent } from './agents/GrokAgent';
import { promises as fs } from 'fs';

export class ImprovedAssetGenerator {
    private grok: GrokAgent;

    constructor(grokApiKey: string) {
        this.grok = new GrokAgent(grokApiKey);
    }

    // 깜깜이 (고양이) 캐릭터 생성
    async generateKkamkkamCharacter() {
        console.log('🐱 깜깜이 (신비한 고양이) 에셋 생성 중...\n');

        const poses = [
            { name: '깜깜이_앞모습_앉기', description: 'Black cat sitting, front view, glowing yellow eyes, Disney Pixar style' },
            { name: '깜깜이_옆모습_걷기', description: 'Black cat walking sideways, elegant pose, tail up' },
            { name: '깜깜이_뒷모습_점프', description: 'Black cat jumping away, back view, dynamic motion' },
            { name: '깜깜이_앞모습_응시', description: 'Black cat staring intensely, front view, mysterious aura' },
            { name: '깜깜이_앞모습_미소', description: 'Black cat with gentle smile, cute expression' },
            { name: '깜깜이_옆모습_숨기', description: 'Black cat hiding behind something, sneaky pose' },
            { name: '깜깜이_앞모습_말하기', description: 'Black cat speaking/meowing, mouth open, expressive' },
            { name: '깜깜이_앞모습_사라짐', description: 'Black cat fading away mysteriously, semi-transparent effect' }
        ];

        await fs.mkdir('public/assets/characters/kkamkkam', { recursive: true });

        for (const pose of poses) {
            console.log(`  🎨 ${pose.name}`);
            const svg = await this.generateCatPose(pose);
            await fs.writeFile(`public/assets/characters/kkamkkam/${pose.name}.svg`, svg);
        }

        console.log('\n✅ 깜깜이 에셋 생성 완료!\n');
    }

    private async generateCatPose(pose: any): Promise<string> {
        const prompt = `Create a Disney-Pixar style SVG of a mysterious black cat.

Pose: ${pose.description}

Requirements:
- Small, cute black cat with BIG glowing yellow eyes
- Smooth, elegant curves
- Mysterious but friendly appearance
- ViewBox: 0 0 400 400
- Centered in frame
- Clean vector art
- Output ONLY SVG code`;

        try {
            const response = await this.grok.generateContent(prompt, "You are a Disney-Pixar character artist specializing in cute animal characters.");
            const svgMatch = response.match(/<svg[\s\S]*?<\/svg>/);
            if (svgMatch) return svgMatch[0];
        } catch (e) {
            console.warn(`  ⚠️ Grok failed, using procedural cat`);
        }

        // Fallback: Procedural cat
        return this.createProceduralCat(pose.name);
    }

    private createProceduralCat(poseName: string): string {
        const isTransparent = poseName.includes('사라짐');
        const opacity = isTransparent ? 0.4 : 1;

        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
            <!-- Body -->
            <ellipse cx="200" cy="250" rx="80" ry="60" fill="#1a1a1a" opacity="${opacity}"/>

            <!-- Head -->
            <circle cx="200" cy="180" r="70" fill="#0d0d0d" opacity="${opacity}"/>

            <!-- Ears -->
            <path d="M150 150 L140 100 L170 140 Z" fill="#0d0d0d" opacity="${opacity}"/>
            <path d="M250 150 L260 100 L230 140 Z" fill="#0d0d0d" opacity="${opacity}"/>

            <!-- Eyes (glowing yellow) -->
            <ellipse cx="175" cy="170" rx="18" ry="25" fill="#FFD700" opacity="${opacity * 1.2}"/>
            <ellipse cx="225" cy="170" rx="18" ry="25" fill="#FFD700" opacity="${opacity * 1.2}"/>
            <ellipse cx="175" cy="170" rx="8" ry="12" fill="#000"/>
            <ellipse cx="225" cy="170" rx="8" ry="12" fill="#000"/>

            <!-- Eye glow -->
            <circle cx="175" cy="165" r="4" fill="white" opacity="0.8"/>
            <circle cx="225" cy="165" r="4" fill="white" opacity="0.8"/>

            <!-- Nose -->
            <path d="M200 190 L195 200 L205 200 Z" fill="#FF69B4" opacity="${opacity}"/>

            <!-- Whiskers -->
            <line x1="150" y1="185" x2="100" y2="180" stroke="#333" stroke-width="2" opacity="${opacity}"/>
            <line x1="150" y1="195" x2="100" y2="200" stroke="#333" stroke-width="2" opacity="${opacity}"/>
            <line x1="250" y1="185" x2="300" y2="180" stroke="#333" stroke-width="2" opacity="${opacity}"/>
            <line x1="250" y1="195" x2="300" y2="200" stroke="#333" stroke-width="2" opacity="${opacity}"/>

            <!-- Tail -->
            <path d="M120 260 Q80 240 90 200" stroke="#1a1a1a" stroke-width="20" fill="none" stroke-linecap="round" opacity="${opacity}"/>
        </svg>`;
    }

    // 소품을 캐릭터 손에 배치하는 통합 SVG 생성
    async generateCharacterWithProp(characterPose: string, propName: string, position: 'left-hand' | 'right-hand' | 'both-hands'): Promise<string> {
        console.log(`  🔗 ${characterPose} + ${propName}`);

        // 캐릭터 SVG 읽기
        let charSvg = '';
        try {
            charSvg = await fs.readFile(`public/assets/characters/${characterPose}.svg`, 'utf-8');
        } catch (e) {
            console.warn(`    캐릭터 에셋 없음: ${characterPose}`);
            return '';
        }

        // 소품 SVG 읽기
        let propSvg = '';
        try {
            propSvg = await fs.readFile(`public/assets/props/${propName}.svg`, 'utf-8');
        } catch (e) {
            console.warn(`    소품 에셋 없음: ${propName}`);
            return charSvg; // 소품 없이 캐릭터만 반환
        }

        // SVG 통합 (간단한 방법: 두 SVG를 겹쳐서 배치)
        const combined = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <!-- Character -->
            <g transform="translate(0, 0)">
                ${charSvg.replace(/<\?xml[^>]*>|<svg[^>]*>|<\/svg>/g, '')}
            </g>

            <!-- Prop (positioned based on hand) -->
            <g transform="translate(${position === 'right-hand' ? 350 : 150}, 300) scale(0.3)">
                ${propSvg.replace(/<\?xml[^>]*>|<svg[^>]*>|<\/svg>/g, '')}
            </g>
        </svg>`;

        return combined;
    }
}
