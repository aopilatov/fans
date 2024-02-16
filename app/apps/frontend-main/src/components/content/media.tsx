import { FC } from 'react';
import ReactPlayer from 'react-player';
import { Media } from '@fans/types';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import _ from 'lodash';
import 'react-photo-view/dist/react-photo-view.css';

interface Props {
  data: Media;
  creator?: boolean;
  zoomable?: boolean;
}

const ContentMedia: FC<Props> = ({ data, creator, zoomable }: Props) => {
  if (data && data.type === 'image') {
    if (creator) {
      return <img
        src={data?.none200}
        className="w-full"
        alt="photo"
      />;
    }

    if (!data?.none200) {
      return <img
        src={data?.blur200}
        className="w-full"
        alt="photo"
      />;
    }

    if (zoomable) {
      return <PhotoProvider>
        <PhotoView src={data.origin}>
          <img
            src={data.none200}
            className="w-full"
            alt="photo"
          />
        </PhotoView>
      </PhotoProvider>;
    }

    return <img
      src={data?.none200}
      className="w-full"
      alt="photo"
    />;
  }

  if (data && data.type === 'video') {
    if (!data?.origin) {
      return <img
        src={data.blur200}
        className="w-full"
        alt="photo"
      />;
    }

    return <ReactPlayer
      url={data.origin}
      light={data?.none200 || data.origin}
      width="100%"
      height="200px"
      muted={true}
      loop={false}
      playing={false}
      controls={ true }
    />
  }
};

export default ContentMedia;

