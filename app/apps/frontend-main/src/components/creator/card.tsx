import { FC } from 'react';
import { Creator } from '@fans/types';
import { Link } from 'react-router-dom';
import _ from 'lodash';

interface Props {
  creator: Creator;
}

const CreatorCard: FC<Props> = ({ creator }: Props) => {
  const prefix = _.get(window, 'prefix.value', '');
  return <Link to={ `${prefix}/creator/${creator.login}` }>
    <div
      className="bshadow-xl rounded-lg bg-contain bg-center"
      style={{
        height: _.floor(window.innerWidth / 562 * 180),
        backgroundImage: `url(${creator?.artwork || 'https://placehold.co/562x180'})`,
      }}
    >
      <div className="w-full h-full flex items-center">
        <img
          src={ creator?.image || 'https://placehold.co/180x180' }
          className="bg-contain bg-center h-2/3 border-4 rounded-full mx-2"
          alt="ava"
        />

        <div className="text-base antialiased font-medium text-white p-1 rounded-md bg-gradient-to-r from-purple-500 to-pink-500">@{ creator.login }</div>
      </div>
    </div>
  </Link>;
};

export default CreatorCard;
