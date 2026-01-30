import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile, spring } from 'remotion';

export const Scene2 = () => {
    const frame = useCurrentFrame();
    const duration = 435;

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
                        src={staticFile("assets/backgrounds/scene2.svg")}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            </div>

            {/* Background Props */}
            

            {/* Characters + Props */}
            
            {/* 민수 */}
            <Img
                src={staticFile("assets/characters/민수_삼사분면_겁먹음.svg")}
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
                src={staticFile("assets/characters/지영_앞모습_서있기.svg")}
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
            
            {/* 보물_지도 */}
            <Img
                src={staticFile("assets/props/보물_지도.svg")}
                style={{
                    position: 'absolute',
                    bottom: 200,
                    left: interpolate(
                        spring({ frame, fps: 30, config: { damping: 20 } }),
                        [0, 1],
                        [-200, 250]
                    ),
                    width: 80,
                    height: 80,
                    objectFit: 'contain',
                    opacity: frame > 30 ? 1 : 0
                }}
            />
            {/* 초록_운동화 */}
            <Img
                src={staticFile("assets/props/초록_운동화.svg")}
                style={{
                    position: 'absolute',
                    bottom: 200,
                    left: interpolate(
                        spring({ frame, fps: 30, config: { damping: 20 } }),
                        [0, 1],
                        [-200, 350]
                    ),
                    width: 80,
                    height: 80,
                    objectFit: 'contain',
                    opacity: frame > 30 ? 1 : 0
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
                소리를 따라가던 민수는 덤불 속에서 지영이를 만났어요. 지영이는 '내 보물 지도를 훔친 도둑을 잡아야 해!'라며 민수를 끌어당겼죠. 민수는 망설였지만, 지영의 눈빛이 너무 강렬했어요.
            </div>

            {/* Audio */}
            <Audio src={staticFile("audio/v3/scene2.mp3")} />
        </AbsoluteFill>
    );
};
