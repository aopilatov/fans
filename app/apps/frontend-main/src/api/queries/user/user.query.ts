import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/api';
import _ from 'lodash';
import { store } from '@/stores';
import { useNavigate } from 'react-router-dom';

export const QUERY_USER = 'QUERY_USER';

export function useUserAuth () {
  const navigate = useNavigate();
  const prefix = _.get(window, 'prefix.value', '');

  return useMutation({
    mutationFn: api.user.auth,
    onMutate: ({ setIsLoading }) => setIsLoading(() => true),
    onSuccess: (data) => {
      const token = _.get(data, 'token');
      store.dispatch({ type: 'auth/setToken', payload: token });
      navigate(`${prefix}/`);
      return data;
    },
    onError: ({ message }, { onError }) => onError(message),
    onSettled: (_, __, { setIsLoading }) => setIsLoading(() => false),
  });
}

export function useUserGetSelf () {
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: [QUERY_USER],
    queryFn: api.user.getSelf,
  });
  return { isLoading, isError, data, error, refetch };
}
