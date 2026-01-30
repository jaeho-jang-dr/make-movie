import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

export const Scene2 = () => {
    const frame = useCurrentFrame();
    const duration = 300; // 10 sec default

    // Dynamic Camera Pan
    const x = interpolate(frame, [0, duration], [0, -50]);
    
    return (
        <AbsoluteFill>
            <div style={{ transform: `translateX(${x}px) scale(1.1)`, width: '100%', height: '100%' }}>
                <Img src={staticFile("images/v3/scene2-bg.svg")} style={{ width: '100%', height: '100%' }} />
            </div>
            <Img 
                src={staticFile("images/v3/scene2-char.svg")} 
                style={{ 
                    position: 'absolute', bottom: 50, left: 100, width: 400,
                    transform: `translateY(${Math.sin(frame/10)*10}px)` 
                }} 
            />
            <Audio src={staticFile("audio/v3/scene2.mp3")} />
            <div style={{ 
                position: 'absolute', bottom: 20, left: 0, width: '100%', 
                textAlign: 'center', fontSize: 40, color: 'white', 
                textShadow: '2px 2px 4px black',
                background: 'rgba(0,0,0,0.5)', padding: 20
            }}>
                지연이가 웃으며 말했다. '아마 유니콘 로봇이 있을지도! 아니면 춤추는 나무?' 둘은 깔깔 웃었지만, 숲 안으로 들어갈 용기가 나지 않았다.
            </div>
        </AbsoluteFill>
    );
};