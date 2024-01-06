import { FC, useEffect, useState } from 'react';
import { Subscription } from '@fans/types';
import AppLayout from '@/layouts/app.layout.tsx';

const PageSubscriptionsCreator: FC = () => {
  const [subscription, setSubscription] = useState<Subscription>(null);

  useEffect(() => {
    setSubscription(() => ({
      isSubscribed: true,
      isNotificationTurnedOn: true,
      level: 2,
      prices: [{
        level: 1,
        price: 0,
      }, {
        level: 2,
        price: 10,
      }, {
        level: 3,
        price: 20,
      }],
    }));
  }, []);

  return <AppLayout>
    { subscription && <div className="p-4 flex flex-col gap-4">
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
              <button className="btn btn-block">Upgrade to level { item.level }</button>
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
              <button className="btn btn-block">Downgrade to level { item.level }</button>
            </div>
          </div>)
        }
      </div>}
    </div>}
  </AppLayout>;
};

export default PageSubscriptionsCreator;
