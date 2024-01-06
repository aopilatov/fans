import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '@fans/types';
import SVG from 'css.gg/icons/icons.svg';
import _ from 'lodash';

import ContentUnavailableIcon from '@/components/content/unavaialbleIcon.tsx';

interface Props {
  data: Post;
}

const ContentUnavailableLevel: FC<Props> = ({ data }: Props) => {
  const prefix = _.get(window, 'prefix.value', '');

  return <div className="w-full h-48 px-4 bg-neutral-300 flex flex-col justify-around items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-neutral-400" fill="none" viewBox="0 0 24 24"
         stroke="currentColor">
      <use xlinkHref={SVG + `#gg-key`}/>
    </svg>

    <div className="w-full p-2 border border-neutral-400 rounded-lg flex flex-col gap-2">
      <ContentUnavailableIcon type={ data.type } />

      <Link
        to={ `${prefix}/subscriptions/${data.creator.login}` }
        role="button"
        className="btn btn-block border-0 bg-gradient-to-r from-sky-500 to-indigo-500 text-neutral-100"
      >Boost subscription to see post</Link>
    </div>
  </div>;
};

export default ContentUnavailableLevel;

