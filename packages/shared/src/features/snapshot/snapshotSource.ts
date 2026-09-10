import type { Post } from '../../graphql/posts';

/**
 * The API's catch-all source for a link it could not attribute: handle and
 * name are both the literal string "unknown", over a squad placeholder
 * avatar. In the product's own header that placeholder is small and passes as
 * chrome; printed as the sole credit on an image someone sends out it reads
 * as a bug.
 */
const UNKNOWN_SOURCE = 'unknown';

/** Who to credit on a share image, or nobody rather than a placeholder. */
export function snapshotSource(
  post: Pick<Post, 'source' | 'domain'>,
): { name: string; image?: string } | undefined {
  const { source, domain } = post;

  if (!source?.name || source.name === UNKNOWN_SOURCE) {
    // The domain is what the reader would recognise anyway, and it is the one
    // fact an unattributed link still carries.
    return domain ? { name: domain } : undefined;
  }

  return { name: source.name, image: source.image };
}
