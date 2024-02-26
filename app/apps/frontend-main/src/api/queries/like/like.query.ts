import { useMutation } from '@tanstack/react-query';
import api from '@/api';


export function useLikeSet () {
  return useMutation({
    mutationFn: api.like.set,
    onSuccess: ({ postUuid, isLiked }, { onSuccess, uuid, newIsLiked }) =>
      postUuid === uuid && isLiked !== newIsLiked && onSuccess(() => isLiked),
  });
}
