import { FC, useEffect, useState } from 'react';
import { Creator, Post, PostType, Subscription } from '@fans/types';
import { useParams } from 'react-router-dom';
import { store } from '@/stores';
import api from '@/api';

import AppLayout from '@/layouts/app.layout.tsx';
import CreatorHeader from '@/components/creator/header.tsx';
import CreatorContent from '@/components/creator/content.tsx';

const PageCreatorProfile: FC = () => {
  const { login } = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [creator, setCreator] = useState<Creator>(null);
  const [subscription, setSubscription] = useState<Subscription>(null);
  const [creatorPosts, setCreatorPosts] = useState<Post[]>([]);
  const [creatorPhotos, setCreatorPhotos] = useState<Post[]>([]);
  const [creatorVideos, setCreatorVideos] = useState<Post[]>([]);

  useEffect(() => {
    store.dispatch({ type: 'app/setMenuBack', payload: true });
  }, []);

  useEffect(() => {
    if (login) {
      setIsLoading(() => true);
      Promise.all([getCreator, getSubscription].map(item => item()))
        .finally(() => setIsLoading(() => false));

      setCreatorPosts(() => ([
        {
          uuid: '1',
          date: '2023-12-30T12:20:21.000Z',
          type: PostType.IMAGE,
          isLiked: true,
          level: 1,
          subscription: {
            isSubscribed: true,
            isNotificationTurnedOn: false,
            level: 1,
            prices: [{
              level: 1,
              price: 0,
            }],
          },
          creator: {
            login: 'sax',
            name: 'Alex Opilatov',
            isVerified: true,
            image: 'https://placehold.co/180x180',
            infoShort: '',
            maxLevel: 1,
          },
          content: {
            image: ['https://placehold.co/1000x1000'],
          },
        },
        {
          uuid: '2',
          date: '2023-12-30T12:20:21.000Z',
          isLiked: false,
          type: PostType.TEXT,
          level: 1,
          subscription: {
            isSubscribed: true,
            isNotificationTurnedOn: false,
            level: 1,
            prices: [{
              level: 1,
              price: 0,
            }],
          },
          creator: {
            login: 'sax',
            name: 'Alex Opilatov',
            isVerified: true,
            image: 'https://placehold.co/180x180',
            infoShort: '',
            maxLevel: 1,
          },
          content: {
            text: '$200 TIP FOR A 2 MINUTE CUSTOM VIDEO OF YOUR CHOOSING\n$350 TIP FOR A 5 MINUTE CUSTOM VIDEO\n$80 FOR A CUSTOM PHOTO\n $50 FOR A CUSTOM AUDIO MESSAGE <33333333',
          },
        },
        {
          uuid: '3',
          date: '2023-12-30T12:20:21.000Z',
          isLiked: false,
          type: PostType.IMAGE,
          level: 2,
          subscription: {
            isSubscribed: true,
            isNotificationTurnedOn: false,
            level: 1,
            prices: [{
              level: 1,
              price: 0,
            }],
          },
          creator: {
            login: 'sax',
            name: 'Alex Opilatov',
            isVerified: true,
            image: 'https://placehold.co/180x180',
            infoShort: '',
            maxLevel: 2,
          },
          content: {
            image: ['https://placehold.co/1000x1000'],
          },
        },
        {
          uuid: '4',
          date: '2023-12-30T12:20:21.000Z',
          isLiked: false,
          type: PostType.VIDEO,
          level: 1,
          subscription: {
            isSubscribed: true,
            isNotificationTurnedOn: false,
            level: 1,
            prices: [{
              level: 1,
              price: 0,
            }],
          },
          creator: {
            login: 'sax',
            name: 'Alex Opilatov',
            isVerified: true,
            image: 'https://placehold.co/180x180',
            infoShort: '',
            maxLevel: 1,
          },
          content: {
            image: ['https://placehold.co/1000x1000'],
            video: ['http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'],
          },
        },
      ]));

      setCreatorPhotos(() => ([
        {
          uuid: '1',
          date: '2023-12-30T12:20:21.000Z',
          isLiked: false,
          type: PostType.IMAGE,
          level: 1,
          subscription: {
            isSubscribed: false,
            isNotificationTurnedOn: false,
            level: 1,
            prices: [{
              level: 1,
              price: 0,
            }],
          },
          creator: {
            login: 'sax',
            name: 'Alex Opilatov',
            isVerified: true,
            image: 'https://placehold.co/180x180',
            infoShort: '',
            maxLevel: 1,
          },
          content: {
            image: ['https://placehold.co/1000x1000'],
          },
        },
        {
          uuid: '2',
          date: '2023-12-30T12:20:21.000Z',
          isLiked: false,
          type: PostType.IMAGE,
          level: 1,
          subscription: {
            isSubscribed: false,
            isNotificationTurnedOn: false,
            level: 1,
            prices: [{
              level: 1,
              price: 0,
            }],
          },
          creator: {
            login: 'sax',
            name: 'Alex Opilatov',
            isVerified: true,
            image: 'https://placehold.co/180x180',
            infoShort: '',
            maxLevel: 1,
          },
          content: {
            image: ['https://placehold.co/1000x1000'],
          },
        },
        {
          uuid: '3',
          date: '2023-12-30T12:20:21.000Z',
          isLiked: false,
          type: PostType.IMAGE,
          level: 1,
          subscription: {
            isSubscribed: false,
            isNotificationTurnedOn: false,
            level: 1,
            prices: [{
              level: 1,
              price: 0,
            }],
          },
          creator: {
            login: 'sax',
            name: 'Alex Opilatov',
            isVerified: true,
            image: 'https://placehold.co/180x180',
            infoShort: '',
            maxLevel: 1,
          },
          content: {
            image: ['https://placehold.co/1000x1000'],
          },
        },
        {
          uuid: '4',
          date: '2023-12-30T12:20:21.000Z',
          isLiked: false,
          type: PostType.IMAGE,
          level: 1,
          subscription: {
            isSubscribed: false,
            isNotificationTurnedOn: false,
            level: 1,
            prices: [{
              level: 1,
              price: 0,
            }],
          },
          creator: {
            login: 'sax',
            name: 'Alex Opilatov',
            isVerified: true,
            image: 'https://placehold.co/180x180',
            infoShort: '',
            maxLevel: 1,
          },
          content: {
            image: ['https://placehold.co/1000x1000'],
          },
        },
      ]));

      setCreatorVideos(() => ([
        {
          uuid: '1',
          date: '2023-12-30T12:20:21.000Z',
          isLiked: false,
          type: PostType.IMAGE,
          level: 1,
          subscription: {
            isSubscribed: false,
            isNotificationTurnedOn: false,
            level: 1,
            prices: [{
              level: 1,
              price: 0,
            }],
          },
          creator: {
            login: 'sax',
            name: 'Alex Opilatov',
            isVerified: true,
            image: 'https://placehold.co/180x180',
            infoShort: '',
            maxLevel: 1,
          },
          content: {
            image: ['https://placehold.co/1000x1000'],
          },
        },
        {
          uuid: '2',
          date: '2023-12-30T12:20:21.000Z',
          isLiked: false,
          type: PostType.IMAGE,
          level: 1,
          subscription: {
            isSubscribed: false,
            isNotificationTurnedOn: false,
            level: 1,
            prices: [{
              level: 1,
              price: 0,
            }],
          },
          creator: {
            login: 'sax',
            name: 'Alex Opilatov',
            isVerified: true,
            image: 'https://placehold.co/180x180',
            infoShort: '',
            maxLevel: 1,
          },
          content: {
            image: ['https://placehold.co/1000x1000'],
          },
        },
        {
          uuid: '3',
          date: '2023-12-30T12:20:21.000Z',
          isLiked: false,
          type: PostType.IMAGE,
          level: 1,
          subscription: {
            isSubscribed: false,
            isNotificationTurnedOn: false,
            level: 1,
            prices: [{
              level: 1,
              price: 0,
            }],
          },
          creator: {
            login: 'sax',
            name: 'Alex Opilatov',
            isVerified: true,
            image: 'https://placehold.co/180x180',
            infoShort: '',
            maxLevel: 1,
          },
          content: {
            image: ['https://placehold.co/1000x1000'],
          },
        },
        {
          uuid: '4',
          date: '2023-12-30T12:20:21.000Z',
          isLiked: false,
          type: PostType.IMAGE,
          level: 1,
          subscription: {
            isSubscribed: false,
            isNotificationTurnedOn: false,
            level: 1,
            prices: [{
              level: 1,
              price: 0,
            }],
          },
          creator: {
            login: 'sax',
            name: 'Alex Opilatov',
            isVerified: true,
            image: 'https://placehold.co/180x180',
            infoShort: '',
            maxLevel: 1,
          },
          content: {
            image: ['https://placehold.co/1000x1000'],
          },
        },
      ]));
    }
  }, [login]);

  const getCreator = () => {
    api.creator.get(login)
      .then((data: any) => setCreator(() => data));
  };

  const getSubscription = () => {
    api.subscription.getOne(login)
      .then((data: any) => setSubscription(() => data));
  };

  return <AppLayout>
    { isLoading && <div className="w-full flex justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div> }

    { !isLoading && creator && <>
      <CreatorHeader creator={ creator } subscription={ subscription } />

      <div className="p-2">
        <CreatorContent
          creator={ creator }
          posts={ creatorPosts }
          photos={ creatorPhotos }
          videos={ creatorVideos }
          showLinkToCreator={ false }
        />
      </div>
    </> }
  </AppLayout>;
};

export default PageCreatorProfile;
