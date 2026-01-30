import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile, spring } from 'remotion';

export const Scene1 = () => {
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
                        src={staticFile("assets/backgrounds/scene1.svg")}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            </div>

            {/* Background Props */}
            

            {/* Characters + Props */}
            
            {/* 민수 */}
            <Img
                src={staticFile("assets/characters/민수_앞모습_서있기.svg")}
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
            
            {/* 빨간_야구모자 */}
            <Img
                src={staticFile("assets/props/빨간_야구모자.svg")}
                style={{
                    position: 'absolute',
                    bottom: 200,
                    left: interpolate(
                        spring({ frame, fps: 30, config: { damping: 20 } }),
                        [0, 1],
                        [-200, 200]
                    ),
                    width: 80,
                    height: 80,
                    objectFit: 'contain',
                    opacity: frame > 30 ? 1 : 0
                }}
            />
            {/* 작은_배낭 */}
            <Img
                src={staticFile("assets/props/작은_배낭.svg")}
                style={{
                    position: 'absolute',
                    bottom: 200,
                    left: interpolate(
                        spring({ frame, fps: 30, config: { damping: 20 } }),
                        [0, 1],
                        [-200, 100]
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
                민수는 작은 마을에서 늘 혼자 놀곤 했어요. 친구가 없어서 외로웠지만, 누군가와 함께하는 게 무서웠죠. 어느 날, 민수는 뒷산에서 이상한 소리를 들었어요.
            </div>

            {/* Audio */}
            <Audio src={staticFile("audio/v3/scene1.mp3")} />
        </AbsoluteFill>
    );
};
