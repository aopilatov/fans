import { FC, useEffect, useState } from 'react';
import { Creator, Post, Subscription } from '@fans/types';
import { useParams } from 'react-router-dom';
import { store } from '@/stores';
import api from '@/api';

import AppLayout from '@/layouts/app.layout.tsx';
import CreatorHeader from '@/components/creator/header.tsx';
import CreatorContent from '@/components/creator/content.tsx';
import _ from 'lodash';

const PageCreatorProfile: FC = () => {
  const { login } = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [creator, setCreator] = useState<Creator>(null);
  const [subscription, setSubscription] = useState<Subscription>(null);
  const [creatorPosts, setCreatorPosts] = useState<Post[]>([]);
  const [creatorPhotos, setCreatorPhotos] = useState<Record<string, any>[]>([]);
  const [creatorVideos, setCreatorVideos] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    store.dispatch({ type: 'app/setMenuBack', payload: true });
  }, []);

  useEffect(() => {
    if (login) getData();
  }, [login]);

  const getData = () => {
    setIsLoading(() => true);
    Promise.all([getCreator, getSubscription, getPosts, getPhotos, getVideos].map(item => item()))
      .finally(() => setIsLoading(() => false));
  };

  const getCreator = () => {
    api.creator.get(login)
      .then((data: any) => setCreator(() => data));
  };

  const getSubscription = () => {
    api.subscription.getOne(login)
      .then((data: any) => setSubscription(() => data));
  };

  const getPosts = () => {
    api.post.list(login)
      .then((data: any) => setCreatorPosts(() => data));
  };

  const getPhotos = () => {
    api.post.listPhotos(login)
      .then((data: any) => setCreatorPhotos(() => data));
  };

  const getVideos = () => {
    api.post.listVideos(login)
      .then((data: any) => setCreatorVideos(() => data));
  };

  const changeSubscription = (level?: number) => {
    setIsLoading(() => true);
    api.subscription.change(creator.login, level)
      .then((data: any) => {
        if (data?.success) changeSubscriptionInStates(data);
      })
      .finally(() => setIsLoading(() => false));
  };

  const changeSubscriptionInStates = (data: any) => {
    const sub = _.clone(subscription);
    if (!data?.subscription) {
      _.unset(sub, 'level');
      _.set(sub, 'isSubscribed', false);
    } else  {
      _.set(sub, 'isSubscribed', true);
      _.set(sub, 'level', data?.level || 1);
    }
    setSubscription(() => sub);
    getData();
  };

  return <AppLayout>
    { isLoading && <div className="w-full flex justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div> }

    { !isLoading && creator && <>
      <CreatorHeader
        creator={ creator }
        subscription={ subscription }
        isLoading={ isLoading }
        setIsLoading={ setIsLoading }
        subscribeCallback={ changeSubscription }
        setSubscription={ setSubscription }
      />

      <div className="p-2">
        <CreatorContent
          creator={ creator }
          posts={ creatorPosts }
          photos={ creatorPhotos }
          videos={ creatorVideos }
          showLinkToCreator={ false }
          subscribeCallback={ changeSubscription }
        />
      </div>
    </> }
  </AppLayout>;
};

export default PageCreatorProfile;
