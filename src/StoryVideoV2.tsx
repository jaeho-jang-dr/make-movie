import { AbsoluteFill, Sequence } from 'remotion';
import { Scene1 } from './StoryV2/Scene1';
import { Scene2 } from './StoryV2/Scene2';
import { Scene3 } from './StoryV2/Scene3';
import { Scene4 } from './StoryV2/Scene4';
import { Scene5 } from './StoryV2/Scene5';
import { Scene6 } from './StoryV2/Scene6';
import { Scene7 } from './StoryV2/Scene7';
import { Scene8 } from './StoryV2/Scene8';
import { Scene9 } from './StoryV2/Scene9';
import { Scene10 } from './StoryV2/Scene10';
import { Scene11 } from './StoryV2/Scene11';
import { Scene12 } from './StoryV2/Scene12';
import { Scene13 } from './StoryV2/Scene13';
import { Scene14 } from './StoryV2/Scene14';
import { Scene15 } from './StoryV2/Scene15';
import { Scene16 } from './StoryV2/Scene16';
import { Scene17 } from './StoryV2/Scene17';
import { Scene18 } from './StoryV2/Scene18';
import { Scene19 } from './StoryV2/Scene19';
import { Scene20 } from './StoryV2/Scene20';

export const StoryVideoV2 = () => {
    return (
        <AbsoluteFill>
            <Sequence from={0} durationInFrames={360}><Scene1 /></Sequence>
<Sequence from={360} durationInFrames={300}><Scene2 /></Sequence>
<Sequence from={660} durationInFrames={240}><Scene3 /></Sequence>
<Sequence from={900} durationInFrames={210}><Scene4 /></Sequence>
<Sequence from={1110} durationInFrames={270}><Scene5 /></Sequence>
<Sequence from={1380} durationInFrames={240}><Scene6 /></Sequence>
<Sequence from={1620} durationInFrames={300}><Scene7 /></Sequence>
<Sequence from={1920} durationInFrames={360}><Scene8 /></Sequence>
<Sequence from={2280} durationInFrames={270}><Scene9 /></Sequence>
<Sequence from={2550} durationInFrames={330}><Scene10 /></Sequence>
<Sequence from={2880} durationInFrames={300}><Scene11 /></Sequence>
<Sequence from={3180} durationInFrames={270}><Scene12 /></Sequence>
<Sequence from={3450} durationInFrames={240}><Scene13 /></Sequence>
<Sequence from={3690} durationInFrames={300}><Scene14 /></Sequence>
<Sequence from={3990} durationInFrames={360}><Scene15 /></Sequence>
<Sequence from={4350} durationInFrames={390}><Scene16 /></Sequence>
<Sequence from={4740} durationInFrames={330}><Scene17 /></Sequence>
<Sequence from={5070} durationInFrames={300}><Scene18 /></Sequence>
<Sequence from={5370} durationInFrames={330}><Scene19 /></Sequence>
<Sequence from={5700} durationInFrames={420}><Scene20 /></Sequence>
        </AbsoluteFill>
    );
};