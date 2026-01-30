import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

export const Scene1 = () => {
    const frame = useCurrentFrame();
    const duration = 300; // 10 sec default

    // Dynamic Camera Pan
    const x = interpolate(frame, [0, duration], [0, -50]);
    
    return (
        <AbsoluteFill>
            <div style={{ transform: `translateX(${x}px) scale(1.1)`, width: '100%', height: '100%' }}>
                <Img src={staticFile("images/v3/scene1-bg.svg")} style={{ width: '100%', height: '100%' }} />
            </div>
            <Img 
                src={staticFile("images/v3/scene1-char.svg")} 
                style={{ 
                    position: 'absolute', bottom: 50, left: 100, width: 400,
                    transform: `translateY(${Math.sin(frame/10)*10}px)` 
                }} 
            />
            <Audio src={staticFile("audio/v3/scene1.mp3")} />
            <div style={{ 
                position: 'absolute', bottom: 20, left: 0, width: '100%', 
                textAlign: 'center', fontSize: 40, color: 'white', 
                textShadow: '2px 2px 4px black',
                background: 'rgba(0,0,0,0.5)', padding: 20
            }}>
                민수와 지연이는 작은 마을 외곽에 있는 신비한 숲을 바라보며 서 있었다. 숲은 어두웠고, 이상한 소리가 들려왔다. '저 안에 뭐가 있을까?' 민수가 중얼거렸다.
            </div>
        </AbsoluteFill>
    );
};