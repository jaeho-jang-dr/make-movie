import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, spring, staticFile } from 'remotion';

export const Scene28 = () => {
  const frame = useCurrentFrame();

  // 씬 전체 Fade In/Out
  const sceneOpacity = interpolate(
    frame,
    [0, 30, 270, 300],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Ken Burns Effect - 배경 확대
  const bgScale = interpolate(
    frame,
    [0, 300],
    [1, 1.12],
    { extrapolateRight: 'clamp' }
  );

  // 텍스트 타이핑 효과
  const textReveal = interpolate(
    frame,
    [30, 120],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const narrationText = "이것은 28번째 장면입니다. 옛날 옛적에 멋진 모험이 있었어요.";
  const visibleText = narrationText.substring(0, Math.floor(textReveal * narrationText.length));

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* 배경 레이어 */}
      <div style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'absolute'
      }}>
        <Img
          src={staticFile("images/scene28-background.svg")}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = staticFile("images/scene28-background.png");
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${bgScale})`,
            filter: 'brightness(0.95) contrast(1.05)'
          }}
        />
      </div>

      
      {/* 캐릭터 1 - Spring Animation */}
      <Img
          src={staticFile("images/scene28-character-0.svg")}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = staticFile("images/scene28-character-0.png");
        }}
        style={{
          position: 'absolute',
          left: 100,
          bottom: interpolate(
            spring({
              frame: frame - 30,
              fps: 30,
              config: { damping: 12, stiffness: 80, mass: 0.8 }
            }),
            [0, 1],
            [-200, 150]
          ),
          width: 300,
          height: 300,
          objectFit: 'contain',
          opacity: interpolate(
            frame,
            [30, 60],
            [0, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          ),
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
          transform: `scale(${interpolate(
            frame,
            [30, 60],
            [0.7, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          )})`
        }}
      />

      {/* 나레이션 텍스트 - 타이핑 효과 */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: 100,
          right: 100,
          textAlign: 'center',
          fontSize: 52,
          fontWeight: 'bold',
          color: 'white',
          textShadow: '4px 4px 12px rgba(0,0,0,0.9)',
          padding: '40px',
          fontFamily: "'Noto Sans KR', sans-serif",
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderRadius: '30px',
          lineHeight: 1.6,
          backdropFilter: 'blur(10px)'
        }}
      >
        {visibleText}
      </div>

      {/* 오디오 */}
      <Audio src={staticFile("audio/scene28-narration.mp3")} />
    </AbsoluteFill>
  );
};
