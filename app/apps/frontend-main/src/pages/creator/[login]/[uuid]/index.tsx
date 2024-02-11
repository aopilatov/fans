import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Post } from '@fans/types';
import { store } from '@/stores';
import api from '@/api';

import AppLayout from '@/layouts/app.layout.tsx';
import ContentDefault from '@/components/content/default.tsx';

const PageCreatorPost: FC = () => {
  const { login, uuid } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [post, setPost] = useState<Post>(null);

  useEffect(() => {
    store.dispatch({ type: 'app/setMenuBack', payload: true });
    getPost();
  }, []);

  const getPost = () => {
    setIsLoading(() => true);
    api.post.get(login, uuid)
      .then((data: any) => {
        setPost(() => data);
      })
      .finally(() => {
        setIsLoading(() => false);
      })
  };

  return <AppLayout>
    { isLoading && <div className="w-full flex justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div> }

    { !isLoading && post && <ContentDefault data={ post } showLinkToCreator={ true } zoomable={ true } /> }
  </AppLayout>;
};

export default PageCreatorPost;
