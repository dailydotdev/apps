import { getWebappHost } from './contextLink';

export type DmTextSegment =
  | { type: 'text'; text: string }
  | { type: 'link'; url: string };

const urlRegex = /https?:\/\/[^\s<>"]+/g;
const trailingPunctuation = /[.,;:!?'"]$/;

const count = (value: string, char: string): number =>
  value.split(char).length - 1;

// "see (https://x.dev/a)." shouldn't take the ")" or the "." with it, but a
// URL with its own parentheses keeps the closing one.
const trimUrl = (url: string): string => {
  let trimmed = url;

  for (;;) {
    const last = trimmed.slice(-1);
    const isUnbalanced =
      (last === ')' && count(trimmed, ')') > count(trimmed, '(')) ||
      (last === ']' && count(trimmed, ']') > count(trimmed, '['));

    if (!trailingPunctuation.test(trimmed) && !isUnbalanced) {
      return trimmed;
    }

    trimmed = trimmed.slice(0, -1);
  }
};

export const splitLinks = (text: string): DmTextSegment[] => {
  const segments: DmTextSegment[] = [];
  let cursor = 0;

  Array.from(text.matchAll(urlRegex)).forEach((match) => {
    const url = trimUrl(match[0]);

    if (match.index > cursor) {
      segments.push({ type: 'text', text: text.slice(cursor, match.index) });
    }

    segments.push({ type: 'link', url });
    cursor = match.index + url.length;
  });

  if (cursor < text.length) {
    segments.push({ type: 'text', text: text.slice(cursor) });
  }

  return segments;
};

// Listing pages that live under /posts too.
const postListPaths = new Set(['best-of', 'discussed', 'latest', 'upvoted']);

// The id or slug of a daily.dev post the URL points at, so the thread can show
// the post instead of a bare link.
export const getPostIdFromUrl = (
  url: string,
  webappHost = getWebappHost(),
): string | undefined => {
  try {
    const { protocol, host, pathname } = new URL(url);
    const [, id] = pathname.match(/^\/posts\/([\w-]+)\/?$/) ?? [];

    if (
      !webappHost ||
      host !== webappHost ||
      !['http:', 'https:'].includes(protocol) ||
      !id ||
      postListPaths.has(id)
    ) {
      return undefined;
    }

    return id;
  } catch {
    return undefined;
  }
};

export const findPostIdInText = (
  text: string,
  webappHost = getWebappHost(),
): string | undefined =>
  splitLinks(text).reduce<string | undefined>(
    (found, segment) =>
      found ??
      (segment.type === 'link'
        ? getPostIdFromUrl(segment.url, webappHost)
        : undefined),
    undefined,
  );
