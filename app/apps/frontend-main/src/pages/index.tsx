import { FC, useEffect, useState } from 'react';
import { store } from '@/stores';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import AppLayout from '@/layouts/app.layout.tsx';
import { Post } from '@fans/types';
import api from '@/api';
import ContentDefault from '@/components/content/default.tsx';
// import ContentDefault from '@/components/content/default.tsx';

const PageHome: FC = () => {
  const prefix = _.get(window, 'prefix.value', '');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [posts, setpPosts] = useState<Post[]>([]);

  useEffect(() => {
    store.dispatch({ type: 'app/setMenuBack', payload: false });
  }, []);

  useEffect(() => {
    getPosts();
  }, []);

  const getPosts = () => {
    setIsLoading(() => true);
    api.post.feed()
      .then((data: any) => setpPosts(() => data))
      .finally(() => setIsLoading(() => false));
  };

  return <AppLayout>
    { isLoading && <div className="w-full flex justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div> }

    {!isLoading && !posts.length && <div className="hero h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Hey there!</h1>
          <p className="py-6">Your list of subscriptions is empty :(<br/>First, you could find content creators you
            like, and then you will find here latest updates.</p>
          <Link
            to={`${prefix}/creator`}
            role="button"
            className="btn btn-primary text-white"
          >Get Started</Link>
        </div>
      </div>
    </div>}

    { !isLoading && posts.length && <div className="p-4 flex flex-col gap-4">
      {(posts || []).map(item => <div key={item.uuid}>
        <ContentDefault
          data={item}
          showLinkToCreator={ true }
          zoomable={true}/>
      </div>)}
    </div> }
  </AppLayout>;
};

export default PageHome;
