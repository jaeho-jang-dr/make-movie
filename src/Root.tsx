import { Composition } from 'remotion';
import { StoryVideo } from './StoryVideo';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="StoryVideo"
        component={StoryVideo}
        durationInFrames={18000}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
