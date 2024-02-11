import { FC } from 'react';
import { useParams } from 'react-router-dom';

import ContentEdit from '@/components/content/edit.tsx';

const PageCreatorManagePostNew: FC = () => {
  const { uuid } = useParams();
  return <ContentEdit uuid={ uuid } />;
};

export default PageCreatorManagePostNew;
