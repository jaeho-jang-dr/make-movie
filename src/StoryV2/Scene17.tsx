import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

export const Scene17 = () => {
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
                    src={staticFile("images/v2/scene17-bg.svg")}
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
                src={staticFile("images/v2/scene17-이슬이.svg")}
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
                src={staticFile("images/v2/scene17-솔방울.svg")}
                style={{
                    position: 'absolute',
                    bottom: 100,
                    left: 600, // simple positioning
                    width: 400,
                    height: 400,
                    transform: `translateY(0px)`
                }}
            />

            {/* Narration Audio */}
            <Audio src={staticFile("audio/v2/scene17.mp3")} />

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
                “안녕, 이슬아! 드디어 만났네! 나는 솔방울이야. 숲의 길을 안내하는 자지.” 솔방울은 방울방울 울리는 목소리로 자신을 소개했다.
            </div>
        </AbsoluteFill>
    );
};