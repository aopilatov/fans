import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Post, PostType } from '@fans/types';
import { store } from '@/stores';
import AppLayout from '@/layouts/app.layout.tsx';

import ContentDefault from '@/components/content/default.tsx';

const PageCreatorPost: FC = () => {
  const { login, uuid } = useParams();
  console.log({ login, uuid });
  const [post, setPost] = useState<Post>(null);

  useEffect(() => {
    store.dispatch({ type: 'app/setMenuBack', payload: true });
    setPost(() => ({
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
    }));
  }, []);

  return <AppLayout>
    { post && <ContentDefault data={ post } showLinkToCreator={ true } /> }
  </AppLayout>;
};

export default PageCreatorPost;
