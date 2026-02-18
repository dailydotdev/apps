import { cloudinarySquadsImageFallback } from './image';
import { fallbackImages } from './config';
import { stripHtmlTags } from './strings';

export const UNKNOWN_SOURCE_ID = 'unknown';

export const EMBEDDED_TWEET_AVATAR_FALLBACK = fallbackImages.avatar.replace(
  't_logo,',
  '',
);

export const isSquadPlaceholderAvatar = (image?: string): boolean =>
  !!image &&
  (image === cloudinarySquadsImageFallback ||
    image.includes('squad_placeholder'));

export const getSocialPostText = ({
  content,
  contentHtml,
  formatHtml = stripHtmlTags,
}: {
  content?: string;
  contentHtml?: string;
  formatHtml?: (value: string) => string;
}): string | undefined => {
  const rawText = content || (contentHtml ? formatHtml(contentHtml) : null);
  const trimmedText = rawText?.trim();
  return trimmedText?.length ? trimmedText : undefined;
};

export const formatHandleAsDisplayName = (handle: string): string =>
  handle
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const removeHandlePrefixFromTitle = ({
  title,
  sourceHandle,
  authorHandle,
}: {
  title?: string;
  sourceHandle?: string;
  authorHandle?: string;
}): string | undefined => {
  if (!title) {
    return title;
  }

  const handlePrefixes = [sourceHandle, authorHandle]
    .filter(Boolean)
    .map((handle) => `@${handle}:`);

  const matchedPrefix = handlePrefixes.find((prefix) =>
    title.startsWith(prefix),
  );
  if (matchedPrefix) {
    return title.slice(matchedPrefix.length).trim();
  }

  return title.replace(/^@[A-Za-z0-9_]+:\s*/, '').trim();
};
