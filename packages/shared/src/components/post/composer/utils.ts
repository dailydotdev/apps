import type { ExternalLinkPreview } from '../../../graphql/posts';
import { parseHttpUrl } from '../../../lib/links';

export const normalizeComposerUrl = (value: string): string =>
  parseHttpUrl(value.trim()) ?? '';

export const normalizeSingleLineComposerText = (value: string): string =>
  value.replace(/\s*[\r\n]+\s*/g, ' ');

export const isPreviewForComposerUrl = (
  preview: ExternalLinkPreview | undefined,
  value: string,
): boolean => {
  const normalized = normalizeComposerUrl(value);
  if (!normalized || !preview?.title) {
    return false;
  }

  return [preview.url, preview.finalUrl, preview.permalink]
    .filter((url): url is string => !!url)
    .map(normalizeComposerUrl)
    .includes(normalized);
};
