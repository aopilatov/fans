import { FC } from 'react';

import ContentForCreator from '@/components/content/forCreator.tsx';
import { usePostGetList } from '@/api/queries/post';

const PageCreatorManagePost: FC = () => {
  const { data, isLoading } = usePostGetList();

  return <div className="p-4 flex flex-col gap-4">
    { isLoading && <div className="w-full flex justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div> }

    { !isLoading && data?.length && data.map(item => <ContentForCreator
      key={ item.uuid }
      data={ item }
    />) }
  </div>;
};

export default PageCreatorManagePost;
