import { FEED_POST_CONNECTION_FRAGMENT, SOURCE_FEED_QUERY } from './feed';

it('should request html content for feed posts', () => {
  expect(FEED_POST_CONNECTION_FRAGMENT).toContain('contentHtml');
  expect(FEED_POST_CONNECTION_FRAGMENT).not.toMatch(/\bcontent\b/);
  expect(SOURCE_FEED_QUERY).toContain('pinnedAt contentHtml');
  expect(SOURCE_FEED_QUERY).not.toMatch(/pinnedAt content\b/);
});
