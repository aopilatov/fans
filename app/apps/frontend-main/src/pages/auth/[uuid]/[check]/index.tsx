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
      uuid = '15cdec49-ef52-416a-9842-ed4956ecd40f';
      check = '48f385efbb15861953bf66acc384812d09e3fcda18f811ffe763d293aba65821e498919e9672efd8ef8f06976989a481db0d814538f2e00266fc5490257604a8';
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
