/* eslint-disable no-template-curly-in-string -- literal macro tokens */
import { getViewedPixels } from './getViewedPixels';

describe('getViewedPixels', () => {
  it('should mark our own pixels as viewed', () => {
    expect(getViewedPixels(['https://api.daily.dev/a/imp'])).toEqual([
      'https://api.daily.dev/a/imp?viewed=true',
    ]);
  });

  it('should keep an existing query string', () => {
    expect(getViewedPixels(['https://api.daily.dev/a/imp?id=1'])).toEqual([
      'https://api.daily.dev/a/imp?id=1&viewed=true',
    ]);
  });

  it('should leave macro tokens untouched', () => {
    expect(
      getViewedPixels(['https://api.daily.dev/a/imp?ord=[timestamp]']),
    ).toEqual(['https://api.daily.dev/a/imp?ord=[timestamp]&viewed=true']);
    expect(
      getViewedPixels(['https://api.daily.dev/a/imp?cb=${CACHEBUSTER}']),
    ).toEqual(['https://api.daily.dev/a/imp?cb=${CACHEBUSTER}&viewed=true']);
  });

  it('should skip third party pixels', () => {
    expect(
      getViewedPixels([
        'https://ads.example.com/imp',
        'https://api.daily.dev.evil.com/imp',
        'https://daily.dev/imp',
        'not a url',
      ]),
    ).toEqual([]);
  });

  it('should handle an ad without pixels', () => {
    expect(getViewedPixels()).toEqual([]);
    expect(getViewedPixels([])).toEqual([]);
  });
});
