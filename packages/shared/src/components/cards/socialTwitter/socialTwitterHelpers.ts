import type { Post } from '../../../graphql/posts';
import { UNKNOWN_SOURCE_ID } from '../../../lib/utils';

const resolveHandle = (
  sourceId?: string,
  creatorTwitter?: string,
  fallbackHandle?: string,
  sourceHandle?: string,
): string | undefined =>
  sourceId === UNKNOWN_SOURCE_ID
    ? creatorTwitter || fallbackHandle
    : sourceHandle;

export const getSocialTwitterMetadata = (post: Post) => {
  const sourceHandle = resolveHandle(
    post.source?.id,
    post.creatorTwitter,
    post.author?.username,
    post.source?.handle,
  );

  const sharedPostHandle = resolveHandle(
    post.sharedPost?.source?.id,
    post.sharedPost?.creatorTwitter || post.creatorTwitter,
    post.sharedPost?.author?.username,
    post.sharedPost?.source?.handle,
  );

  const repostedByName =
    (post.source?.name?.toLowerCase() !== UNKNOWN_SOURCE_ID &&
      post.source?.name) ||
    post.author?.name ||
    post.creatorTwitterName;

  const metadataHandles =
    post.subType === 'repost'
      ? [sourceHandle].filter(Boolean)
      : [...new Set([sourceHandle, sharedPostHandle].filter(Boolean))];

  const embeddedTweetDisplayName =
    (post.sharedPost?.source?.name?.toLowerCase() !== UNKNOWN_SOURCE_ID &&
      post.sharedPost?.source?.name) ||
    post.sharedPost?.author?.name ||
    post.sharedPost?.creatorTwitterName ||
    post.creatorTwitterName;

  const embeddedTweetIdentity = [embeddedTweetDisplayName, sharedPostHandle]
    .filter(Boolean)
    .map((value, index) => (index === 1 ? `@${value}` : value))
    .join(' ');

  const embeddedTweetAvatarUser = {
    id:
      post.sharedPost?.author?.id ||
      post.sharedPost?.source?.id ||
      sharedPostHandle ||
      'shared-post-avatar',
    image:
      post.sharedPost?.author?.image ||
      post.sharedPost?.source?.image ||
      post.sharedPost?.creatorTwitterImage,
    username: sharedPostHandle,
    name: embeddedTweetDisplayName,
  };

  return {
    sourceHandle,
    sharedPostHandle,
    repostedByName,
    metadataHandles,
    embeddedTweetDisplayName,
    embeddedTweetIdentity,
    embeddedTweetAvatarUser,
  };
};
