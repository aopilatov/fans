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
      uuid = 'c49ef724-bcfb-4c6a-bd04-d039f8b5244f';
      creator = '85039cab-b4df-4585-8758-6a2fc081c45b';
      check = 'ae522f247bfb9d94352d16d9280c8b5639616a9e7408ecfbbc21a46bcdcb254d1974c41994c0c5913cfe4b66a691d2959d468e3d80e8cdb1f7cbaf7708b8126a';
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
