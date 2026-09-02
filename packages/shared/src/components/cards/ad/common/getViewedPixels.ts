// Only our own ad server understands the viewed signal. Third party pixels are
// contracted to fire once per impression, so re-firing them would double count.
const ownPixelHost = 'api.daily.dev';

const isOwnPixel = (url: string): boolean => {
  try {
    return new URL(url).hostname === ownPixelHost;
  } catch {
    // A tracker we cannot parse is not ours to re-fire.
    return false;
  }
};

// Appended by hand rather than through `URL`, whose serializer percent-encodes
// the macro tokens (`[timestamp]`, `${CACHEBUSTER}`) and would leave nothing
// for `substituteMacros` to match.
const appendViewed = (url: string): string =>
  `${url}${url.includes('?') ? '&' : '?'}viewed=true`;

export const getViewedPixels = (pixel?: string[]): string[] =>
  pixel?.filter(isOwnPixel).map(appendViewed) ?? [];
