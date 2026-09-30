import { getSlackShareOriginPath } from './useSlackShareButton';
import type { Post } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';
import { LazyModal } from '../../../components/modals/common/types';

describe('getSlackShareOriginPath', () => {
  it('should return to the starting page with the pending share, replacing a stale one', () => {
    const path = getSlackShareOriginPath({
      post: { id: 'p2' } as Post,
      origin: Origin.PostContent,
      path: '/popular?tag=rust&lzym=slack_share&slackPostId=p1&slackScrollY=10#top',
      scrollY: 1234.6,
    });

    const [pathname, query] = path.split('?');
    const params = new URLSearchParams(query);

    expect(pathname).toBe('/popular');
    expect(Object.fromEntries(params)).toEqual({
      tag: 'rust',
      lzym: LazyModal.SlackShare,
      slackPostId: 'p2',
      slackScrollY: '1235',
      slackOrigin: Origin.PostContent,
    });
  });
});
