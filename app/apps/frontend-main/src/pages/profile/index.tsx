import { FC, useEffect } from 'react';
import { store } from '@/stores';

import AppLayout from '@/layouts/app.layout.tsx';

import ProfileMoney from '@/components/profile/money.tsx';
import ProfileStats from '@/components/profile/stats.tsx';
import { useUserGetSelf } from '@/api/queries/user';

const PageProfile: FC = () => {
  const { data, isLoading } = useUserGetSelf();

  useEffect(() => {
    store.dispatch({ type: 'app/setMenuBack', payload: false });
  }, []);

  return <AppLayout>
    <div className="p-2 flex flex-col gap-4">
      { isLoading && <div className="w-full flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div> }

      { !isLoading && data && <>
        <ProfileMoney balances={ data.balances } />
        <ProfileStats subscriptions={ data.subscriptions } />
      </> }
    </div>
  </AppLayout>;
};

export default PageProfile;
