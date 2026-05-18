import type { ExternalLinkPreview } from '../../../graphql/posts';
import { urlParseSchema } from '../../../lib/links';

export const normalizeComposerUrl = (value: string): string => {
  const result = urlParseSchema.safeParse(value.trim());
  return result.success ? result.data : '';
};

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
