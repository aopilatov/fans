import { FC } from 'react';
import { Post } from '@fans/types';
import _ from 'lodash';

interface Props {
  data: Post;
}

const ContentPhoto: FC<Props> = ({ data }: Props) => {
  const cdn = _.get(window, 'cdn.value', '');

  return <div className="w-full">
    {data.content.image.length === 1 && <img
      src={`${cdn}/${_.get(data, 'content.image[0][3].file')}`}
      className="w-full"
      alt="photo"
    />}

    {data.content.image.length === 2 && <div className="grid grid-cols-2 gap-1">
      {data.content.image.map(item => <img
        key={_.get(item, '[0].mediaUuid')}
        src={`${cdn}/${_.get(item, '[3].file')}`}
        className="w-full"
        alt="photo"
      />)}
    </div>}

    {data.content.image.length >= 3 && <div className="grid grid-cols-2 gap-1">
      <div className="col-span-2">
        <img
          src={`${cdn}/${_.get(data, 'content.image[0][3].file')}`}
          className="w-full"
          alt="photo"
        />
      </div>

      {data.content.image.slice(1).map(item => <img
        key={_.get(item, '[0].mediaUuid')}
        src={`${cdn}/${_.get(item, '[3].file')}`}
        className="w-full"
        alt="photo"
      />)}
    </div>}
  </div>;
};

export default ContentPhoto;

