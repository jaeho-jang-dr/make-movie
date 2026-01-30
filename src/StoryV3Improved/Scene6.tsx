import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile, spring } from 'remotion';

export const Scene6 = () => {
    const frame = useCurrentFrame();
    const duration = 405;

    // 씬 완전히 재생 후 페이드아웃 (마지막 10프레임만)
    const opacity = interpolate(
        frame,
        [0, 15, duration - 10, duration],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Background
    const bgScale = interpolate(frame, [0, duration], [1, 1.08]);
    const bgX = interpolate(frame, [0, duration], [0, -30]);

    return (
        <AbsoluteFill style={{ opacity }}>
            {/* Background */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
                <div style={{ transform: `scale(${bgScale}) translateX(${bgX}px)`, width: '100%', height: '100%' }}>
                    <Img
                        src={staticFile("assets/backgrounds/scene6.svg")}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            </div>

            {/* Background Props */}
            

            {/* Characters + Props */}
            
            {/* 민수 */}
            <Img
                src={staticFile("assets/characters/민수_뒷모습_달리기.svg")}
                style={{
                    position: 'absolute',
                    bottom: 100,
                    left: interpolate(
                        spring({ frame, fps: 30, config: { damping: 20 } }),
                        [0, 1],
                        [-200, 150]
                    ),
                    width: 300,
                    height: 400,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                }}
            />
            
            {/* 지영 */}
            <Img
                src={staticFile("assets/characters/지영_뒷모습_달리기.svg")}
                style={{
                    position: 'absolute',
                    bottom: 100,
                    left: interpolate(
                        spring({ frame, fps: 30, config: { damping: 20 } }),
                        [0, 1],
                        [-200, 300]
                    ),
                    width: 300,
                    height: 400,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                }}
            />
            
            {/* 깜깜이 */}
            <Img
                src={staticFile("assets/characters/kkamkkam/깜깜이_뒷모습_점프.svg")}
                style={{
                    position: 'absolute',
                    bottom: 200,
                    left: interpolate(
                        spring({ frame, fps: 30, config: { damping: 20 } }),
                        [0, 1],
                        [-200, 450]
                    ),
                    width: 200,
                    height: 200,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                }}
            />
            

            {/* Subtitle */}
            <div style={{
                position: 'absolute',
                bottom: 50,
                left: '10%',
                right: '10%',
                textAlign: 'center',
                fontSize: 26,
                fontWeight: '600',
                color: 'white',
                textShadow: '3px 3px 8px rgba(0,0,0,1), -1px -1px 4px rgba(0,0,0,0.9)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: '12px 20px',
                borderRadius: '10px',
                fontFamily: "'Noto Sans KR', sans-serif",
                lineHeight: 1.6,
                backdropFilter: 'blur(4px)',
                opacity: interpolate(frame, [10, 20, duration - 20, duration - 10], [0, 1, 1, 0])
            }}>
                아이들은 거미줄을 뚫고 나왔지만, 갑자기 바닥이 흔들리며 함정이 발동했어요! 지영이가 민수의 손을 잡고 '점프!'라고 외쳤고, 둘은 가까스로 함정을 피했죠.
            </div>

            {/* Audio */}
            <Audio src={staticFile("audio/v3/scene6.mp3")} />
        </AbsoluteFill>
    );
};
