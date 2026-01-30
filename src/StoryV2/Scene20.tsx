import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

export const Scene20 = () => {
    const frame = useCurrentFrame();
    
    return (
        <AbsoluteFill>
            {/* Background Layer with Camera Move */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                transform: `scale(1)`,
                transformOrigin: 'center center'
            }}>
                <Img 
                    src={staticFile("images/v2/scene20-bg.svg")}
                    style={{
                        width: '110%', // slightly larger for panning
                        height: '110%',
                        objectFit: 'cover',
                        left: '-5%',
                        top: '-5%'
                    }}
                />
            </div>

            {/* Characters Layer */}
            
            <Img
                src={staticFile("images/v2/scene20-이슬이.svg")}
                style={{
                    position: 'absolute',
                    bottom: 100,
                    left: 200, // simple positioning
                    width: 400,
                    height: 400,
                    transform: `translateY(0px)`
                }}
            />

            <Img
                src={staticFile("images/v2/scene20-솔방울.svg")}
                style={{
                    position: 'absolute',
                    bottom: 100,
                    left: 600, // simple positioning
                    width: 400,
                    height: 400,
                    transform: `translateY(0px)`
                }}
            />

            <Img
                src={staticFile("images/v2/scene20-반딧.svg")}
                style={{
                    position: 'absolute',
                    bottom: 100,
                    left: 1000, // simple positioning
                    width: 400,
                    height: 400,
                    transform: `translateY(0px)`
                }}
            />

            {/* Narration Audio */}
            <Audio src={staticFile("audio/v2/scene20.mp3")} />

            {/* Subtitles (Simple) */}
            <div style={{
                position: 'absolute',
                bottom: 50,
                width: '100%',
                textAlign: 'center',
                color: 'white',
                fontSize: 40,
                textShadow: '2px 2px 4px black',
                padding: 20,
                backgroundColor: 'rgba(0,0,0,0.4)'
            }}>
                세 명의 새로운 친구들은 숲의 더욱 깊은 곳으로 향했다. 반딧불이의 희미한 빛이 앞길을 밝히고, 솔방울의 작은 몸이 이슬이의 손안에서 따스하게 빛났다. 모험은 이제 막 시작되었다.
            </div>
        </AbsoluteFill>
    );
};