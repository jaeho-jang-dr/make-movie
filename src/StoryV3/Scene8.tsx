import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

export const Scene8 = () => {
    const frame = useCurrentFrame();
    const duration = 300; // 10 sec default

    // Dynamic Camera Pan
    const x = interpolate(frame, [0, duration], [0, -50]);
    
    return (
        <AbsoluteFill>
            <div style={{ transform: `translateX(${x}px) scale(1.1)`, width: '100%', height: '100%' }}>
                <Img src={staticFile("images/v3/scene8-bg.svg")} style={{ width: '100%', height: '100%' }} />
            </div>
            <Img 
                src={staticFile("images/v3/scene8-char.svg")} 
                style={{ 
                    position: 'absolute', bottom: 50, left: 100, width: 400,
                    transform: `translateY(${Math.sin(frame/10)*10}px)` 
                }} 
            />
            <Audio src={staticFile("audio/v3/scene8.mp3")} />
            <div style={{ 
                position: 'absolute', bottom: 20, left: 0, width: '100%', 
                textAlign: 'center', fontSize: 40, color: 'white', 
                textShadow: '2px 2px 4px black',
                background: 'rgba(0,0,0,0.5)', padding: 20
            }}>
                개구리 로봇이 으르렁거렸다. '누가 내 보물을 훔치러 왔나!' 민수와 지연이는 겁에 질렸지만, 지연이가 외쳤다. '우린 그냥 궁금했을 뿐이에요!'
            </div>
        </AbsoluteFill>
    );
};