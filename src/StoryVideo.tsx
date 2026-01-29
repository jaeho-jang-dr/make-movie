import { AbsoluteFill, Sequence, Audio } from 'remotion';
import { Scene1 } from './Story/Scene1';
import { Scene2 } from './Story/Scene2';
import { Scene3 } from './Story/Scene3';
import { Scene4 } from './Story/Scene4';
import { Scene5 } from './Story/Scene5';

export const StoryVideo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a2e' }}>
      <Sequence from={0} durationInFrames={300}>
        <Scene1 />
      </Sequence>
      <Sequence from={300} durationInFrames={300}>
        <Scene2 />
      </Sequence>
      <Sequence from={600} durationInFrames={300}>
        <Scene3 />
      </Sequence>
      <Sequence from={900} durationInFrames={300}>
        <Scene4 />
      </Sequence>
      <Sequence from={1200} durationInFrames={300}>
        <Scene5 />
      </Sequence>
    </AbsoluteFill>
  );
};
