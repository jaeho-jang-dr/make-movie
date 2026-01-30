import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

export const Scene18 = () => {
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
                    src={staticFile("images/v2/scene18-bg.svg")}
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
                src={staticFile("images/v2/scene18-이슬이.svg")}
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
                src={staticFile("images/v2/scene18-솔방울.svg")}
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
                src={staticFile("images/v2/scene18-반딧.svg")}
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
            <Audio src={staticFile("audio/v2/scene18.mp3")} />

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
                이때, 솔방울의 빛에 이끌린 듯, 반딧불이 하나가 솔방울 주위를 맴돌았다. 이슬이의 눈이 더욱 커졌다.
            </div>
        </AbsoluteFill>
    );
};