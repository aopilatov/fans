import api from '@/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import { Dispatch } from '@/stores';
import { useNavigate } from 'react-router-dom';

export const QUERY_POST_GET_FULL = 'POST_GET_FULL';
export const QUERY_POST_LIST_FULL = 'POST_LIST_FULL';
export const QUERY_POST_GET = 'POST_GET';
export const QUERY_POST_LIST = 'POST_LIST';
export const QUERY_POST_LIST_PHOTOS = 'POST_LIST_PHOTOS';
export const QUERY_POST_LIST_VIDEOS = 'POST_LIST_VIDEOS';
export const QUERY_POST_EXPORT = 'POST_EXPORT';
export const QUERY_POST_FEED = 'POST_FEED';

export function usePostCreate () {
  const navigate = useNavigate();
  const dispatch = useDispatch<Dispatch>();
  const prefix = _.get(window, 'prefix.value', '');

  return useMutation({
    mutationFn: api.post.create,
    onSuccess: (_, { onSuccess }) => {
      onSuccess();
      dispatch.app.toast({ type: 'success', message: 'Successfully saved' });
      navigate(`${prefix}/creator/manage/post`);
    },
    onSettled: (_, __, { onSettled }) => onSettled(),
  });
}

export function usePostEdit () {
  const navigate = useNavigate();
  const dispatch = useDispatch<Dispatch>();
  const prefix = _.get(window, 'prefix.value', '');

  return useMutation({
    mutationFn: api.post.edit,
    onSuccess: (_, { onSuccess }) => {
      onSuccess();
      dispatch.app.toast({ type: 'success', message: 'Successfully saved' });
      navigate(`${prefix}/creator/manage/post`);
    },
    onSettled: (_, __, { onSettled }) => onSettled(),
  });
}


export function usePostGetFull (uuid: string) {
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: [QUERY_POST_GET_FULL, uuid],
    queryFn: () => api.post.getFull(uuid),
    enabled: !!uuid,
  });
  return { isLoading, isError, data, error, refetch };
}

export function usePostGetList () {
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: [QUERY_POST_LIST_FULL],
    queryFn: api.post.listFull,
  });
  return { isLoading, isError, data, error, refetch };
}

export function usePostGet (login: string, uuid: string) {
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: [QUERY_POST_GET, login, uuid],
    queryFn: () => api.post.get(login, uuid),
    enabled: !!(login.length && uuid.length),
  });
  return { isLoading, isError, data, error, refetch };
}

export function usePostList (login: string) {
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: [QUERY_POST_LIST, login],
    queryFn: () => api.post.list(login),
    enabled: !!login,
  });
  return { isLoading, isError, data, error, refetch };
}

export function usePostListPhotos (login: string) {
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: [QUERY_POST_LIST_PHOTOS, login],
    queryFn: () => api.post.listPhotos(login),
    enabled: !!login,
  });
  return { isLoading, isError, data, error, refetch };
}

export function usePostListVideos (login: string) {
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: [QUERY_POST_LIST_VIDEOS, login],
    queryFn: () => api.post.listVideos(login),
    enabled: !!login,
  });
  return { isLoading, isError, data, error, refetch };
}

export function usePostExport (login: string, uuid: string, enabled = true) {
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: [QUERY_POST_EXPORT, login, uuid],
    queryFn: () => api.post.export(login, uuid),
    enabled,
  });
  return { isLoading, isError, data, error, refetch };
}

export function usePostFeed () {
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: [QUERY_POST_FEED],
    queryFn: api.post.feed,
  });
  return { isLoading, isError, data, error, refetch };
}
