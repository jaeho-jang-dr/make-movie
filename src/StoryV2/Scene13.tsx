import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

export const Scene13 = () => {
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
                    src={staticFile("images/v2/scene13-bg.svg")}
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
            <Audio src={staticFile("audio/v2/scene13.mp3")} />

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
                그때였다. 덤불 속에서 미세한 반짝임이 이슬이의 시선을 사로잡았다. 마치 그녀를 기다린 듯이.
            </div>
        </AbsoluteFill>
    );
};