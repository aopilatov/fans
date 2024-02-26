import axios from 'axios';
import { store } from '@/stores';
import _ from 'lodash';

import { methodsUser } from './queries/user';
import { methodsCreator } from './queries/creator';
import { methodsMedia } from './queries/media';
import { methodsPost } from './queries/post';
import { methodsSubscription } from './queries/subscription';
import { methodsLike } from './queries/like';

const instance = axios.create({ baseURL: '/api' });

instance.interceptors.request.use((req) => {
  if (store.getState().auth.token) {
    req.headers['X-Authorization'] = store.getState().auth.token;
  }

  return req;
}, (err) => {
  console.error(err);
});

instance.interceptors.response.use((res) => {
  return _.get(res, 'data', {});
}, (err) => {
  const data = _.get(err, 'response.data', {});
  throw new Error(data?.message || 'Unhandled error');
});

const rest = {
  user: methodsUser(instance),
  creator: methodsCreator(instance),
  media: methodsMedia(instance),
  post: methodsPost(instance),
  subscription: methodsSubscription(instance),
  like: methodsLike(instance),
};

export default rest;
