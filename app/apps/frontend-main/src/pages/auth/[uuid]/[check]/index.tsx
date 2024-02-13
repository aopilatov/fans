import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { store } from '@/stores';
import api from '@/api';
import _ from 'lodash';

const PageAuth: FC = () => {
  const navigate = useNavigate();
  const prefix = _.get(window, 'prefix.value', '');

  let { uuid, check } = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>(null);


  useEffect(() => {
    if (import.meta.env.DEV && uuid === 'dev' && check === 'dev') {
      uuid = '8b77a8ec-f4ed-4936-ad95-6816050f4ce0';
      check = '00deb6e8154858d3757426933f1fa3b6d9550f53d2a86000954fab93226d456b3d0e3db98ca70832830f84893fedbc7b8c47fcdfa446f84384cc33cceaa8afd8';
    }

    getToken();
  }, []);

  const getToken = () => {
    setIsLoading(() => true);
    api.user.auth(uuid, check)
      .then(data => {
        const token = _.get(data, 'token');
        store.dispatch({ type: 'auth/setToken', payload: token });
        navigate(`${prefix}/`);
      })
      .catch(err => setError(() => err.message))
      .finally(() => setIsLoading(() => false));
  };

  return <div className="w-full h-full flex justify-center items-center">
    { isLoading && <>Loading...</> }
    { !isLoading && error && <>{error}</> }
  </div>;
};

export default PageAuth;
