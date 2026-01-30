import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile, spring } from 'remotion';

export const Scene9 = () => {
    const frame = useCurrentFrame();
    const duration = 450;

    // Scene fade in/out (씬 끝까지 완전히 보이고, 마지막에만 fade out)
    const opacity = interpolate(
        frame,
        [0, 20, duration - 20, duration],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Background slow zoom (Ken Burns effect)
    const bgScale = interpolate(frame, [0, duration], [1, 1.1]);
    const bgX = interpolate(frame, [0, duration], [0, -50]);

    // Character 1 walks in from left
    const char1X = interpolate(
        spring({ frame, fps: 30, config: { damping: 20 } }),
        [0, 1],
        [-200, 100]
    );

    // Character 2 enters later
    const char2Delay = 60;
    const char2X = interpolate(
        spring({ frame: frame - char2Delay, fps: 30, config: { damping: 20 } }),
        [0, 1],
        [-200, 400]
    );

    return (
        <AbsoluteFill style={{ opacity }}>
            {/* Background Layer */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                overflow: 'hidden'
            }}>
                <div style={{
                    transform: `scale(${bgScale}) translateX(${bgX}px)`,
                    width: '100%',
                    height: '100%'
                }}>
                    <Img
                        src={staticFile("assets/backgrounds/scene9.svg")}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            </div>

            {/* Character 1 - 민수 */}
            <Img
                src={staticFile("assets/characters/민수_앞모습_겁먹음.svg")}
                style={{
                    position: 'absolute',
                    bottom: 100,
                    left: char1X,
                    width: 300,
                    height: 400,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                }}
            />

            
            {/* Character 2 - 지영 */}
            <Img
                src={staticFile("assets/characters/민수_옆모습_걷기.svg")}
                style={{
                    position: 'absolute',
                    bottom: 100,
                    left: char2X,
                    width: 300,
                    height: 400,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                    opacity: frame > char2Delay ? 1 : 0
                }}
            />

            {/* Narration Subtitle - 작고 투명하게 */}
            <div style={{
                position: 'absolute',
                bottom: 40,
                left: '10%',
                right: '10%',
                textAlign: 'center',
                fontSize: 28,
                fontWeight: '600',
                color: 'white',
                textShadow: '2px 2px 6px rgba(0,0,0,1), -1px -1px 3px rgba(0,0,0,0.8)',
                backgroundColor: 'rgba(0,0,0,0.15)',
                padding: '15px 25px',
                borderRadius: '12px',
                fontFamily: "'Noto Sans KR', sans-serif",
                lineHeight: 1.5,
                backdropFilter: 'blur(3px)'
            }}>
                동굴을 빠져나오며 민수는 더 이상 혼자가 아니라는 걸 느꼈어요. 지영이와 함께라면 어떤 무서운 것도 이겨낼 수 있을 것 같았죠. 깜깜이는 미소를 지으며 사라졌어요.
            </div>

            {/* Audio */}
            <Audio src={staticFile("audio/v3/scene9.mp3")} />
        </AbsoluteFill>
    );
};
