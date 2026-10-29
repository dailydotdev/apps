// Only our own ad server understands the viewed and visible signals. Third
// party pixels are contracted to fire once per impression, so re-firing them
// would double count.
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
const appendParam = (url: string, param: string): string =>
  `${url}${url.includes('?') ? '&' : '?'}${param}`;

const ownPixelsWith = (pixel: string[] | undefined, param: string): string[] =>
  pixel?.filter(isOwnPixel).map((url) => appendParam(url, param)) ?? [];

export const getViewedPixels = (pixel?: string[]): string[] =>
  ownPixelsWith(pixel, 'viewed=true');

/**
 * Air time is reported in increments: each call carries the seconds seen
 * since the last one, and the ad server sums them per impression.
 */
export const getVisiblePixels = (
  pixel: string[] | undefined,
  seconds: number,
): string[] => ownPixelsWith(pixel, `visible=${seconds}`);
