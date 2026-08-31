import type { Post } from '../../graphql/posts';
import type { PollSnapshotCardProps } from './PollSnapshotCard';

/**
 * The card renders what it is handed rather than recomputing anything, so the
 * share of the vote is worked out here — from the options' own counts, not
 * from `numPollVotes`, which counts voters rather than option votes and would
 * leave the bars adding up to something other than the poll.
 */
export function pollSnapshotFromPost(post: Post): PollSnapshotCardProps | null {
  const options = post.pollOptions ?? [];

  if (!options.length) {
    return null;
  }

  const total = options.reduce(
    (sum, option) => sum + (option.numVotes ?? 0),
    0,
  );

  if (!total) {
    return null;
  }

  const votes = post.numPollVotes ?? total;

  return {
    question: post.title ?? '',
    options: [...options]
      .sort((a, b) => (b.numVotes ?? 0) - (a.numVotes ?? 0))
      .map((option) => ({
        text: option.text,
        share: Math.round(((option.numVotes ?? 0) / total) * 100),
      })),
    votes: `${votes.toLocaleString()} ${votes === 1 ? 'vote' : 'votes'}`,
    source: post.source ? { name: post.source.name } : undefined,
    seed: post.id,
  };
}
