import { FC, useEffect, useState } from 'react';
import { Post } from '@fans/types';
import { useLocation, Link } from 'react-router-dom';
import classnames from 'classnames';
import _ from 'lodash';

import ContentDefault from '@/components/content/default.tsx';

type Tabs = 'posts' | 'photo' | 'video';

interface Props {
  creator: Record<string, any>;
  posts: Post[];
  photos: Record<string, any>;
  videos: Record<string, any>;
  showLinkToCreator?: boolean;
  subscribeCallback?: Function;
}

const CreatorContent: FC<Props> = ({ creator, posts, photos, videos, showLinkToCreator = true, subscribeCallback }: Props) => {
  const prefix = _.get(window, 'prefix.value', '');
  const cdn = import.meta.env.VITE_URL_CDN || '';

  const location = useLocation();

  const [activeTab, setActiveTab] = useState<Tabs>('posts');

  useEffect(() => {
    if (location) {
      if (location?.hash?.length) {
        const hash = location.hash.startsWith('#') ? location.hash.substring(1) : location.hash;
        setActiveTab(() => hash as Tabs);
      }
    }
  }, [location]);

  const isTabActive = (tab: Tabs): boolean => {
    return activeTab === tab;
  };

  const updateActiveTab = (tab: Tabs): void => {
    setActiveTab(tab);
    window.history.replaceState({}, 'Tab', `${location.pathname}#${tab}`);
  };

  return <>
    {creator && location && <div className="flex flex-col gap-4">
      <div role="tablist" className="tabs tabs-boxed">
        <a
          role="tab"
          onClick={() => updateActiveTab('posts')}
          className={classnames({ tab: true, 'tab-active': isTabActive('posts') })}
        >Posts</a>

        <a
          role="tab"
          onClick={() => updateActiveTab('photo')}
          className={classnames({ tab: true, 'tab-active': isTabActive('photo') })}
        >Photos</a>

        <a
          role="tab"
          onClick={() => updateActiveTab('video')}
          className={classnames({ tab: true, 'tab-active': isTabActive('video') })}
        >Videos</a>
      </div>

      {activeTab === 'posts' && <div>
        <div className="flex flex-col gap-4">
          {(posts || []).map(item => <div key={item.uuid}>
            <ContentDefault data={item} showLinkToCreator={ showLinkToCreator } subscribeCallback={ subscribeCallback } zoomable={ true } />
          </div>)}
        </div>

        <div className="flex justify-center mt-4 text-sm text-zinc-500">That's all for posts</div>
      </div>}

      {activeTab === 'photo' && <div>
        <div className="grid grid-cols-3 gap-0.5">
          {(photos || []).map(item => {
            return <Link
              to={`${prefix}/creator/${creator.login}/${item.postUuid}`}
              key={item.uuid}
            >
              <img
                src={ `${cdn}/${item?.none200 || item.blur200}` }
                className="w-full"
                alt="photo"
              />
            </Link>;
          })}
        </div>

        <div className="flex justify-center mt-4 text-sm text-zinc-500">That's all for photos</div>
      </div>}

      {activeTab === 'video' && <div>
        <div className="grid grid-cols-3 gap-0.5">
          {(videos || []).map(item => {
            return <Link
              to={`${prefix}/creator/${creator.login}/${item.postUuid}`}
              key={item.uuid}
            >
              <img
                src={ `${cdn}/${item?.none200 || item.blur200}` }
                className="w-full"
                alt="videos"
              />
            </Link>;
          })}
        </div>

        <div className="flex justify-center mt-4 text-sm text-zinc-500">That's all for videos</div>
      </div>}
    </div>}
  </>;
};

export default CreatorContent;
