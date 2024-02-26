import { FC, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { store } from '@/stores';

import AppLayout from '@/layouts/app.layout.tsx';
import ContentDefault from '@/components/content/default.tsx';
import { usePostGet } from '@/api/queries/post';

const PageCreatorPost: FC = () => {
  const { login, uuid } = useParams();
  const { data, isLoading } = usePostGet(login, uuid);

  useEffect(() => {
    store.dispatch({ type: 'app/setMenuBack', payload: true });
  }, []);

  return <AppLayout>
    { isLoading && <div className="w-full flex justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div> }

    { !isLoading && data && <ContentDefault data={ data } showLinkToCreator={ true } zoomable={ true } /> }
  </AppLayout>;
};

export default PageCreatorPost;
