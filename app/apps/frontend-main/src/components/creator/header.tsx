import { FC, useEffect, useState } from 'react';
import { Creator, Subscription } from '@fans/types';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import SVG from 'css.gg/icons/icons.svg';
import api from '@/api';
import _ from 'lodash';

interface Props {
  creator: Creator;
  subscription: Subscription;
}

const CreatorHeader: FC<Props> = ({ creator, subscription }: Props) => {
  const cdn = _.get(window, 'cdn.value', '');
  const prefix = _.get(window, 'prefix.value', '');

  const [infoLongIsShowed, setInfoLongIsShowed] = useState<boolean>(false);
  const [isLoadingSub, setIsLoadingSub] = useState<boolean>(false);
  const [infoSub, setInfoSub] = useState<Subscription>(subscription);

  useEffect(() => {
    if (subscription) {
      setInfoSub(() => subscription);
    }
  }, [subscription]);

  const changeSubscription = (level?: number) => {
    setIsLoadingSub(() => true);
    api.subscription.change(creator.login, level)
      .then((data: any) => {
        if (data?.success) {
          const sub = _.clone(infoSub);
          if (!data?.subscription) {
            _.unset(sub, 'level');
            _.set(sub, 'isSubscribed', false);
          } else  {
            _.set(sub, 'isSubscribed', true);
            _.set(sub, 'level', data?.level || 1);
          }
          setInfoSub(() => sub);
        }
      })
      .finally(() => setIsLoadingSub(() => false));
  };

  const changeNotification = () => {
    setIsLoadingSub(() => true);
    api.subscription.notification(creator.login)
      .then((data: any) => {
        if (data?.success) {
          const sub = _.clone(infoSub);
          _.set(sub, 'isNotificationTurnedOn', data?.isNotificationTurnedOn || false);
          setInfoSub(() => sub);
        }
      })
      .finally(() => setIsLoadingSub(() => false));
  };

  return <>
    { creator && infoSub && <div className="w-full flex flex-col">
      <div className="w-full">
        <img
          src={ creator?.artwork?.length > 0 ? `${cdn}${creator.artwork.find(item => item.width === 200)}` : '/artwork-noimg.png' }
          className="w-full"
          alt="alt"
        />

        <div
          className="static flex justify-between items-end mx-2"
          style={{ marginTop: '-40px' }}
        >
          <img
            src={ creator?.image?.length > 0 ? `${cdn}${creator.image.find(item => item.width === 100)}` : '/creator-noimg.png' }
            className="border-4 rounded-full w-24"
            alt="ava"
          />

          {!infoSub?.isSubscribed &&
            <button
              className="btn bg-gradient-to-r from-purple-500 to-pink-500 text-gray-100 font-normal"
              onClick={ () => changeSubscription(1) }
            >{!isLoadingSub ? 'Subscribe for free' : <span className="loading loading-spinner"></span>}</button>
          }

          {infoSub?.isSubscribed &&
            <div className="flex gap-4">
              <button
                className="btn btn-outline btn-error"
                onClick={ () => changeSubscription() }
              >
                {
                  !isLoadingSub
                    ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <use xlinkHref={SVG + `#gg-user-remove`}/>
                      </svg>
                    : <span className="loading loading-spinner"></span>
                }
              </button>
              <button
                onClick={ () => changeNotification() }
                className={classnames({
                  btn: true,
                  'btn-outline': !infoSub?.isNotificationTurnedOn,
                  'btn-accent': true,
                })}
              >{!isLoadingSub
                ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                  <use xlinkHref={SVG + `#gg-bell`}/>
                </svg>
                : <span className="loading loading-spinner"></span>
              }</button>
            </div>
          }
        </div>
      </div>

      <div className="p-2">
        <div className="font-medium text-lg flex gap-2 items-center antialiased">
          <div className="text-gray-100">{creator.name}</div>
          {creator.isVerified &&
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <use xlinkHref={SVG + `#gg-check-o`}/>
            </svg>}
        </div>
        <div className="leading-8 text-sm font-light text-gray-400">@{creator.login}</div>
        <div className="collapse bg-base-200">
          <input
            type="checkbox"
            checked={infoLongIsShowed}
            onChange={(event) => setInfoLongIsShowed(() => event.target.checked)}
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

      { infoSub.isSubscribed && creator.maxLevel > 1 && infoSub.level < creator.maxLevel && <div className="p-2">
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
