import type { Redirect } from 'next';

export const getCanonicalTagRedirect = (
  tag: string,
  subpath = '',
): Redirect | null => {
  const canonicalTag = tag.toLowerCase();

  if (canonicalTag === tag) {
    return null;
  }

  return {
    destination: `/tags/${encodeURIComponent(canonicalTag)}${subpath}`,
    permanent: true,
  };
};
