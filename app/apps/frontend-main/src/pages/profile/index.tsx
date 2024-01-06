import { FC, useEffect } from 'react';
import { store } from '@/stores';
import AppLayout from '@/layouts/app.layout.tsx';

import ProfileMoney from '@/components/profile/money.tsx';
import ProfileStats from '@/components/profile/stats.tsx';

const PageProfile: FC = () => {
  useEffect(() => {
    store.dispatch({ type: 'app/setMenuBack', payload: false });
  }, []);

  return <AppLayout>
    <div className="p-2 flex flex-col gap-4">
      <ProfileMoney />
      <ProfileStats />
    </div>
  </AppLayout>;
};

export default PageProfile;
