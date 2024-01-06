import { FC } from 'react';
import { Post } from '@fans/types';

interface Props {
  data: Post;
}

const ContentPhoto: FC<Props> = ({ data }: Props) => {
  return <div className="w-full">
    <img
      src={data.content.image[0]}
      className="w-full"
      alt="photo"
    />
  </div>;
};

export default ContentPhoto;

