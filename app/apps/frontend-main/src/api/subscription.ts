import { Axios } from 'axios';

export const methodsSubscription = (axios: Axios) => ({
  getForUser: () => axios.get('/subscription'),
  getOne: (login: string) => axios.get(`/subscription/${login}`),
  change: (login: string, level?: number) => axios.patch(`/subscription/${login}`, { level }),
  notification: (login: string) => axios.patch(`/subscription/${login}/notification`),
});
