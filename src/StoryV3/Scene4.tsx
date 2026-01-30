import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

export const Scene4 = () => {
    const frame = useCurrentFrame();
    const duration = 300; // 10 sec default

    // Dynamic Camera Pan
    const x = interpolate(frame, [0, duration], [0, -50]);
    
    return (
        <AbsoluteFill>
            <div style={{ transform: `translateX(${x}px) scale(1.1)`, width: '100%', height: '100%' }}>
                <Img src={staticFile("images/v3/scene4-bg.svg")} style={{ width: '100%', height: '100%' }} />
            </div>
            <Img 
                src={staticFile("images/v3/scene4-char.svg")} 
                style={{ 
                    position: 'absolute', bottom: 50, left: 100, width: 400,
                    transform: `translateY(${Math.sin(frame/10)*10}px)` 
                }} 
            />
            <Audio src={staticFile("audio/v3/scene4.mp3")} />
            <div style={{ 
                position: 'absolute', bottom: 20, left: 0, width: '100%', 
                textAlign: 'center', fontSize: 40, color: 'white', 
                textShadow: '2px 2px 4px black',
                background: 'rgba(0,0,0,0.5)', padding: 20
            }}>
                지연이가 손을 내밀며 말했다. '같이 가보자, 민수야. 무서워도 친구가 있으니까 괜찮아!' 두 친구는 손을 잡고 숲으로 첫걸음을 내디뎠다.
            </div>
        </AbsoluteFill>
    );
};