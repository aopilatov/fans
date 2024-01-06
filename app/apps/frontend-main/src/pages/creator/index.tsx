import { FC, useEffect, useState } from 'react';
import { store } from '@/stores';
import AppLayout from '@/layouts/app.layout.tsx';
import { Creator } from '@fans/types';
import CreatorCard from '@/components/creator/card.tsx';

const PageCreator: FC = () => {
  const [results, setResults] = useState<Creator[]>(null);

  useEffect(() => {
    store.dispatch({ type: 'app/setMenuBack', payload: false });

    setResults(() => ([
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
      <input type="text" placeholder="Search..." className="input input-bordered input-info w-full"/>

      { (results || []).map(item => <CreatorCard
        key={ item.login }
        creator={ item }
      />) }
    </div>
  </AppLayout>;
};

export default PageCreator;
