import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Subscription } from '@fans/types';
import api from '@/api';

import AppLayout from '@/layouts/app.layout.tsx';
import _ from 'lodash';

const PageSubscriptionsCreator: FC = () => {
  const { creator } = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<Subscription>(null);

  const getSubscription = () => {
    setIsLoading(() => true);
    api.subscription.getOne(creator)
      .then((data: any) => {
        setSubscription(() => data);
      })
      .finally(() => {
        setIsLoading(() => false);
      });
  };

  const changeSubscription = (level?: number) => {
    setIsLoading(() => true);
    api.subscription.change(creator, level)
      .then((data: any) => {
        if (data?.success) {
          const sub = _.clone(subscription);
          _.set(sub, 'level', data?.level || 1);
          setSubscription(() => sub);
        }
      })
      .finally(() => setIsLoading(() => false));
  };

  useEffect(() => {
    if (creator) getSubscription();
  }, [creator]);

  return <AppLayout>
    { isLoading && <div className="w-full flex justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div> }

    { !isLoading && subscription && <div className="p-4 flex flex-col gap-4">
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">My plan</div>
          <div className="stat-value">{
            subscription.level === 1
              ? <>Free</>
              : <>{subscription.prices.find(item => item.level === subscription.level).price} USDT</>
          }</div>
          {subscription.level > 1 && <div className="stat-desc">per month</div>}
        </div>
      </div>

      { subscription.prices.length > 1 && <div className="flex flex-col gap-4">
        <div className="text-lg font-medium">All subscription plans</div>

        { subscription.prices
          .filter(item => item.level > subscription.level)
          .map(item => <div
            key={ item.level }
            className="w-full stats shadow"
          >
            <div className="stat">
              <div className="stat-value">{
                item.level === 1
                  ? <>Free</>
                  : <>{item.price} USDT</>
              }</div>
              {item.level > 1 && <div className="stat-desc">per month</div>}
              <div className="divider"></div>
              <button
                onClick={ () => changeSubscription(item.level) }
                className="btn btn-block"
              >Upgrade to level { item.level }</button>
            </div>
          </div>)
        }

        {subscription.prices
          .filter(item => item.level < subscription.level)
          .map(item => <div
            key={ item.level }
            className="w-full stats shadow"
          >
            <div className="stat">
              <div className="stat-value">{
                item.level === 1
                  ? <>Free</>
                  : <>{item.price} USDT</>
              }</div>
              {item.level > 1 && <div className="stat-desc">per month</div>}
              <div className="divider"></div>
              <button
                onClick={ () => changeSubscription(item.level) }
                className="btn btn-block"
              >Downgrade to level { item.level }</button>
            </div>
          </div>)
        }
      </div>}
    </div>}
  </AppLayout>;
};

export default PageSubscriptionsCreator;
