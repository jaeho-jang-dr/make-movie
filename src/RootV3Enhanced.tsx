import { Composition, Sequence, AbsoluteFill } from 'remotion';
import { Scene1 } from './StoryV3Enhanced/Scene1';
import { Scene2 } from './StoryV3Enhanced/Scene2';
import { Scene3 } from './StoryV3Enhanced/Scene3';
import { Scene4 } from './StoryV3Enhanced/Scene4';
import { Scene5 } from './StoryV3Enhanced/Scene5';
import { Scene6 } from './StoryV3Enhanced/Scene6';
import { Scene7 } from './StoryV3Enhanced/Scene7';
import { Scene8 } from './StoryV3Enhanced/Scene8';
import { Scene9 } from './StoryV3Enhanced/Scene9';
import { Scene10 } from './StoryV3Enhanced/Scene10';

export const StoryVideoV3Enhanced = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence from={0} durationInFrames={450}>
        <Scene1 />
      </Sequence>
      <Sequence from={480} durationInFrames={450}>
        <Scene2 />
      </Sequence>
      <Sequence from={960} durationInFrames={450}>
        <Scene3 />
      </Sequence>
      <Sequence from={1440} durationInFrames={450}>
        <Scene4 />
      </Sequence>
      <Sequence from={1920} durationInFrames={450}>
        <Scene5 />
      </Sequence>
      <Sequence from={2400} durationInFrames={450}>
        <Scene6 />
      </Sequence>
      <Sequence from={2880} durationInFrames={450}>
        <Scene7 />
      </Sequence>
      <Sequence from={3360} durationInFrames={450}>
        <Scene8 />
      </Sequence>
      <Sequence from={3840} durationInFrames={450}>
        <Scene9 />
      </Sequence>
      <Sequence from={4320} durationInFrames={450}>
        <Scene10 />
      </Sequence>
        </AbsoluteFill>
    );
};

export const RemotionRootV3Enhanced = () => (
    <Composition
        id="StoryVideoV3Enhanced"
        component={StoryVideoV3Enhanced}
        durationInFrames={4770}
        fps={30}
        width={1920}
        height={1080}
    />
);
