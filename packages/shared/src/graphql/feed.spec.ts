import { FEED_POST_CONNECTION_FRAGMENT, SOURCE_FEED_QUERY } from './feed';

it('should request plain content for feed posts', () => {
  expect(FEED_POST_CONNECTION_FRAGMENT).toContain('content');
  expect(FEED_POST_CONNECTION_FRAGMENT).not.toContain('contentHtml');
  expect(SOURCE_FEED_QUERY).toContain('pinnedAt content');
  expect(SOURCE_FEED_QUERY).not.toContain('pinnedAt contentHtml');
});

it('should keep feed post fragment lean', () => {
  const removedFeedFields = [
    'views',
    'numAwards',
    'featuredAward',
    'updatedAt',
    'digestPostIds',
    'callToAction',
    'private',
  ];

  removedFeedFields.forEach((field) => {
    expect(FEED_POST_CONNECTION_FRAGMENT).not.toContain(field);
  });
});
