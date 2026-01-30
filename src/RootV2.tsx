import { Composition } from 'remotion';
import { StoryVideoV2 } from './StoryVideoV2';

export const RemotionRootV2 = () => {
    return (
        <Composition
            id="StoryVideoV2"
            component={StoryVideoV2}
            durationInFrames={6120}
            fps={30}
            width={1920}
            height={1080}
        />
    );
};