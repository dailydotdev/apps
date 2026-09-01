import type { Post } from '../../graphql/posts';
import { pollSnapshotFromPost } from './pollSnapshot';

const poll = {
  id: 'poll-1',
  title: 'Which do you reach for first in a new service?',
  numPollVotes: 1284,
  source: { name: 'Frontend Fans' },
  pollOptions: [
    { id: '2', text: 'Redis', order: 1, numVotes: 200 },
    { id: '1', text: 'Postgres', order: 0, numVotes: 700 },
    { id: '3', text: 'SQLite', order: 2, numVotes: 100 },
  ],
} as unknown as Post;

describe('pollSnapshotFromPost', () => {
  it('orders the options by their share of the vote', () => {
    expect(pollSnapshotFromPost(poll)?.options).toEqual([
      { text: 'Postgres', share: 70 },
      { text: 'Redis', share: 20 },
      { text: 'SQLite', share: 10 },
    ]);
  });

  it('reads the share from the options rather than the voter count', () => {
    // numPollVotes counts voters, so deriving the bars from it would leave
    // them adding up to something other than the poll.
    const shares = pollSnapshotFromPost(poll)?.options ?? [];

    expect(shares.reduce((sum, option) => sum + option.share, 0)).toBe(100);
  });

  it('carries the same status line the product shows above the options', () => {
    // Frozen: postDateFormat says "Now" inside the first minute, and a clock
    // read at test time decides which branch this lands on.
    jest.useFakeTimers().setSystemTime(new Date('2026-09-01T18:00:00.000Z'));
    const snapshot = pollSnapshotFromPost({
      ...poll,
      createdAt: '2026-09-01T09:00:00.000Z',
    } as Post);
    jest.useRealTimers();

    expect(snapshot?.meta).toEqual(['Voting open', '1.3K votes', 'Today']);
    expect(snapshot?.source).toEqual({ name: 'Frontend Fans' });
    expect(snapshot?.seed).toBe('poll-1');
  });

  it('says the voting ended once the poll has closed', () => {
    const snapshot = pollSnapshotFromPost({
      ...poll,
      endsAt: new Date(Date.now() - 60_000).toISOString(),
    } as Post);

    expect(snapshot?.meta?.slice(0, 2)).toEqual([
      'Voting ended',
      '1.3K total votes',
    ]);
  });

  it('refuses a poll nobody has voted in', () => {
    const options = poll.pollOptions?.map((option) => ({
      ...option,
      numVotes: 0,
    }));

    expect(
      pollSnapshotFromPost({ ...poll, pollOptions: options } as Post),
    ).toBeNull();
  });

  it('refuses a post with no options at all', () => {
    expect(
      pollSnapshotFromPost({ ...poll, pollOptions: [] } as Post),
    ).toBeNull();
  });
});
