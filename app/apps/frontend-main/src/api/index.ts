import axios from 'axios';
import _ from 'lodash';

import { methodsUser } from './user.ts';

const instance = axios.create({ baseURL: '/api' });
instance.interceptors.response.use((res) => {
  return _.get(res, 'data', {});
}, (err) => {
  const data = _.get(err, 'response.data', {});
  throw new Error(data?.message || 'Unhandled error');
});

const rest = {
  user: methodsUser(instance),
};

export default rest;
