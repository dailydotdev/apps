import { canReachOutToLfgPost, getLfgRowStatus } from './status';
import { LfgPostStatus, LfgReachOutStatus } from '../types';

const post = (overrides = {}) => ({
  author: { id: 'author' },
  status: LfgPostStatus.Open,
  isPaused: false,
  pendingCount: null,
  myReachOut: null,
  ...overrides,
});

describe('canReachOutToLfgPost', () => {
  it('lets a reader reach out to an open post once connections are open', () => {
    expect(canReachOutToLfgPost(post(), 'reader', true)).toBe(true);
  });

  it.each([
    ['before launch', post(), 'reader', false],
    ['to their own post', post(), 'author', true],
    ['when signed out', post(), undefined, true],
    ['to a found post', post({ status: LfgPostStatus.Found }), 'reader', true],
    ['to a paused post', post({ isPaused: true }), 'reader', true],
    [
      'twice',
      post({
        myReachOut: {
          id: 'r',
          status: LfgReachOutStatus.Pending,
          createdAt: '',
        },
      }),
      'reader',
      true,
    ],
  ])('refuses %s', (_, target, viewerId, isLaunched) => {
    expect(canReachOutToLfgPost(target, viewerId, isLaunched)).toBe(false);
  });
});

describe('getLfgRowStatus', () => {
  it('says the board opens soon before launch', () => {
    expect(getLfgRowStatus(post(), 'reader', false)).toBe('Opening soon');
    expect(getLfgRowStatus(post(), 'author', false)).toBe(
      'Your post · goes live soon',
    );
  });

  it("counts the responses waiting on the reader's own post", () => {
    expect(getLfgRowStatus(post({ pendingCount: 3 }), 'author', true)).toBe(
      'Your post · 3 waiting',
    );
    expect(getLfgRowStatus(post({ pendingCount: 0 }), 'author', true)).toBe(
      'Your post',
    );
  });

  it('reads a declined reach-out as requested, like its sender sees it', () => {
    const declined = post({
      myReachOut: {
        id: 'r',
        status: LfgReachOutStatus.Declined,
        createdAt: '',
      },
    });

    expect(getLfgRowStatus(declined, 'reader', true)).toBe('Requested');
  });

  it('leads with nothing when the reader can simply reach out', () => {
    expect(getLfgRowStatus(post(), 'reader', true)).toBeUndefined();
  });
});
