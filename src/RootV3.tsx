import { Composition, Sequence } from 'remotion';
import { Scene1 } from './StoryV3/Scene1';
import { Scene2 } from './StoryV3/Scene2';
import { Scene3 } from './StoryV3/Scene3';
import { Scene4 } from './StoryV3/Scene4';
import { Scene5 } from './StoryV3/Scene5';
import { Scene6 } from './StoryV3/Scene6';
import { Scene7 } from './StoryV3/Scene7';
import { Scene8 } from './StoryV3/Scene8';
import { Scene9 } from './StoryV3/Scene9';
import { Scene10 } from './StoryV3/Scene10';

export const StoryVideoV3 = () => (
    <>
        <Sequence from={0} durationInFrames={300}><Scene1 /></Sequence>
<Sequence from={300} durationInFrames={300}><Scene2 /></Sequence>
<Sequence from={600} durationInFrames={300}><Scene3 /></Sequence>
<Sequence from={900} durationInFrames={300}><Scene4 /></Sequence>
<Sequence from={1200} durationInFrames={300}><Scene5 /></Sequence>
<Sequence from={1500} durationInFrames={300}><Scene6 /></Sequence>
<Sequence from={1800} durationInFrames={300}><Scene7 /></Sequence>
<Sequence from={2100} durationInFrames={300}><Scene8 /></Sequence>
<Sequence from={2400} durationInFrames={300}><Scene9 /></Sequence>
<Sequence from={2700} durationInFrames={300}><Scene10 /></Sequence>
    </>
);

export const RemotionRootV3 = () => (
    <Composition
        id="StoryVideoV3"
        component={StoryVideoV3}
        durationInFrames={3000}
        fps={30}
        width={1920}
        height={1080}
    />
);