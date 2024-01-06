import { FC, useEffect } from 'react';
import { store } from '@/stores';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import AppLayout from '@/layouts/app.layout.tsx';
// import ContentDefault from '@/components/content/default.tsx';

const PageHome: FC = () => {
  const prefix = _.get(window, 'prefix.value', '');

  useEffect(() => {
    store.dispatch({ type: 'app/setMenuBack', payload: false });
  }, []);

  return <AppLayout>
    {/*<div className="flex flex-col gap-4">*/}
    {/*  */}
    {/*</div>*/}

    <div className="hero h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Hey there!</h1>
          <p className="py-6">Your list of subscriptions is empty :(<br />First, you could find content creators you like, and then you will find here latest updates.</p>
          <Link
            to={ `${prefix}/creator` }
            role="button"
            className="btn btn-primary text-white"
          >Get Started</Link>
        </div>
      </div>
    </div>
  </AppLayout>;
};

export default PageHome;
