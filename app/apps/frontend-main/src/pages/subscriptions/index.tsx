import { FC, useEffect, useState } from 'react';
import { Creator } from '@fans/types';
import api from '@/api';

import AppLayout from '@/layouts/app.layout.tsx';
import CreatorCard from '@/components/creator/card.tsx';

// art 383e915c-351e-4f1c-8705-5c02ad700be9
// img 7b039c79-2d35-4d78-a93a-894f0e33615f

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
    <div className="p-4 flex flex-col gap-4">
      { isLoading && <div className="w-full flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div> }

      { !isLoading && (subscriptions || []).map(item => <CreatorCard
        key={ item.login }
        creator={ item }
      />) }
    </div>
  </AppLayout>;
};

export default PageSubscriptions;
