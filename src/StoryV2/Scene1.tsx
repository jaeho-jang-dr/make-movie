import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

export const Scene1 = () => {
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
                    src={staticFile("images/v2/scene1-bg.svg")}
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
            <Audio src={staticFile("audio/v2/scene1.mp3")} />

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
                마을의 고요함 속에, 작은 창문 너머로 숲의 실루엣이 아스라이 펼쳐져 있었다. 언제나 그곳은 이슬이의 상상 속 놀이터이자 미지의 세계였다.
            </div>
        </AbsoluteFill>
    );
};