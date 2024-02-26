import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/api';
import _ from 'lodash';
import { store } from '@/stores';
import { useNavigate } from 'react-router-dom';

export const QUERY_CREATOR = 'QUERY_CREATOR';

export function useCreatorAuth () {
  const navigate = useNavigate();
  const prefix = _.get(window, 'prefix.value', '');

  return useMutation({
    mutationFn: api.creator.auth,
    onMutate: ({ setIsLoading }) => setIsLoading(() => true),
    onSuccess: (data, { url }) => {
      const token = _.get(data, 'token');
      store.dispatch({ type: 'auth/setToken', payload: token });
      navigate(`${prefix}/${decodeURIComponent(url)}`); // creator%2Fmanage%2Fpost%2Fnew
      return data;
    },
    onError: ({ message }, { onError }) => onError(message),
    onSettled: (_, __, { setIsLoading }) => setIsLoading(() => false),
  });
}

export function useCreatorGet (login: string) {
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: [QUERY_CREATOR, login],
    queryFn: () => api.creator.get(login),
    enabled: !!login,
  });
  return { isLoading, isError, data, error, refetch };
}

export function useCreatorSearch () {
  return useMutation({
    mutationFn: api.creator.search,
    onMutate: ({ setIsLoading }) => setIsLoading(() => true),
    onSuccess: (data, { setResults }) => {
      setResults(() => data?.listOfCreators || []);
      return data;
    },
    onError: ({ message }, { onError }) => onError(message),
    onSettled: (_, __, { setIsLoading }) => setIsLoading(() => false),
  });
}
