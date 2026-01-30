import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile, spring } from 'remotion';

export const Scene2 = () => {
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
                        src={staticFile("assets/backgrounds/scene2.svg")}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            </div>

            {/* Character 1 - 민수 */}
            <Img
                src={staticFile("assets/characters/민수_앞모습_서있기.svg")}
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
                소리를 따라가던 민수는 덤불 속에서 지영이를 만났어요. 지영이는 '내 보물 지도를 훔친 도둑을 잡아야 해!'라며 민수를 끌어당겼죠. 민수는 망설였지만, 지영의 눈빛이 너무 강렬했어요.
            </div>

            {/* Audio */}
            <Audio src={staticFile("audio/v3/scene2.mp3")} />
        </AbsoluteFill>
    );
};
