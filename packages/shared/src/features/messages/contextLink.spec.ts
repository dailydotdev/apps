import { getSafeCommentUrl } from './contextLink';

describe('getSafeCommentUrl', () => {
  const host = 'app.daily.dev';

  it('keeps a comment link on the webapp', () => {
    const url = 'https://app.daily.dev/posts/abc#c-123';

    expect(getSafeCommentUrl(url, host)).toBe(url);
  });

  it.each([
    // eslint-disable-next-line no-script-url
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'https://evil.example/posts/abc',
    'https://app.daily.dev.evil.example/posts/abc',
    'not a url',
  ])('drops %s', (url) => {
    expect(getSafeCommentUrl(url, host)).toBeUndefined();
  });
});
