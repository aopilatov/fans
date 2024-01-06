import { FC } from 'react';
import ReactPlayer from 'react-player';
import { Post } from '@fans/types';

interface Props {
  data: Post;
}

const ContentVideo: FC<Props> = ({ data }: Props) => {
  return <div className="w-full">
    <ReactPlayer
      url={data.content.video[0]}
      width="100%"
      height="200px"
      muted={true}
      loop={false}
      playing={false}
      light={data.content.image[0]}
      controls={ true }
    />
  </div>;
};

export default ContentVideo;

