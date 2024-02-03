import { FC, useEffect, useState } from 'react';
import { store } from '@/stores';
import api from '@/api';

import AppLayout from '@/layouts/app.layout.tsx';

import ProfileMoney from '@/components/profile/money.tsx';
import ProfileStats from '@/components/profile/stats.tsx';

const PageProfile: FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [self, setSelf] = useState<Record<string, any>>(null);

  useEffect(() => {
    store.dispatch({ type: 'app/setMenuBack', payload: false });
    loadSelf();
  }, []);

  const loadSelf = async () => {
    setIsLoading(() => true);
    api.user.getSelf()
      .then(data => {
        setSelf(() => data as any);
      })
      .finally(() => {
        setIsLoading(() => false);
      });
  };

  return <AppLayout>
    <div className="p-2 flex flex-col gap-4">
      { isLoading && <div className="w-full flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div> }

      { !isLoading && self && <>
        <ProfileMoney balance={ self.balance } />
        <ProfileStats subscriptions={ self.subscriptions } />
      </> }
    </div>
  </AppLayout>;
};

export default PageProfile;
