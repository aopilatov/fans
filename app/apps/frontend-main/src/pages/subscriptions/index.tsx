import { FC } from 'react';

import AppLayout from '@/layouts/app.layout.tsx';
import CreatorCard from '@/components/creator/card.tsx';
import { useSubscriptionGetForUser } from '@/api/queries/subscription';

const PageSubscriptions: FC = () => {
  const { data, isLoading } = useSubscriptionGetForUser();

  return <AppLayout>
    <div className="w-full h-full p-4 flex flex-col gap-4">
      { isLoading && <div className="w-full h-full  flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div> }

      { !isLoading && !data?.length && <div className="w-full h-full flex justify-center items-center">
        You don't have subscriptions
      </div> }

      { !isLoading && (data || []).map(item => <CreatorCard
        key={ item.login }
        creator={ item }
      />) }
    </div>
  </AppLayout>;
};

export default PageSubscriptions;
