import { isPreviewForComposerUrl, normalizeComposerUrl } from './utils';

describe('composer utils', () => {
  it('normalizes URLs without a protocol', () => {
    expect(normalizeComposerUrl('daily.dev')).toBe('https://daily.dev');
  });

  it('matches previews against the current composer URL', () => {
    const preview = {
      title: 'daily.dev',
      url: 'https://daily.dev',
      finalUrl: 'https://daily.dev/posts/1',
    };

    expect(isPreviewForComposerUrl(preview, 'daily.dev')).toBe(true);
    expect(isPreviewForComposerUrl(preview, 'https://example.com')).toBe(false);
  });
});
