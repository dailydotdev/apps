import {
  canReachOutToLfgPost,
  getLfgRowStatus,
  withLapsedLfgStatus,
} from './status';
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
  it('lets a reader reach out to an open post', () => {
    expect(canReachOutToLfgPost(post(), 'reader')).toBe(true);
  });

  it.each([
    ['to their own post', post(), 'author'],
    ['when signed out', post(), undefined],
    ['to a found post', post({ status: LfgPostStatus.Found }), 'reader'],
    ['to a paused post', post({ isPaused: true }), 'reader'],
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
    ],
  ])('refuses %s', (_, target, viewerId) => {
    expect(canReachOutToLfgPost(target, viewerId)).toBe(false);
  });
});

describe('getLfgRowStatus', () => {
  it("counts the responses waiting on the reader's own post", () => {
    expect(getLfgRowStatus(post({ pendingCount: 3 }), 'author')).toBe(
      'Your post · 3 waiting',
    );
    expect(getLfgRowStatus(post({ pendingCount: 0 }), 'author')).toBe(
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

    expect(getLfgRowStatus(declined, 'reader')).toBe('Requested');
  });

  it('leads with nothing when the reader can simply reach out', () => {
    expect(getLfgRowStatus(post(), 'reader')).toBeUndefined();
  });
});

describe('withLapsedLfgStatus', () => {
  const now = new Date('2026-10-15T10:00:00Z');

  it('reads an open post past its expiry as expired, before the cron runs', () => {
    expect(
      withLapsedLfgStatus(
        { status: LfgPostStatus.Open, expiresAt: '2026-10-15T09:00:00Z' },
        now,
      ).status,
    ).toBe(LfgPostStatus.Expired);
    expect(
      withLapsedLfgStatus(
        { status: LfgPostStatus.Open, expiresAt: '2026-10-16T09:00:00Z' },
        now,
      ).status,
    ).toBe(LfgPostStatus.Open);
    expect(
      withLapsedLfgStatus(
        { status: LfgPostStatus.Found, expiresAt: '2026-10-15T09:00:00Z' },
        now,
      ).status,
    ).toBe(LfgPostStatus.Found);
  });
});
