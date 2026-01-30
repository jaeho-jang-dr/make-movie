import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

export const Scene14 = () => {
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
                    src={staticFile("images/v2/scene14-bg.svg")}
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
                src={staticFile("images/v2/scene14-이슬이.svg")}
                style={{
                    position: 'absolute',
                    bottom: 100,
                    left: 200, // simple positioning
                    width: 400,
                    height: 400,
                    transform: `translateY(0px)`
                }}
            />

            {/* Narration Audio */}
            <Audio src={staticFile("audio/v2/scene14.mp3")} />

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
                호기심에 이끌려 조심스럽게 다가갔다. 평범한 솔방울이 아님을 직감했다.
            </div>
        </AbsoluteFill>
    );
};