import { Axios } from 'axios';
import { Media, Post } from '@fans/types';

type QueryPayload = {
  data: {
    uuid?: string
    level: number
    text?: string
    images?: string[]
    videos?: string[]
  }
  onSuccess?: () => void
  onSettled: () => void
}

export const methodsPost = (axios: Axios) => ({
  create: ({ data }: QueryPayload) => axios.post(`/post`, { ...data }),
  edit: ({ data }: QueryPayload) => axios.put(`/post`, { ...data }),

  getFull: (uuid: string): Promise<{
    uuid: string
    level: number
    content?: {
      text: string
      image: Media[]
      video: Media[]
    }
  }> => axios.get(`/post/full/${uuid}`),
  listFull: (): Promise<Post[]> => axios.get(`/post/full`),
  get: (login: string, uuid: string): Promise<Post> => axios.get(`/post/${login}/${uuid}`),
  list: (login: string): Promise<Post[]> => axios.get(`/post/${login}`),
  listPhotos: (login: string): Promise<Record<string, any>[]> => axios.get(`/post/${login}/photos`),
  listVideos: (login: string): Promise<Record<string, any>[]> => axios.get(`/post/${login}/videos`),
  export: (login: string, uuid: string) => axios.get(`/post/${login}/${uuid}/export`),
  feed: (): Promise<Post[]> => axios.get(`/post/feed`),
});
