import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

export const Scene8 = () => {
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
                    src={staticFile("images/v2/scene8-bg.svg")}
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
            

            {/* Narration Audio */}
            <Audio src={staticFile("audio/v2/scene8.mp3")} />

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
                어느덧 마을의 끄트머리, 거대한 나무들이 굳건히 서 있는 숲의 입구에 다다랐다. 숲은 고요한 침묵 속에 이슬이를 기다리는 듯했다.
            </div>
        </AbsoluteFill>
    );
};