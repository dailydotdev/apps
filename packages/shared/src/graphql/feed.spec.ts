import { FEED_POST_CONNECTION_FRAGMENT, SOURCE_FEED_QUERY } from './feed';

it('should request plain content for feed posts', () => {
  expect(FEED_POST_CONNECTION_FRAGMENT).toContain('content');
  expect(FEED_POST_CONNECTION_FRAGMENT).not.toContain('contentHtml');
  expect(SOURCE_FEED_QUERY).toContain('pinnedAt content');
  expect(SOURCE_FEED_QUERY).not.toContain('pinnedAt contentHtml');
});

it('should keep feed post fragment lean', () => {
  expect(FEED_POST_CONNECTION_FRAGMENT).not.toContain('views');
  expect(FEED_POST_CONNECTION_FRAGMENT).not.toContain('numAwards');
  expect(FEED_POST_CONNECTION_FRAGMENT).not.toContain('featuredAward');
  expect(FEED_POST_CONNECTION_FRAGMENT).not.toContain('updatedAt');
  expect(FEED_POST_CONNECTION_FRAGMENT).not.toContain('digestPostIds');
  expect(FEED_POST_CONNECTION_FRAGMENT).not.toContain('callToAction');
  expect(FEED_POST_CONNECTION_FRAGMENT).not.toContain('private');
});
