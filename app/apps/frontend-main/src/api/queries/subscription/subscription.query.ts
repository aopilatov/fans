import api from '@/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { Subscription } from '@fans/types';
import _ from 'lodash';

export const QUERY_SUBSCRIPTION_FOR_USER = 'QUERY_SUBSCRIPTION_FOR_USER';
export const QUERY_SUBSCRIPTION_ONE = 'QUERY_SUBSCRIPTION_ONE';


export function useSubscriptionGetForUser () {
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: [QUERY_SUBSCRIPTION_FOR_USER],
    queryFn: api.subscription.getForUser,
    select: (data) => data?.listOfCreators || [],
  });
  return { isLoading, isError, data, error, refetch };
}

export function useSubscriptionGetOne (login: string) {
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: [QUERY_SUBSCRIPTION_ONE, login],
    queryFn: () => api.subscription.getOne(login),
    enabled: !!login,
  });
  return { isLoading, isError, data, error, refetch };
}

export function useSubscriptionChange () {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.subscription.change,
    onMutate: ({ setIsLoading }) => setIsLoading(() => true),
    onSuccess: (data, { data: { login } }) => {
      queryClient.setQueryData(
        [QUERY_SUBSCRIPTION_ONE, login],
        (cash: AxiosResponse<Subscription>) =>
          ({
            ...cash,
            isSubscribed: data?.subscription !== undefined ? data?.subscription : true,
            level: data?.level || 1,
          }),
      );
    },
    onSettled: (_, __, { setIsLoading }) => setIsLoading(() => false),
  });
}

export function useNotificationChange () {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.subscription.notification,
    onSuccess: (data) => {
      queryClient.setQueryData(
        [QUERY_SUBSCRIPTION_ONE],
        (cash: AxiosResponse<Subscription>) => {
          const sub = _.clone(data);
          _.set(sub, 'isNotificationTurnedOn', data?.isNotificationTurnedOn || false);
          return ({
            ...cash,
            data: sub,
          });
        },
      );
    },
    onSettled: (_, __, { onSettled }) => onSettled(),
  });
}
