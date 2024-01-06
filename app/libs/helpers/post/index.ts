import { PostContent, PostType } from '@fans/types';

export function getContentType(content: PostContent): PostType {
  if (content?.video?.length > 0) return PostType.VIDEO;
  if (content?.image?.length > 0) return PostType.IMAGE;
  return PostType.TEXT;
}
