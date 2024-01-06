import { FC } from 'react';
import { Post } from '@fans/types';
import SVG from 'css.gg/icons/icons.svg';

import ContentUnavailableIcon from '@/components/content/unavaialbleIcon.tsx';

interface Props {
  data: Post;
}

const ContentUnavailableSubscribe: FC<Props> = ({ data }: Props) => {
  return <div className="w-full h-48 px-4 bg-neutral-300 flex flex-col justify-around items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-neutral-400" fill="none" viewBox="0 0 24 24"
         stroke="currentColor">
      <use xlinkHref={SVG + `#gg-lock`}/>
    </svg>

    <div className="w-full p-2 border border-neutral-400 rounded-lg flex flex-col gap-2">
      <ContentUnavailableIcon type={ data.type } />

      <button className="btn btn-success btn-block text-neutral-100">Subscribe to see posts</button>
    </div>
  </div>;
};

export default ContentUnavailableSubscribe;

