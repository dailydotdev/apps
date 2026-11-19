import {
  getProfilePageAsPath,
  getProfileSegment,
  ProfileSegment,
} from './ProfileSegments';

describe('getProfileSegment', () => {
  it('reads each segment from its address', () => {
    expect(getProfileSegment('/andrey')).toBe(ProfileSegment.About);
    expect(getProfileSegment('/andrey/posts')).toBe(ProfileSegment.Posts);
    expect(getProfileSegment('/andrey/replies?x=1')).toBe(
      ProfileSegment.Replies,
    );
    expect(getProfileSegment('/andrey/upvoted/')).toBe(ProfileSegment.Upvoted);
  });

  it('does not take a post address for a segment', () => {
    expect(getProfileSegment('/posts/abc')).toBeUndefined();
  });
});

describe('getProfilePageAsPath', () => {
  it('is the address when no post is open over the page', () => {
    expect(getProfilePageAsPath({ asPath: '/andrey/posts', query: {} })).toBe(
      '/andrey/posts',
    );
  });

  it('is the page address under a post opened from a segment', () => {
    const router = {
      asPath: '/posts/abc',
      query: { userId: 'andrey', pmid: 'abc', pmap: '/andrey/posts' },
    };

    expect(getProfilePageAsPath(router)).toBe('/andrey/posts');
    expect(getProfileSegment(getProfilePageAsPath(router))).toBe(
      ProfileSegment.Posts,
    );
  });
});
