import { FC, useEffect, useState } from 'react';
import { Creator } from '@fans/types';
import AppLayout from '@/layouts/app.layout.tsx';

import CreatorCard from '@/components/creator/card.tsx';

const PageSubscriptions: FC = () => {
  const [subscriptions, setSubscriptions] = useState<Creator[]>(null);

  useEffect(() => {
    setSubscriptions(() => ([
      {
        login: 'sax1',
        name: 'Alex Opilatov',
        isVerified: true,
        image: 'https://placehold.co/180x180',
        infoShort: '',
        maxLevel: 1,
      },
      {
        login: 'sax2',
        name: 'Alex Opilatov',
        isVerified: true,
        image: 'https://placehold.co/180x180',
        infoShort: '',
        maxLevel: 1,
      },
      {
        login: 'sax3',
        name: 'Alex Opilatov',
        isVerified: true,
        image: 'https://placehold.co/180x180',
        infoShort: '',
        maxLevel: 1,
      },
      {
        login: 'sax4',
        name: 'Alex Opilatov',
        isVerified: true,
        image: 'https://placehold.co/180x180',
        infoShort: '',
        maxLevel: 1,
      },
      {
        login: 'sax5',
        name: 'Alex Opilatov',
        isVerified: true,
        image: 'https://placehold.co/180x180',
        infoShort: '',
        maxLevel: 1,
      },
      {
        login: 'sax6',
        name: 'Alex Opilatov',
        isVerified: true,
        image: 'https://placehold.co/180x180',
        infoShort: '',
        maxLevel: 1,
      },
    ]));
  }, []);

  return <AppLayout>
    <div className="p-4 flex flex-col gap-4">
      { (subscriptions || []).map(item => <CreatorCard
        key={ item.login }
        creator={ item }
      />) }
    </div>
  </AppLayout>;
};

export default PageSubscriptions;
