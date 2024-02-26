import { FC, useEffect, useState } from 'react';
import { store } from '@/stores';
import { Creator } from '@fans/types';

import AppLayout from '@/layouts/app.layout.tsx';
import CreatorCard from '@/components/creator/card.tsx';

import { useCreatorSearch } from '@/api/queries/creator';

const PageCreator: FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Creator[]>(null);

  const searchMutation = useCreatorSearch();

  useEffect(() => {
    store.dispatch({ type: 'app/setMenuBack', payload: false });
    searchMutation.mutate({ search: '', setIsLoading, setResults });
  }, []);

  const typeWatch = function () {
    let timer = 0;
    return function(cb: (val: string) => void, ms: number){
      clearTimeout (timer);
      timer = setTimeout(cb, ms);
    };
  }();

  const onSearchValueChange = (val: string) => {
    searchMutation.mutate({ search: val, setIsLoading, setResults });
  };

  return <AppLayout>
    <div className="p-4 flex flex-col gap-4">
      <input
        onChange={ (e) => typeWatch(() => onSearchValueChange(e.target.value), 1000) }
        type="text"
        placeholder="Search..."
        className="input input-bordered input-info w-full"
      />

      { isLoading && <div className="w-full flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div> }

      { (results || []).map(item => <CreatorCard
        key={ item.login }
        creator={ item }
      />) }
    </div>
  </AppLayout>;
};

export default PageCreator;
