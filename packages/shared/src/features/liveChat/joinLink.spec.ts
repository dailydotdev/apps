import { withJoinIntent } from './joinLink';

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
