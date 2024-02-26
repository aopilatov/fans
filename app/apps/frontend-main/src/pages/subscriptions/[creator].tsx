import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';

import AppLayout from '@/layouts/app.layout.tsx';
import { useSubscriptionChange, useSubscriptionGetOne } from '@/api/queries/subscription';

const PageSubscriptionsCreator: FC = () => {
  const { creator } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data, isLoading: isUserLoading } = useSubscriptionGetOne(creator);
  const mutation = useSubscriptionChange();

  const changeSubscription = (level?: number) => {
    mutation.mutate({
      data: { login: creator, level },
      setIsLoading,
    });
  };

  return <AppLayout>
    { (isUserLoading || isLoading) && <div className="w-full flex justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div> }

    { !isUserLoading && !isLoading && data && <div className="p-4 flex flex-col gap-4">
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">My plan</div>
          <div className="stat-value">{
            data.level === 1
              ? <>Free</>
              : <>{data.prices.find(item => item.level === data.level).price} USDT</>
          }</div>
          {data.level > 1 && <div className="stat-desc">per month</div>}
        </div>
      </div>

      { data.prices.length > 1 && <div className="flex flex-col gap-4">
        <div className="text-lg font-medium">All subscription plans</div>

        { data.prices
          .filter(item => item.level > data.level)
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

        {data.prices
          .filter(item => item.level < data.level)
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
