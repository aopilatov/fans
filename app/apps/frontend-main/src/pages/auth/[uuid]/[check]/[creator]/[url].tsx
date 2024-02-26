import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCreatorAuth } from '@/api/queries/creator';

const PageAuthCreator: FC = () => {
  const param = useParams();
  let { uuid, creator, check } = param;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>(null);

  const mutation = useCreatorAuth();

  useEffect(() => {
    if (import.meta.env.DEV && uuid === 'dev' && creator === 'dev' && check === 'dev') {
      uuid = '83d3d816-deed-43c1-916c-47ed54cac846';
      check = '0aa8220e7b77874585147b45b7817d07d1a8445a9352b33de7e91cb99eddbb44646bf2c6485c37b37e70a3dd6881109d598f3634a5c79586784b63840f7f5033';
      creator = '956417c0-f5b7-4974-a763-4e0888c82aa6';
    }
    mutation.mutate({ data: { uuid, check, creator }, url: param.url, onError: setError, setIsLoading });
  }, []);

  return <div className="w-full h-full flex justify-center items-center">
    { isLoading && <>Loading...</> }
    { !isLoading && error && <>{error}</> }
  </div>;
};

export default PageAuthCreator;
