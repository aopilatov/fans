import { FC, useState } from 'react';
import { Creator, Subscription } from '@fans/types';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import SVG from 'css.gg/icons/icons.svg';
import _ from 'lodash';

interface Props {
  creator: Creator;
  subscription: Subscription;
}

const CreatorHeader: FC<Props> = ({ creator, subscription }: Props) => {
  const prefix = _.get(window, 'prefix.value', '');
  const [infoLongIsShowed, setInfoLongIsShowed] = useState<boolean>(false);

  return <>
    { creator && subscription && <div className="w-full flex flex-col">
      <div className="w-full">
        <img
          src={ creator?.artwork  || 'https://placehold.co/562x180' }
          className="w-full"
          alt="alt"
        />

        <div
          className="static flex justify-between items-end mx-2"
          style={{ marginTop: '-40px' }}
        >
          <img
            src={ creator?.image || 'https://placehold.co/180x180' }
            className="border-4 rounded-full w-24"
            alt="ava"
          />

          {!subscription?.isSubscribed
            ? <button className="btn bg-gradient-to-r from-purple-500 to-pink-500 text-gray-100 font-normal">Subscribe for free</button>
            : <div className="flex gap-4">
              <button className="btn btn-outline btn-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <use xlinkHref={SVG + `#gg-user-remove`}/>
                </svg>
              </button>
              <button className={classnames({
                btn: true,
                'btn-outline': !subscription?.isNotificationTurnedOn,
                'btn-accent': true,
              })}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <use xlinkHref={SVG + `#gg-bell`}/>
                </svg>
              </button>
            </div>
          }
        </div>
      </div>

      <div className="p-2">
        <div className="font-medium text-lg flex gap-2 items-center antialiased">
          <div className="text-gray-100">{creator.name}</div>
          {creator.isVerified &&
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <use xlinkHref={SVG + `#gg-check-o`}/>
            </svg>}
        </div>
        <div className="leading-8 text-sm font-light text-gray-400">@{creator.login}</div>
        <div className="collapse bg-base-200">
          <input
            type="checkbox"
            checked={infoLongIsShowed}
            onChange={ (event) => setInfoLongIsShowed(() => event.target.checked) }
          />
          <div className="collapse-title">
            <div className="whitespace-normal hyphens-auto text-sm text-gray-300">{creator.infoShort}</div>
            {creator?.infoLong?.length > 0 && <button className="mt-2 btn btn-outline btn-sm">{!infoLongIsShowed ? 'More info' : 'Hide info'}</button>}
          </div>
          <div className="collapse-content">
            {creator?.infoLong || ''}
          </div>
        </div>
      </div>

      { subscription.isSubscribed && creator.maxLevel > 1 && subscription.level < creator.maxLevel && <div className="p-2">
        <Link
          to={ `${prefix}/subscriptions/${creator.login}` }
          role="button"
          className="btn btn-block bg-gradient-to-r from-sky-500 to-indigo-500 text-neutral-100"
        >Boost your subscription</Link>
      </div> }
    </div>}
  </>;
};

export default CreatorHeader;
