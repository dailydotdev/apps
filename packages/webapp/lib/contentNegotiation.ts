/**
 * Accept-header content negotiation for AI crawlers.
 *
 * Runs in middleware (edge runtime), so this module must stay free of Node
 * APIs and heavy imports.
 */

const MARKDOWN_MEDIA_TYPES = ['text/markdown', 'text/x-markdown'];
const HTML_MEDIA_TYPE = 'text/html';

interface MediaRange {
  type: string;
  quality: number;
}

const parseAccept = (header: string): MediaRange[] =>
  header
    .split(',')
    .map((part) => {
      const [rawType, ...params] = part.trim().split(';');
      const type = rawType.trim().toLowerCase();
      const qParam = params
        .map((param) => param.trim().toLowerCase())
        .find((param) => param.startsWith('q='));
      const parsed = qParam ? Number.parseFloat(qParam.slice(2)) : 1;

      return {
        type,
        quality: Number.isNaN(parsed) ? 1 : parsed,
      };
    })
    .filter(({ type }) => !!type);

const bestQuality = (ranges: MediaRange[], types: string[]): number =>
  Math.max(
    0,
    ...ranges.filter(({ type }) => types.includes(type)).map((r) => r.quality),
  );

/**
 * True when the client explicitly asked for markdown and did not rank HTML
 * higher. Wildcard ranges deliberately do not count: browsers rank HTML first
 * and fall back to a wildcard, and curl sends nothing but a wildcard, so
 * honouring them would serve markdown to everyone. Clients that cannot set
 * the header use the `.md` URL instead.
 */
export const acceptsMarkdown = (header?: string | null): boolean => {
  if (!header) {
    return false;
  }

  const ranges = parseAccept(header);
  const markdownQuality = bestQuality(ranges, MARKDOWN_MEDIA_TYPES);

  if (markdownQuality <= 0) {
    return false;
  }

  return markdownQuality >= bestQuality(ranges, [HTML_MEDIA_TYPE]);
};
