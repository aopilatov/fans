import { Axios } from 'axios';

export const methodsPost = (axios: Axios) => ({
  create: (level: number, text?: string, images?: string[], videos?: string[]) => axios.post(`/post`, { level, text, images, videos }),
  edit: (uuid: string, level: number, text?: string, images?: string[], videos?: string[]) => axios.put(`/post`, { uuid, level, text, images, videos }),
  getFull: (uuid: string) => axios.get(`/post/full/${uuid}`),
  listFull: () => axios.get(`/post/full`),
  get: (login: string, uuid: string) => axios.get(`/post/${login}/${uuid}`),
  list: (login: string) => axios.get(`/post/${login}`),
  listPhotos: (login: string) => axios.get(`/post/${login}/photos`),
  listVideos: (login: string) => axios.get(`/post/${login}/videos`),
  export: (login: string, uuid: string) => axios.get(`/post/${login}/${uuid}/export`),
});
