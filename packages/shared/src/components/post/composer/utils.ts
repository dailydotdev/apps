import type { ExternalLinkPreview } from '../../../graphql/posts';
import { urlStartRegexMatch } from '../../../lib/links';

export const normalizeComposerUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  return urlStartRegexMatch.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const isPreviewForComposerUrl = (
  preview: ExternalLinkPreview | undefined,
  value: string,
): boolean => {
  const normalized = normalizeComposerUrl(value);
  if (!normalized || !preview?.title) {
    return false;
  }

  return [preview.url, preview.finalUrl, preview.permalink].includes(
    normalized,
  );
};
