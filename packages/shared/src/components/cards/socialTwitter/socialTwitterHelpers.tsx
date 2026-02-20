import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { UNKNOWN_SOURCE_ID } from '../../../lib/utils';
import { fallbackImages } from '../../../lib/config';
import { IconSize } from '../../Icon';
import { TwitterIcon } from '../../icons';
import { Separator } from '../common/common';

/**
 * Resolve a field based on whether the source is the unknown placeholder.
 * - unknown source → creator value only
 * - known source   → source value, fallback to creator value
 */
const resolveBySource = <T,>(
  sourceId: string | undefined,
  sourceValue: T | undefined,
  creatorValue: T | undefined,
): T | undefined =>
  sourceId === UNKNOWN_SOURCE_ID ? creatorValue : sourceValue || creatorValue;

export const getSocialTwitterMetadata = (post: Post) => {
  const sourceHandle = resolveBySource(
    post.source?.id,
    post.source?.handle,
    post.creatorTwitter,
  );

  const sharedPostHandle = resolveBySource(
    post.sharedPost?.source?.id,
    post.sharedPost?.source?.handle,
    post.sharedPost?.creatorTwitter || post.creatorTwitter,
  );

  const repostedByName = resolveBySource(
    post.source?.id,
    post.source?.name,
    post.author?.name || post.creatorTwitterName,
  );

  const metadataHandles =
    post.subType === 'repost'
      ? [sourceHandle].filter(Boolean)
      : [...new Set([sourceHandle, sharedPostHandle].filter(Boolean))];

  const embeddedTweetDisplayName = resolveBySource(
    post.sharedPost?.source?.id,
    post.sharedPost?.source?.name,
    post.sharedPost?.author?.name ||
      post.sharedPost?.creatorTwitterName ||
      post.creatorTwitterName,
  );

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
      resolveBySource(
        post.sharedPost?.source?.id,
        post.sharedPost?.author?.image || post.sharedPost?.source?.image,
        post.sharedPost?.creatorTwitterImage,
      ) || fallbackImages.avatar,
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

export const getSocialTwitterMetadataLabel = ({
  isRepostLike,
  repostedByName,
  metadataHandles,
}: {
  isRepostLike?: boolean;
  repostedByName?: string | false;
  metadataHandles: string[];
}): ReactElement => {
  if (isRepostLike && repostedByName) {
    return (
      <span className="inline-flex h-4 items-center gap-1 align-middle leading-4">
        <span>{repostedByName} reposted</span>
        <TwitterIcon
          className="relative top-px text-text-tertiary"
          size={IconSize.XXSmall}
        />
      </span>
    );
  }

  if (metadataHandles.length === 1 && repostedByName) {
    return (
      <span className="inline-flex h-4 items-center gap-1 align-middle leading-4">
        <span>{repostedByName}</span>
        <TwitterIcon
          className="relative top-px text-text-tertiary"
          size={IconSize.XXSmall}
        />
      </span>
    );
  }

  return (
    <>
      {metadataHandles.map((handle, index) => (
        <React.Fragment key={handle}>
          {index > 0 && <Separator />}@{handle}
        </React.Fragment>
      ))}
    </>
  );
};
