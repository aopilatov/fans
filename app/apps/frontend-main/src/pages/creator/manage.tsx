import { FC, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores';
import { jwtDecode } from 'jwt-decode';

import EmptyLayout from '@/layouts/empty.layout.tsx';

const PageCreatorManage: FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    if (!token) {
      setIsAuthorized(() => false);
    } else {
      const decodedToken = jwtDecode<any>(token);
      if (!decodedToken?.sub || !decodedToken?.creator) {
        setIsAuthorized(() => false);
      } else {
        setIsAuthorized(() => true);
      }
    }
  }, [token]);

  return <EmptyLayout>
    { token && isAuthorized && <Outlet /> }
    { token && !isAuthorized && <p>Authorization failed</p> }
  </EmptyLayout>;
};

export default PageCreatorManage;
