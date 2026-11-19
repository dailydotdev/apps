import { webappUrl } from '../../lib/constants';
import { ChatRoomType } from './graphql';
import { getChatRoomHref, withJoinIntent } from './joinLink';

describe('withJoinIntent', () => {
  it('marks a post link as a join', () => {
    expect(withJoinIntent('https://app.daily.dev/posts/p1')).toEqual(
      'https://app.daily.dev/posts/p1?chat=join',
    );
    expect(withJoinIntent('https://app.daily.dev/posts/p1?ref=x')).toEqual(
      'https://app.daily.dev/posts/p1?ref=x&chat=join',
    );
  });

  it('copes with a relative link', () => {
    expect(withJoinIntent('/posts/p1')).toEqual('/posts/p1?chat=join');
  });
});

describe('getChatRoomHref', () => {
  it('sends a post room to its post, joining on landing', () => {
    expect(
      getChatRoomHref({
        id: 'r1',
        type: ChatRoomType.PostLive,
        post: { commentsPermalink: 'https://app.daily.dev/posts/p1' },
      }),
    ).toEqual('https://app.daily.dev/posts/p1?chat=join');
  });

  it('has nowhere to send a post room without its post', () => {
    expect(
      getChatRoomHref({ id: 'r1', type: ChatRoomType.PostLive, post: null }),
    ).toBeUndefined();
  });

  it('sends a topic room to its own page', () => {
    expect(getChatRoomHref({ id: 'r1', type: ChatRoomType.Topic })).toEqual(
      `${webappUrl}chat/r1`,
    );
  });
});
