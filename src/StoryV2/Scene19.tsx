import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

export const Scene19 = () => {
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
                    src={staticFile("images/v2/scene19-bg.svg")}
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
                src={staticFile("images/v2/scene19-이슬이.svg")}
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
                src={staticFile("images/v2/scene19-솔방울.svg")}
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
                src={staticFile("images/v2/scene19-반딧.svg")}
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
            <Audio src={staticFile("audio/v2/scene19.mp3")} />

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
                “오, 반딧! 너도 왔구나! 이슬이를 신비한 숲의 중심까지 안내해야 해!” 솔방울이 반딧불이에게 즐겁게 외쳤다. 반딧불이는 솔방울 주위를 한 바퀴 돌며 인사를 건넸다.
            </div>
        </AbsoluteFill>
    );
};