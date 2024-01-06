import { FC, useEffect, useState } from 'react';
import { Creator, Post, PostType, Subscription } from '@fans/types';
import { useParams } from 'react-router-dom';
import { store } from '@/stores';
import AppLayout from '@/layouts/app.layout.tsx';

import CreatorHeader from '@/components/creator/header.tsx';
import CreatorContent from '@/components/creator/content.tsx';

const PageCreatorProfile: FC = () => {
  const { login } = useParams();
  const [creator, setCreator] = useState<Creator>(null);
  const [subscription, setSubscription] = useState<Subscription>(null);
  const [creatorPosts, setCreatorPosts] = useState<Post[]>(null);
  const [creatorPhotos, setCreatorPhotos] = useState<Post[]>(null);
  const [creatorVideos, setCreatorVideos] = useState<Post[]>(null);

  useEffect(() => {
    store.dispatch({ type: 'app/setMenuBack', payload: true });
  }, []);

  useEffect(() => {
    if (login) {
      setCreator(() => ({
        isVerified: true,
        login: 'sax',
        artwork: 'https://placehold.co/562x180',
        image: 'https://placehold.co/180x180',
        name: 'Alex Opilatov',
        infoShort: 'Lover, dreamer, & host of Let’s Get Real 🎙️ ✨🌹',
        infoLong: 'Legal Disclaimer: All content published on this OnlyFans, Inc account is exclusive copyrighted material belonging to HOUSEOFGRACEY. Patrons may not distribute or publish any content from my OnlyFans, or private accounts, including but not limited to videos, photographs and any other such content that is posted here. Violation of this will result in legal action. You also may not screenshot or screen record any private content. By signing up for my OnlyFans you consent that you are at least 18 years old, and agree to these terms and conditions.',
        maxLevel: 2,
      }));

      setSubscription(() => ({
        isSubscribed: true,
        isNotificationTurnedOn: true,
        level: 1,
        prices: [{
          level: 1,
          price: 0,
        }],
      }));

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

  return <AppLayout>
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
  </AppLayout>;
};

export default PageCreatorProfile;
