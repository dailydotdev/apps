import { webappUrl } from '../../lib/constants';
import { isValidHttpUrl } from '../../lib/links';

export const getWebappHost = (): string | undefined => {
  try {
    return new URL(webappUrl, globalThis.location?.origin).host;
  } catch {
    return globalThis.location?.host;
  }
};

// The comment reference arrives in a stanza the peer controls, so its link is
// only rendered when it is an http(s) URL on our own webapp. React would
// happily render a `javascript:` href.
export const getSafeCommentUrl = (
  url: string,
  webappHost = getWebappHost(),
): string | undefined => {
  if (!webappHost || !isValidHttpUrl(url)) {
    return undefined;
  }

  return new URL(url).host === webappHost ? url : undefined;
};
