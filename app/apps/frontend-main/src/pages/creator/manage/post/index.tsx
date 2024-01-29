import { FC, useEffect, useState } from 'react';
import { Post } from '@fans/types';
import api from '@/api';

import ContentForCreator from '@/components/content/forCreator.tsx';

const PageCreatorManagePost: FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(() => true);
    api.post.listFull()
      .then(data => {
        setPosts(() => data as any);
      })
      .finally(() => {
        setIsLoading(() => false);
      });
  };

  return <div className="p-4 flex flex-col gap-4">
    { isLoading && <div className="w-full flex justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div> }

    { !isLoading && posts && posts.map(item => <ContentForCreator
      key={ item.uuid }
      data={ item }
    />) }
  </div>;
};

export default PageCreatorManagePost;
