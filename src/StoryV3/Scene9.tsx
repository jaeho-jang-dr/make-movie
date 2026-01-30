import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

export const Scene9 = () => {
    const frame = useCurrentFrame();
    const duration = 300; // 10 sec default

    // Dynamic Camera Pan
    const x = interpolate(frame, [0, duration], [0, -50]);
    
    return (
        <AbsoluteFill>
            <div style={{ transform: `translateX(${x}px) scale(1.1)`, width: '100%', height: '100%' }}>
                <Img src={staticFile("images/v3/scene9-bg.svg")} style={{ width: '100%', height: '100%' }} />
            </div>
            <Img 
                src={staticFile("images/v3/scene9-char.svg")} 
                style={{ 
                    position: 'absolute', bottom: 50, left: 100, width: 400,
                    transform: `translateY(${Math.sin(frame/10)*10}px)` 
                }} 
            />
            <Audio src={staticFile("audio/v3/scene9.mp3")} />
            <div style={{ 
                position: 'absolute', bottom: 20, left: 0, width: '100%', 
                textAlign: 'center', fontSize: 40, color: 'white', 
                textShadow: '2px 2px 4px black',
                background: 'rgba(0,0,0,0.5)', padding: 20
            }}>
                민수가 용기를 내어 말했다. '우린 친구예요. 당신을 해치지 않아요. 같이 이야기할 수 있을까요?' 개구리 로봇은 잠시 멈추더니 고개를 끄덕였다.
            </div>
        </AbsoluteFill>
    );
};