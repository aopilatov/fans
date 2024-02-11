import { FC, useEffect, useState } from 'react';
import { Creator } from '@fans/types';
import api from '@/api';

import AppLayout from '@/layouts/app.layout.tsx';
import CreatorCard from '@/components/creator/card.tsx';

const PageSubscriptions: FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [subscriptions, setSubscriptions] = useState<Creator[]>(null);

  useEffect(() => {
    getList();
  }, []);

  const getList = async () => {
    setIsLoading(() => true);
    api.subscription.getForUser()
      .then((data: any) => {
        setSubscriptions(() => data?.listOfCreators || [])
      })
      .finally(() => {
        setIsLoading(() => false);
      })
  };

  return <AppLayout>
    <div className="w-full h-full p-4 flex flex-col gap-4">
      { isLoading && <div className="w-full h-full  flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div> }

      { !isLoading && !subscriptions?.length && <div className="w-full h-full flex justify-center items-center">
        You don't have subscriptions
      </div> }

      { !isLoading && (subscriptions || []).map(item => <CreatorCard
        key={ item.login }
        creator={ item }
      />) }
    </div>
  </AppLayout>;
};

export default PageSubscriptions;
