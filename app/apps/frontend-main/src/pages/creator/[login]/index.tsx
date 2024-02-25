import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { store } from '@/stores';

import AppLayout from '@/layouts/app.layout.tsx';
import CreatorHeader from '@/components/creator/header.tsx';
import CreatorContent from '@/components/creator/content.tsx';
import _ from 'lodash';
import { useCreatorGet } from '@/api/queries/creator';
import { useSubscriptionChange, useSubscriptionGetOne } from '@/api/queries/subscription';
import { usePostList, usePostListPhotos, usePostListVideos } from '@/api/queries/post';

const PageCreatorProfile: FC = () => {
  const { login } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const { data: creator, isLoading: isCreatorLoading } = useCreatorGet(login);
  const { data: subscription, isLoading: isSubscriptionLoading } = useSubscriptionGetOne(login);
  const { data: creatorPosts } = usePostList(login);
  const { data: creatorPhotos } = usePostListPhotos(login);
  const { data: creatorVideos } = usePostListVideos(login);
  const changeSubscriptionMutation = useSubscriptionChange();

  useEffect(() => {
    store.dispatch({ type: 'app/setMenuBack', payload: true });
  }, []);

  useEffect(() => {
    if(isCreatorLoading || isSubscriptionLoading) {
      setIsLoading(() => true);
    } else setIsLoading(() => false);
  }, [isCreatorLoading, isSubscriptionLoading]);

  const changeSubscription = (level?: number) => {
    setIsLoading(() => true);
    changeSubscriptionMutation.mutate({
      data: { login: creator.login, level },
      setIsLoading: setIsLoading,
    });
  };

  // const changeSubscriptionInStates = (data: any) => {
  //   const sub = _.clone(subscription);
  //   if (!data?.subscription) {
  //     _.unset(sub, 'level');
  //     _.set(sub, 'isSubscribed', false);
  //   } else  {
  //     _.set(sub, 'isSubscribed', true);
  //     _.set(sub, 'level', data?.level || 1);
  //   }
    // setSubscription(() => sub);
    // getData();
  // };

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
        // setSubscription={ setSubscription }
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
