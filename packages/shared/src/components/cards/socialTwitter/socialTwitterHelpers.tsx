import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { Post } from '../../../graphql/posts';
import { UNKNOWN_SOURCE_ID } from '../../../lib/utils';
import { fallbackImages } from '../../../lib/config';
import { sanitizeMessage } from '../../../features/onboarding/shared';

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

const getLanguagePrimarySubtag = (language?: string): string | undefined =>
  language?.toLowerCase().split(/[-_]/)[0].trim();

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

export const normalizeThreadBody = ({
  title,
  content,
  contentHtml,
}: {
  title?: string;
  content?: string;
  contentHtml?: string;
}): string | undefined => {
  const rawBody =
    content || (contentHtml ? sanitizeMessage(contentHtml, []) : null);
  if (!rawBody) {
    return undefined;
  }

  const trimmedBody = rawBody.trim();
  if (!trimmedBody.length) {
    return undefined;
  }

  const trimmedTitle = title?.trim();
  if (!trimmedTitle?.length) {
    return trimmedBody;
  }

  if (!trimmedBody.startsWith(trimmedTitle)) {
    return trimmedBody;
  }

  const bodyWithoutTitle = trimmedBody
    .slice(trimmedTitle.length)
    .replace(/^[\s\n\r:.-]+/, '')
    .trim();

  return bodyWithoutTitle || undefined;
};

interface SocialTwitterCardData {
  normalizedContent: string;
  hasTitleCommentary: boolean;
  hasDailyDevMarkdown: boolean;
  socialTextDirectionProps: { dir: 'rtl' | 'auto'; lang?: string };
}

export const useSocialTwitterCardData = (post: Post): SocialTwitterCardData => {
  const normalizedContent = useMemo(
    () =>
      (
        post.content ||
        (post.contentHtml ? sanitizeMessage(post.contentHtml, []) : '')
      ).trim(),
    [post.content, post.contentHtml],
  );

  const rawTitle = (post.title || post.sharedPost?.title)?.trim() ?? '';
  const sharedTitle = post.sharedPost?.title?.trim() ?? '';

  const hasTitleCommentary =
    post.subType !== 'repost' &&
    !!rawTitle &&
    !!sharedTitle &&
    !sharedTitle.startsWith(rawTitle);

  const hasDailyDevMarkdown =
    (post.subType === 'thread' && !!normalizedContent) ||
    (!!post.sharedPost && (!!normalizedContent || hasTitleCommentary));

  const socialTextDirectionProps = getSocialTextDirectionProps(post.language);

  return {
    normalizedContent,
    hasTitleCommentary,
    hasDailyDevMarkdown,
    socialTextDirectionProps,
  };
};
