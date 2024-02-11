import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { store } from '@/stores';
import api from '@/api';
import _ from 'lodash';

const PageAuthCreator: FC = () => {
  const navigate = useNavigate();
  const prefix = _.get(window, 'prefix.value', '');

  let { uuid, creator, check, url } = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>(null);

  useEffect(() => {
    if (import.meta.env.DEV && uuid === 'dev' && creator === 'dev' && check === 'dev') {
      uuid = '94d259ec-755e-4029-9614-3a6d88da46ef';
      creator = '0523fda3-154d-44cf-bf43-ee63f0f847a8';
      check = 'ceaa4c88869684e6efa4f7e8f438219f20022a4733579d430053545f65a515ec62d5a05b875b1005f0775e6282e55d0e11262fa13eaf95966e380439c4d6d5cb';
    }

    getToken();
  }, []);

  const getToken = () => {
    setIsLoading(() => true);
    api.creator.auth(uuid, creator, check)
      .then(data => {
        const token = _.get(data, 'token');
        store.dispatch({ type: 'auth/setToken', payload: token });
        navigate(`${prefix}/${decodeURIComponent(url)}`); // creator%2Fmanage%2Fpost%2Fnew
      })
      .catch(err => setError(() => err.message))
      .finally(() => setIsLoading(() => false));
  };

  return <div className="w-full h-full flex justify-center items-center">
    { isLoading && <>Loading...</> }
    { !isLoading && error && <>{error}</> }
  </div>;
};

export default PageAuthCreator;
