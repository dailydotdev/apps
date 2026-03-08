import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { UNKNOWN_SOURCE_ID } from '../../../lib/utils';
import { fallbackImages } from '../../../lib/config';

const rtlLanguageCodes = new Set([
  'ar',
  'dv',
  'fa',
  'he',
  'ku',
  'ps',
  'sd',
  'ug',
  'ur',
  'yi',
]);

export const socialTwitterTitlePattern = /^(.*?)\s+\(@([^)]+)\):\s*(.+)$/s;
export const repostedOnXPrefixPattern = /^.*?reposted on x\.\s*/i;

const getLanguagePrimarySubtag = (language?: string): string | undefined =>
  language?.toLowerCase().split(/[-_]/)[0].trim();

export const parseSocialTwitterTitle = (
  title?: string,
): RegExpMatchArray | null => title?.match(socialTwitterTitlePattern) ?? null;

export const stripRepostedOnXPrefix = (title?: string): string =>
  title?.replace(repostedOnXPrefixPattern, '').trim() ?? '';

export const getSocialTextDirection = (language?: string): 'rtl' | 'auto' => {
  const primarySubtag = getLanguagePrimarySubtag(language);
  if (!primarySubtag) {
    return 'auto';
  }

  return rtlLanguageCodes.has(primarySubtag) ? 'rtl' : 'auto';
};

export const getSocialTextDirectionProps = (
  language?: string,
): { dir: 'rtl' | 'auto'; lang?: string } => {
  const normalizedLanguage = language?.trim().toLowerCase();
  return {
    dir: getSocialTextDirection(normalizedLanguage),
    ...(normalizedLanguage && { lang: normalizedLanguage }),
  };
};

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

const getUniqueHandles = (handles: Array<string | undefined>): string[] => {
  const seenHandles = new Set<string>();

  return handles.filter((handle): handle is string => {
    if (!handle) {
      return false;
    }

    const normalizedHandle = handle.toLowerCase();
    if (seenHandles.has(normalizedHandle)) {
      return false;
    }

    seenHandles.add(normalizedHandle);
    return true;
  });
};

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
      : getUniqueHandles([sourceHandle, sharedPostHandle]);

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

export const getSocialTwitterMetadataLabel = (): ReactElement => (
  <span className="inline-flex h-4 items-center align-middle leading-4">
    From x.com
  </span>
);
