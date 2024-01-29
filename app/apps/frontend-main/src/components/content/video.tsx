import { FC } from 'react';
import ReactPlayer from 'react-player';
import { Post } from '@fans/types';
import _ from 'lodash';

interface Props {
  data: Post;
}

const ContentVideo: FC<Props> = ({ data }: Props) => {
  const cdn = _.get(window, 'cdn.value', '');

  return <div className="w-full">
    {data.content.video.length === 1 && <ReactPlayer
      url={`${cdn}/${_.get(data, 'content.video[0][3].file')}`}
      width="100%"
      height="200px"
      muted={true}
      loop={false}
      playing={false}
      light={`${cdn}/${_.get(data, 'content.video[0][3].file')}`}
      controls={ true }
    />}

    {data.content.video.length === 2 && <div className="grid grid-cols-2 gap-1">
      {data.content.video.map(item => <ReactPlayer
        key={_.get(item, '[0].mediaUuid')}
        url={`${cdn}/${_.get(item, '[3].file')}`}
        width="100%"
        height="200px"
        muted={true}
        loop={false}
        playing={false}
        light={`${cdn}/${_.get(item, '[3].file')}`}
        controls={ true }
      />)}
    </div>}

    {data.content.video.length >= 3 && <div className="grid grid-cols-2 gap-1">
      <div className="col-span-2">
        <ReactPlayer
          url={`${cdn}/${_.get(data, 'content.video[0][3].file')}`}
          width="100%"
          height="200px"
          muted={true}
          loop={false}
          playing={false}
          light={`${cdn}/${_.get(data, 'content.video[0][3].file')}`}
          controls={ true }
        />
      </div>

      {data.content.video.slice(1).map(item => <ReactPlayer
        key={_.get(item, '[0].mediaUuid')}
        url={`${cdn}/${_.get(item, '[3].file')}`}
        width="100%"
        height="200px"
        muted={true}
        loop={false}
        playing={false}
        light={`${cdn}/${_.get(item, '[3].file')}`}
        controls={ true }
      />)}
    </div>}
  </div>;
};

export default ContentVideo;

