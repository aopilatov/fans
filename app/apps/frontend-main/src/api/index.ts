import axios from 'axios';
import { store } from '@/stores';
import _ from 'lodash';

import { methodsUser } from './user.ts';
import { methodsCreator } from './creator.ts';
import { methodsMedia } from './media.ts';
import { methodsPost } from './post.ts';
import { methodsSubscription } from './subscription.ts';

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
};

export default rest;
