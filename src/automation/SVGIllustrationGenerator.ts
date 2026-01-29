// SVG 일러스트레이션 생성기 (고급 버전)
// 프로그래밍으로 동화책 스타일 SVG 생성

interface Scene {
  sceneNumber: number;
  duration: number;
  narration: string;
  backgroundDescription: string;
  characters: string[];
  actions: string[];
}

export class SVGIllustrationGenerator {
  private colorPalettes = [
    // 따뜻한 봄
    { sky: '#87CEEB', ground: '#90EE90', accent: '#FFB6C1', sun: '#FFD700', tree: '#228B22' },
    // 시원한 여름
    { sky: '#4A90E2', ground: '#2ECC71', accent: '#F39C12', sun: '#E74C3C', tree: '#006400' },
    // 가을 단풍
    { sky: '#E8A87C', ground: '#C38D5B', accent: '#E85D75', sun: '#F4A460', tree: '#8B4513' },
    // 겨울 설경
    { sky: '#B0C4DE', ground: '#E0FFFF', accent: '#9370DB', sun: '#FFA07A', tree: '#2F4F4F' },
    // 환상적인 숲
    { sky: '#DDA0DD', ground: '#98FB98', accent: '#FF69B4', sun: '#FFD700', tree: '#32CD32' },
    // 황혼
    { sky: '#FF6B6B', ground: '#8B7355', accent: '#FFB347', sun: '#FF4500', tree: '#654321' },
    // 마법의 밤
    { sky: '#191970', ground: '#2F4F4F', accent: '#9370DB', sun: '#F0E68C', tree: '#1C1C1C' },
    // 무지개 숲
    { sky: '#87CEFA', ground: '#7CFC00', accent: '#FF1493', sun: '#FFD700', tree: '#00CED1' },
  ];

  generateIllustration(scene: Scene): string {
    const palette = this.colorPalettes[scene.sceneNumber % this.colorPalettes.length];
    const sceneType = this.detectSceneType(scene);

    let svg = this.createSVGHeader();

    // 배경 레이어
    svg += this.createBackground(palette, sceneType);

    // 장식 요소 (나무, 구름, 별 등)
    svg += this.createEnvironmentElements(palette, sceneType, scene.sceneNumber);

    // 캐릭터 (동물, 사람 등)
    if (scene.characters.length > 0) {
      svg += this.createCharacters(palette, scene.characters, scene.sceneNumber);
    }

    // 전경 장식
    svg += this.createForegroundElements(palette, sceneType);

    svg += this.createSVGFooter();

    return svg;
  }

  private createSVGHeader(): string {
    return `<svg width="1024" height="768" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 768">\n`;
  }

  private createSVGFooter(): string {
    return `</svg>`;
  }

  private detectSceneType(scene: Scene): string {
    const desc = scene.backgroundDescription.toLowerCase();
    const narration = scene.narration.toLowerCase();
    const combined = desc + ' ' + narration;

    if (combined.includes('forest') || combined.includes('숲') || combined.includes('tree')) return 'forest';
    if (combined.includes('night') || combined.includes('밤') || combined.includes('star')) return 'night';
    if (combined.includes('ocean') || combined.includes('sea') || combined.includes('바다')) return 'ocean';
    if (combined.includes('mountain') || combined.includes('산')) return 'mountain';
    if (combined.includes('house') || combined.includes('집') || combined.includes('village')) return 'village';

    return 'default';
  }

  private createBackground(palette: any, sceneType: string): string {
    let bg = '';

    // 하늘 그라디언트
    bg += `
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${palette.sky};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${this.lighten(palette.sky, 30)};stop-opacity:1" />
        </linearGradient>
        <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${palette.ground};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${this.darken(palette.ground, 20)};stop-opacity:1" />
        </linearGradient>
      </defs>
    `;

    // 하늘
    bg += `<rect x="0" y="0" width="1024" height="500" fill="url(#skyGradient)"/>\n`;

    // 태양 또는 달
    if (sceneType === 'night') {
      bg += `<circle cx="850" cy="150" r="60" fill="#FFF8DC" opacity="0.9"/>\n`;
      bg += `<circle cx="840" cy="140" r="55" fill="${palette.sky}"/>\n`; // 초승달
    } else {
      bg += `<circle cx="850" cy="150" r="70" fill="${palette.sun}" opacity="0.8"/>\n`;
      bg += `<circle cx="850" cy="150" r="60" fill="${this.lighten(palette.sun, 20)}"/>\n`;
    }

    // 땅
    bg += `<rect x="0" y="500" width="1024" height="268" fill="url(#groundGradient)"/>\n`;

    return bg;
  }

  private createEnvironmentElements(palette: any, sceneType: string, seed: number): string {
    let elements = '';

    switch (sceneType) {
      case 'forest':
        elements += this.createTrees(palette, seed);
        elements += this.createFlowers(palette, seed);
        break;
      case 'night':
        elements += this.createStars(seed);
        elements += this.createMoon(palette);
        break;
      case 'ocean':
        elements += this.createWaves(palette);
        break;
      case 'mountain':
        elements += this.createMountains(palette);
        break;
      case 'village':
        elements += this.createHouses(palette, seed);
        elements += this.createTrees(palette, seed);
        break;
      default:
        elements += this.createClouds(palette, seed);
        elements += this.createFlowers(palette, seed);
        elements += this.createTrees(palette, seed);
    }

    return elements;
  }

  // 집들 (마을 장면용)
  private createHouses(palette: any, seed: number): string {
    let houses = '';
    const houseCount = 2 + (seed % 2);

    for (let i = 0; i < houseCount; i++) {
      const x = 150 + i * 350;
      const y = 400;
      const houseColor = this.colorPalettes[(seed + i) % this.colorPalettes.length].accent;
      const roofColor = this.darken(houseColor, 30);

      houses += `
        <!-- 집 ${i + 1} -->
        <g>
          <!-- 집 몸체 -->
          <rect x="${x}" y="${y}" width="120" height="140" fill="${houseColor}" stroke="${this.darken(houseColor, 20)}" stroke-width="3" rx="5"/>

          <!-- 지붕 -->
          <path d="M ${x - 15} ${y} L ${x + 60} ${y - 60} L ${x + 135} ${y} Z" fill="${roofColor}" stroke="${this.darken(roofColor, 20)}" stroke-width="3"/>

          <!-- 굴뚝 -->
          <rect x="${x + 85}" y="${y - 50}" width="20" height="50" fill="${this.darken(roofColor, 10)}" rx="3"/>
          <rect x="${x + 80}" y="${y - 55}" width="30" height="10" fill="${this.darken(roofColor, 15)}" rx="2"/>

          <!-- 연기 -->
          <circle cx="${x + 95}" cy="${y - 70}" r="8" fill="#D3D3D3" opacity="0.6"/>
          <circle cx="${x + 90}" cy="${y - 85}" r="10" fill="#C0C0C0" opacity="0.5"/>
          <circle cx="${x + 100}" cy="${y - 95}" r="12" fill="#B0B0B0" opacity="0.4"/>

          <!-- 문 -->
          <rect x="${x + 45}" y="${y + 70}" width="30" height="70" fill="${this.darken(houseColor, 40)}" rx="15" rx="5"/>
          <circle cx="${x + 68}" cy="${y + 105}" r="3" fill="#FFD700"/>

          <!-- 창문 -->
          <rect x="${x + 15}" y="${y + 30}" width="35" height="35" fill="#87CEEB" stroke="${this.darken(houseColor, 30)}" stroke-width="2" rx="3"/>
          <line x1="${x + 15}" y1="${y + 47.5}" x2="${x + 50}" y2="${y + 47.5}" stroke="${this.darken(houseColor, 30)}" stroke-width="2"/>
          <line x1="${x + 32.5}" y1="${y + 30}" x2="${x + 32.5}" y2="${y + 65}" stroke="${this.darken(houseColor, 30)}" stroke-width="2"/>

          <rect x="${x + 70}" y="${y + 30}" width="35" height="35" fill="#87CEEB" stroke="${this.darken(houseColor, 30)}" stroke-width="2" rx="3"/>
          <line x1="${x + 70}" y1="${y + 47.5}" x2="${x + 105}" y2="${y + 47.5}" stroke="${this.darken(houseColor, 30)}" stroke-width="2"/>
          <line x1="${x + 87.5}" y1="${y + 30}" x2="${x + 87.5}" y2="${y + 65}" stroke="${this.darken(houseColor, 30)}" stroke-width="2"/>
        </g>
      `;
    }

    return houses;
  }

  // 달 (밤 장면용)
  private createMoon(palette: any): string {
    return `
      <!-- 달 -->
      <g>
        <circle cx="850" cy="150" r="65" fill="#FFF8DC" opacity="0.95"/>
        <circle cx="840" cy="140" r="58" fill="${palette.sky}"/>
        <!-- 크레이터 -->
        <circle cx="860" cy="140" r="12" fill="#F0E68C" opacity="0.4"/>
        <circle cx="835" cy="165" r="8" fill="#F0E68C" opacity="0.3"/>
        <circle cx="870" cy="170" r="6" fill="#F0E68C" opacity="0.35"/>
      </g>
    `;
  }

  private createTrees(palette: any, seed: number): string {
    let trees = '';
    const treeCount = 3 + (seed % 3);

    for (let i = 0; i < treeCount; i++) {
      const x = 100 + i * 250 + (seed * 17) % 100;
      const y = 420;
      const treeType = i % 3;

      if (treeType === 0) {
        // 둥근 나무
        const trunkColor = '#654321';
        const leafColor = palette.tree || '#228B22';

        trees += `
          <!-- 둥근 나무 -->
          <rect x="${x}" y="${y}" width="35" height="120" fill="${trunkColor}" rx="8"/>
          <rect x="${x + 5}" y="${y + 10}" width="25" height="100" fill="${this.lighten(trunkColor, 15)}" rx="6"/>
          <circle cx="${x + 18}" cy="${y - 25}" r="65" fill="${leafColor}" opacity="0.9"/>
          <circle cx="${x - 15}" cy="${y + 10}" r="55" fill="${this.darken(leafColor, 10)}" opacity="0.8"/>
          <circle cx="${x + 50}" cy="${y + 10}" r="55" fill="${this.darken(leafColor, 10)}" opacity="0.8"/>
          <circle cx="${x + 18}" cy="${y - 10}" r="50" fill="${this.lighten(leafColor, 20)}" opacity="0.7"/>
        `;
      } else if (treeType === 1) {
        // 침엽수
        const trunkColor = '#8B4513';
        const leafColor = palette.tree || '#2F4F2F';

        trees += `
          <!-- 침엽수 -->
          <rect x="${x + 10}" y="${y + 30}" width="25" height="110" fill="${trunkColor}" rx="5"/>
          <path d="M ${x + 22} ${y - 40} L ${x - 30} ${y + 10} L ${x + 75} ${y + 10} Z" fill="${leafColor}"/>
          <path d="M ${x + 22} ${y - 10} L ${x - 20} ${y + 30} L ${x + 65} ${y + 30} Z" fill="${this.darken(leafColor, 10)}"/>
          <path d="M ${x + 22} ${y + 20} L ${x - 10} ${y + 50} L ${x + 55} ${y + 50} Z" fill="${this.darken(leafColor, 15)}"/>
        `;
      } else {
        // 넓은 나무
        const trunkColor = '#6B4423';
        const leafColor = palette.tree || '#32CD32';

        trees += `
          <!-- 넓은 나무 -->
          <rect x="${x}" y="${y + 20}" width="40" height="120" fill="${trunkColor}" rx="10"/>
          <ellipse cx="${x + 20}" cy="${y - 20}" rx="80" ry="60" fill="${leafColor}" opacity="0.85"/>
          <ellipse cx="${x - 25}" cy="${y + 15}" rx="50" ry="45" fill="${this.darken(leafColor, 15)}" opacity="0.75"/>
          <ellipse cx="${x + 65}" cy="${y + 15}" rx="50" ry="45" fill="${this.darken(leafColor, 15)}" opacity="0.75"/>
          <ellipse cx="${x + 20}" cy="${y + 5}" rx="60" ry="50" fill="${this.lighten(leafColor, 10)}" opacity="0.7"/>
        `;
      }
    }

    return trees;
  }

  private createStars(seed: number): string {
    let stars = '';
    const starCount = 20 + (seed % 10);

    for (let i = 0; i < starCount; i++) {
      const x = (seed * 37 + i * 43) % 1024;
      const y = (seed * 19 + i * 29) % 400;
      const size = 2 + (i % 3);

      stars += `<circle cx="${x}" cy="${y}" r="${size}" fill="#FFFFFF" opacity="0.8"/>\n`;
    }

    return stars;
  }

  private createWaves(palette: any): string {
    let waves = '';
    const waveColor = this.adjustColor(palette.accent, -20);

    for (let i = 0; i < 3; i++) {
      const y = 480 + i * 30;
      waves += `<path d="M 0 ${y} Q 128 ${y - 20} 256 ${y} T 512 ${y} T 768 ${y} T 1024 ${y} L 1024 768 L 0 768 Z"
                fill="${waveColor}" opacity="${0.3 + i * 0.2}"/>\n`;
    }

    return waves;
  }

  private createMountains(palette: any): string {
    let mountains = '';
    const mountainColor = this.darken(palette.ground, 40);

    // 뒷산
    mountains += `<path d="M 0 400 L 200 250 L 400 350 L 600 200 L 800 300 L 1024 250 L 1024 768 L 0 768 Z"
                  fill="${mountainColor}" opacity="0.6"/>\n`;

    // 앞산
    mountains += `<path d="M 0 500 L 300 300 L 500 400 L 800 280 L 1024 400 L 1024 768 L 0 768 Z"
                  fill="${this.darken(palette.ground, 30)}" opacity="0.8"/>\n`;

    return mountains;
  }

  private createClouds(palette: any, seed: number): string {
    let clouds = '';
    const cloudCount = 2 + (seed % 3);

    for (let i = 0; i < cloudCount; i++) {
      const x = 150 + i * 300 + (seed * 23) % 100;
      const y = 100 + (seed * i * 17) % 150;

      clouds += `<ellipse cx="${x}" cy="${y}" rx="60" ry="30" fill="white" opacity="0.7"/>\n`;
      clouds += `<ellipse cx="${x + 40}" cy="${y}" rx="50" ry="35" fill="white" opacity="0.7"/>\n`;
      clouds += `<ellipse cx="${x + 20}" cy="${y - 15}" rx="45" ry="25" fill="white" opacity="0.7"/>\n`;
    }

    return clouds;
  }

  private createFlowers(palette: any, seed: number): string {
    let flowers = '';
    const flowerCount = 5 + (seed % 5);

    for (let i = 0; i < flowerCount; i++) {
      const x = 50 + i * 180 + (seed * 13) % 80;
      const y = 650 + (seed * i * 7) % 50;
      const petalColor = palette.accent;

      // 꽃잎 5개
      for (let p = 0; p < 5; p++) {
        const angle = (p * 72) * Math.PI / 180;
        const px = x + Math.cos(angle) * 15;
        const py = y + Math.sin(angle) * 15;
        flowers += `<circle cx="${px}" cy="${py}" r="8" fill="${petalColor}"/>\n`;
      }

      // 꽃 중심
      flowers += `<circle cx="${x}" cy="${y}" r="6" fill="${this.darken(palette.sun, 20)}"/>\n`;
    }

    return flowers;
  }

  private createCharacters(palette: any, characters: string[], seed: number): string {
    let chars = '';
    const charCount = Math.min(characters.length, 3);

    for (let i = 0; i < charCount; i++) {
      const x = 200 + i * 280;
      const y = 480;
      const charType = this.detectCharacterType(characters[i]);

      switch (charType) {
        case 'rabbit':
          chars += this.createRabbit(x, y, palette, seed + i);
          break;
        case 'squirrel':
          chars += this.createSquirrel(x, y, palette, seed + i);
          break;
        case 'bird':
          chars += this.createBird(x, y, palette, seed + i);
          break;
        case 'bear':
          chars += this.createBear(x, y, palette, seed + i);
          break;
        case 'butterfly':
          chars += this.createButterfly(x, y - 50, palette, seed + i);
          break;
        default:
          chars += this.createRabbit(x, y, palette, seed + i);
      }
    }

    return chars;
  }

  private detectCharacterType(charDesc: string): string {
    const desc = charDesc.toLowerCase();
    if (desc.includes('rabbit') || desc.includes('토끼')) return 'rabbit';
    if (desc.includes('squirrel') || desc.includes('다람쥐')) return 'squirrel';
    if (desc.includes('bird') || desc.includes('새')) return 'bird';
    if (desc.includes('bear') || desc.includes('곰')) return 'bear';
    if (desc.includes('butterfly') || desc.includes('나비')) return 'butterfly';
    return 'rabbit';
  }

  // 토끼 캐릭터 (개선된 버전)
  private createRabbit(x: number, y: number, palette: any, seed: number): string {
    const bodyColor = this.colorPalettes[seed % this.colorPalettes.length].accent;
    const belly = this.lighten(bodyColor, 30);

    return `
      <!-- 토끼 ${seed} -->
      <g id="rabbit-${seed}">
        <!-- 그림자 -->
        <ellipse cx="${x}" cy="${y + 130}" rx="45" ry="10" fill="rgba(0,0,0,0.2)"/>

        <!-- 몸통 -->
        <ellipse cx="${x}" cy="${y + 20}" rx="55" ry="75" fill="${bodyColor}"/>
        <ellipse cx="${x}" cy="${y + 30}" rx="40" ry="55" fill="${belly}"/>

        <!-- 머리 -->
        <circle cx="${x}" cy="${y - 50}" r="50" fill="${bodyColor}"/>
        <ellipse cx="${x}" cy="${y - 35}" rx="35" ry="40" fill="${belly}"/>

        <!-- 긴 귀 -->
        <ellipse cx="${x - 28}" cy="${y - 95}" rx="18" ry="45" fill="${bodyColor}"/>
        <ellipse cx="${x - 28}" cy="${y - 90}" rx="12" ry="35" fill="#FFB6C1"/>
        <ellipse cx="${x + 28}" cy="${y - 95}" rx="18" ry="45" fill="${bodyColor}"/>
        <ellipse cx="${x + 28}" cy="${y - 90}" rx="12" ry="35" fill="#FFB6C1"/>

        <!-- 눈 -->
        <circle cx="${x - 18}" cy="${y - 55}" r="6" fill="#000"/>
        <circle cx="${x - 16}" cy="${y - 57}" r="2" fill="#FFF"/>
        <circle cx="${x + 18}" cy="${y - 55}" r="6" fill="#000"/>
        <circle cx="${x + 20}" cy="${y - 57}" r="2" fill="#FFF"/>

        <!-- 코 -->
        <ellipse cx="${x}" cy="${y - 40}" rx="5" ry="4" fill="#FF69B4"/>

        <!-- 입 -->
        <path d="M ${x - 8} ${y - 38} Q ${x} ${y - 32} ${x + 8} ${y - 38}"
              stroke="#000" stroke-width="2" fill="none"/>

        <!-- 볼 -->
        <circle cx="${x - 25}" cy="${y - 40}" r="8" fill="#FFB6C1" opacity="0.5"/>
        <circle cx="${x + 25}" cy="${y - 40}" r="8" fill="#FFB6C1" opacity="0.5"/>

        <!-- 팔 -->
        <ellipse cx="${x - 60}" cy="${y + 30}" rx="15" ry="45" fill="${bodyColor}" transform="rotate(-25 ${x - 60} ${y + 30})"/>
        <ellipse cx="${x + 60}" cy="${y + 30}" rx="15" ry="45" fill="${bodyColor}" transform="rotate(25 ${x + 60} ${y + 30})"/>

        <!-- 다리 -->
        <ellipse cx="${x - 28}" cy="${y + 100}" rx="18" ry="50" fill="${bodyColor}"/>
        <ellipse cx="${x + 28}" cy="${y + 100}" rx="18" ry="50" fill="${bodyColor}"/>

        <!-- 발 -->
        <ellipse cx="${x - 28}" cy="${y + 135}" rx="22" ry="15" fill="${bodyColor}"/>
        <ellipse cx="${x + 28}" cy="${y + 135}" rx="22" ry="15" fill="${bodyColor}"/>

        <!-- 꼬리 -->
        <circle cx="${x}" cy="${y + 85}" r="18" fill="${belly}"/>
      </g>
    `;
  }

  // 다람쥐 캐릭터
  private createSquirrel(x: number, y: number, palette: any, seed: number): string {
    const bodyColor = '#D2691E';
    const belly = '#F4A460';

    return `
      <!-- 다람쥐 ${seed} -->
      <g id="squirrel-${seed}">
        <!-- 그림자 -->
        <ellipse cx="${x}" cy="${y + 120}" rx="40" ry="8" fill="rgba(0,0,0,0.2)"/>

        <!-- 큰 꼬리 -->
        <path d="M ${x - 30} ${y + 50} Q ${x - 80} ${y - 60} ${x - 40} ${y - 80} Q ${x - 20} ${y - 50} ${x - 10} ${y + 20}"
              fill="${bodyColor}" stroke="${this.darken(bodyColor, 20)}" stroke-width="2"/>

        <!-- 몸통 -->
        <ellipse cx="${x}" cy="${y + 10}" rx="45" ry="60" fill="${bodyColor}"/>
        <ellipse cx="${x}" cy="${y + 20}" rx="32" ry="45" fill="${belly}"/>

        <!-- 머리 -->
        <circle cx="${x}" cy="${y - 45}" r="38" fill="${bodyColor}"/>
        <ellipse cx="${x}" cy="${y - 35}" rx="28" ry="32" fill="${belly}"/>

        <!-- 귀 (뾰족) -->
        <path d="M ${x - 22} ${y - 75} L ${x - 30} ${y - 95} L ${x - 18} ${y - 80} Z" fill="${bodyColor}"/>
        <path d="M ${x + 22} ${y - 75} L ${x + 30} ${y - 95} L ${x + 18} ${y - 80} Z" fill="${bodyColor}"/>

        <!-- 눈 -->
        <circle cx="${x - 15}" cy="${y - 48}" r="7" fill="#000"/>
        <circle cx="${x - 13}" cy="${y - 50}" r="2.5" fill="#FFF"/>
        <circle cx="${x + 15}" cy="${y - 48}" r="7" fill="#000"/>
        <circle cx="${x + 17}" cy="${y - 50}" r="2.5" fill="#FFF"/>

        <!-- 코 -->
        <circle cx="${x}" cy="${y - 33}" r="4" fill="#000"/>

        <!-- 입 -->
        <path d="M ${x - 6} ${y - 30} Q ${x} ${y - 25} ${x + 6} ${y - 30}"
              stroke="#000" stroke-width="1.5" fill="none"/>

        <!-- 앞발 -->
        <ellipse cx="${x - 35}" cy="${y + 40}" rx="10" ry="30" fill="${bodyColor}"/>
        <ellipse cx="${x + 35}" cy="${y + 40}" rx="10" ry="30" fill="${bodyColor}"/>

        <!-- 뒷발 -->
        <ellipse cx="${x - 25}" cy="${y + 85}" rx="15" ry="35" fill="${bodyColor}"/>
        <ellipse cx="${x + 25}" cy="${y + 85}" rx="15" ry="35" fill="${bodyColor}"/>
      </g>
    `;
  }

  // 새 캐릭터
  private createBird(x: number, y: number, palette: any, seed: number): string {
    const bodyColor = this.colorPalettes[seed % this.colorPalettes.length].accent;
    const wingColor = this.darken(bodyColor, 15);

    return `
      <!-- 새 ${seed} -->
      <g id="bird-${seed}">
        <!-- 그림자 -->
        <ellipse cx="${x}" cy="${y + 80}" rx="35" ry="8" fill="rgba(0,0,0,0.2)"/>

        <!-- 몸통 -->
        <ellipse cx="${x}" cy="${y}" rx="40" ry="50" fill="${bodyColor}"/>

        <!-- 날개 (왼쪽) -->
        <ellipse cx="${x - 45}" cy="${y + 5}" rx="35" ry="25" fill="${wingColor}" transform="rotate(-30 ${x - 45} ${y + 5})"/>
        <ellipse cx="${x - 50}" cy="${y + 10}" rx="30" ry="20" fill="${this.lighten(wingColor, 10)}" transform="rotate(-30 ${x - 50} ${y + 10})"/>

        <!-- 날개 (오른쪽) -->
        <ellipse cx="${x + 45}" cy="${y + 5}" rx="35" ry="25" fill="${wingColor}" transform="rotate(30 ${x + 45} ${y + 5})"/>
        <ellipse cx="${x + 50}" cy="${y + 10}" rx="30" ry="20" fill="${this.lighten(wingColor, 10)}" transform="rotate(30 ${x + 50} ${y + 10})"/>

        <!-- 머리 -->
        <circle cx="${x}" cy="${y - 40}" r="32" fill="${bodyColor}"/>

        <!-- 눈 -->
        <circle cx="${x - 12}" cy="${y - 43}" r="8" fill="#FFF"/>
        <circle cx="${x - 12}" cy="${y - 43}" r="5" fill="#000"/>
        <circle cx="${x - 10}" cy="${y - 45}" r="2" fill="#FFF"/>
        <circle cx="${x + 12}" cy="${y - 43}" r="8" fill="#FFF"/>
        <circle cx="${x + 12}" cy="${y - 43}" r="5" fill="#000"/>
        <circle cx="${x + 14}" cy="${y - 45}" r="2" fill="#FFF"/>

        <!-- 부리 -->
        <path d="M ${x} ${y - 35} L ${x + 15} ${y - 30} L ${x} ${y - 25} Z" fill="#FFA500"/>

        <!-- 다리 -->
        <line x1="${x - 15}" y1="${y + 50}" x2="${x - 15}" y2="${y + 75}" stroke="#FF8C00" stroke-width="3"/>
        <line x1="${x + 15}" y1="${y + 50}" x2="${x + 15}" y2="${y + 75}" stroke="#FF8C00" stroke-width="3"/>

        <!-- 발 -->
        <path d="M ${x - 15} ${y + 75} L ${x - 25} ${y + 80} M ${x - 15} ${y + 75} L ${x - 15} ${y + 82} M ${x - 15} ${y + 75} L ${x - 5} ${y + 80}"
              stroke="#FF8C00" stroke-width="2" fill="none"/>
        <path d="M ${x + 15} ${y + 75} L ${x + 5} ${y + 80} M ${x + 15} ${y + 75} L ${x + 15} ${y + 82} M ${x + 15} ${y + 75} L ${x + 25} ${y + 80}"
              stroke="#FF8C00" stroke-width="2" fill="none"/>
      </g>
    `;
  }

  // 곰 캐릭터
  private createBear(x: number, y: number, palette: any, seed: number): string {
    const bodyColor = '#8B4513';
    const belly = '#D2691E';

    return `
      <!-- 곰 ${seed} -->
      <g id="bear-${seed}">
        <!-- 그림자 -->
        <ellipse cx="${x}" cy="${y + 145}" rx="60" ry="12" fill="rgba(0,0,0,0.2)"/>

        <!-- 몸통 (큼) -->
        <ellipse cx="${x}" cy="${y + 30}" rx="70" ry="90" fill="${bodyColor}"/>
        <ellipse cx="${x}" cy="${y + 40}" rx="50" ry="70" fill="${belly}"/>

        <!-- 머리 -->
        <circle cx="${x}" cy="${y - 60}" r="55" fill="${bodyColor}"/>
        <ellipse cx="${x}" cy="${y - 45}" rx="40" ry="45" fill="${belly}"/>

        <!-- 귀 (둥근) -->
        <circle cx="${x - 40}" cy="${y - 95}" r="22" fill="${bodyColor}"/>
        <circle cx="${x - 40}" cy="${y - 93}" r="15" fill="${this.lighten(bodyColor, 20)}"/>
        <circle cx="${x + 40}" cy="${y - 95}" r="22" fill="${bodyColor}"/>
        <circle cx="${x + 40}" cy="${y - 93}" r="15" fill="${this.lighten(bodyColor, 20)}"/>

        <!-- 눈 -->
        <circle cx="${x - 20}" cy="${y - 65}" r="6" fill="#000"/>
        <circle cx="${x - 18}" cy="${y - 67}" r="2" fill="#FFF"/>
        <circle cx="${x + 20}" cy="${y - 65}" r="6" fill="#000"/>
        <circle cx="${x + 22}" cy="${y - 67}" r="2" fill="#FFF"/>

        <!-- 코 -->
        <ellipse cx="${x}" cy="${y - 45}" rx="8" ry="6" fill="#000"/>

        <!-- 입 -->
        <path d="M ${x - 12} ${y - 40} Q ${x} ${y - 30} ${x + 12} ${y - 40}"
              stroke="#000" stroke-width="2.5" fill="none"/>

        <!-- 팔 (두꺼움) -->
        <ellipse cx="${x - 75}" cy="${y + 50}" rx="22" ry="55" fill="${bodyColor}" transform="rotate(-15 ${x - 75} ${y + 50})"/>
        <ellipse cx="${x + 75}" cy="${y + 50}" rx="22" ry="55" fill="${bodyColor}" transform="rotate(15 ${x + 75} ${y + 50})"/>

        <!-- 다리 -->
        <ellipse cx="${x - 35}" cy="${y + 115}" rx="25" ry="55" fill="${bodyColor}"/>
        <ellipse cx="${x + 35}" cy="${y + 115}" rx="25" ry="55" fill="${bodyColor}"/>

        <!-- 발바닥 -->
        <ellipse cx="${x - 35}" cy="${y + 150}" rx="28" ry="18" fill="${belly}"/>
        <ellipse cx="${x + 35}" cy="${y + 150}" rx="28" ry="18" fill="${belly}"/>
      </g>
    `;
  }

  // 나비 캐릭터
  private createButterfly(x: number, y: number, palette: any, seed: number): string {
    const wingColor1 = palette.accent;
    const wingColor2 = this.lighten(wingColor1, 15);

    return `
      <!-- 나비 ${seed} -->
      <g id="butterfly-${seed}">
        <!-- 왼쪽 위 날개 -->
        <ellipse cx="${x - 25}" cy="${y - 20}" rx="35" ry="45" fill="${wingColor1}" opacity="0.8"/>
        <ellipse cx="${x - 25}" cy="${y - 20}" rx="25" ry="35" fill="${wingColor2}"/>
        <circle cx="${x - 25}" cy="${y - 15}" r="8" fill="#FFD700"/>

        <!-- 오른쪽 위 날개 -->
        <ellipse cx="${x + 25}" cy="${y - 20}" rx="35" ry="45" fill="${wingColor1}" opacity="0.8"/>
        <ellipse cx="${x + 25}" cy="${y - 20}" rx="25" ry="35" fill="${wingColor2}"/>
        <circle cx="${x + 25}" cy="${y - 15}" r="8" fill="#FFD700"/>

        <!-- 왼쪽 아래 날개 -->
        <ellipse cx="${x - 20}" cy="${y + 25}" rx="30" ry="40" fill="${wingColor1}" opacity="0.8"/>
        <ellipse cx="${x - 20}" cy="${y + 25}" rx="20" ry="30" fill="${wingColor2}"/>

        <!-- 오른쪽 아래 날개 -->
        <ellipse cx="${x + 20}" cy="${y + 25}" rx="30" ry="40" fill="${wingColor1}" opacity="0.8"/>
        <ellipse cx="${x + 20}" cy="${y + 25}" rx="20" ry="30" fill="${wingColor2}"/>

        <!-- 몸통 -->
        <ellipse cx="${x}" cy="${y}" rx="6" ry="35" fill="#000"/>

        <!-- 머리 -->
        <circle cx="${x}" cy="${y - 25}" r="8" fill="#000"/>

        <!-- 더듬이 -->
        <path d="M ${x - 3} ${y - 30} Q ${x - 8} ${y - 40} ${x - 10} ${y - 45}" stroke="#000" stroke-width="2" fill="none"/>
        <circle cx="${x - 10}" cy="${y - 45}" r="3" fill="#000"/>
        <path d="M ${x + 3} ${y - 30} Q ${x + 8} ${y - 40} ${x + 10} ${y - 45}" stroke="#000" stroke-width="2" fill="none"/>
        <circle cx="${x + 10}" cy="${y - 45}" r="3" fill="#000"/>
      </g>
    `;
  }

  private createForegroundElements(palette: any, sceneType: string): string {
    let elements = '';

    // 잔디 덤불
    for (let i = 0; i < 10; i++) {
      const x = i * 100 + (i * 23) % 50;
      const grassColor = this.darken(palette.ground, 20);
      elements += `<ellipse cx="${x}" cy="760" rx="40" ry="15" fill="${grassColor}" opacity="0.6"/>\n`;
    }

    return elements;
  }

  // 색상 조정 유틸리티
  private lighten(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  private darken(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  private adjustColor(color: string, amount: number): string {
    return amount > 0 ? this.lighten(color, amount) : this.darken(color, -amount);
  }
}
