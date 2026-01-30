import { Composition, Sequence, AbsoluteFill } from 'remotion';
import { Scene1 } from './StoryV3Improved/Scene1';
import { Scene2 } from './StoryV3Improved/Scene2';
import { Scene3 } from './StoryV3Improved/Scene3';
import { Scene4 } from './StoryV3Improved/Scene4';
import { Scene5 } from './StoryV3Improved/Scene5';
import { Scene6 } from './StoryV3Improved/Scene6';
import { Scene7 } from './StoryV3Improved/Scene7';
import { Scene8 } from './StoryV3Improved/Scene8';
import { Scene9 } from './StoryV3Improved/Scene9';
import { Scene10 } from './StoryV3Improved/Scene10';

export const StoryVideoV3Improved = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence from={0} durationInFrames={405}>
        <Scene1 />
      </Sequence>
      <Sequence from={435} durationInFrames={435}>
        <Scene2 />
      </Sequence>
      <Sequence from={900} durationInFrames={405}>
        <Scene3 />
      </Sequence>
      <Sequence from={1335} durationInFrames={405}>
        <Scene4 />
      </Sequence>
      <Sequence from={1770} durationInFrames={375}>
        <Scene5 />
      </Sequence>
      <Sequence from={2175} durationInFrames={405}>
        <Scene6 />
      </Sequence>
      <Sequence from={2610} durationInFrames={405}>
        <Scene7 />
      </Sequence>
      <Sequence from={3045} durationInFrames={465}>
        <Scene8 />
      </Sequence>
      <Sequence from={3540} durationInFrames={375}>
        <Scene9 />
      </Sequence>
      <Sequence from={3945} durationInFrames={375}>
        <Scene10 />
      </Sequence>
        </AbsoluteFill>
    );
};

export const RemotionRootV3Improved = () => (
    <Composition
        id="StoryVideoV3Improved"
        component={StoryVideoV3Improved}
        durationInFrames={4320}
        fps={30}
        width={1920}
        height={1080}
    />
);
