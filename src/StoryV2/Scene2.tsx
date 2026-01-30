import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

export const Scene2 = () => {
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
                    src={staticFile("images/v2/scene2-bg.svg")}
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
            <Audio src={staticFile("audio/v2/scene2.mp3")} />

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
                이슬이는 늘 숲을 꿈꿨다. 책 속의 용감한 모험가들처럼, 자신도 언젠가 그 신비로운 미지의 심장 속으로 걸어 들어갈 수 있기를 소망했다.
            </div>
        </AbsoluteFill>
    );
};