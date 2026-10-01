import type {
  ReferralLadder,
  ReferralLadderFriend,
} from '@dailydotdev/shared/src/graphql/users';

export enum LadderState {
  Ineligible = 'ineligible',
  Loading = 'loading',
  NoneJoined = '0 joined',
  OneJoined = '1 joined',
  TwoJoined = '2 joined',
  Completed = 'completed',
}

// Generic daily.dev placeholder avatars, never real users.
const placeholder = (index: number): string =>
  `https://media.daily.dev/image/upload/f_auto/v1/placeholders/${index}`;

export const friends: ReferralLadderFriend[] = [
  { name: 'Noa Tal', username: 'noatal' },
  { name: 'Sam Porter', username: 'samporter' },
  { name: 'Ravi Menon', username: 'ravimenon' },
].map((friend, index) => ({
  ...friend,
  id: `friend-${index}`,
  image: placeholder(index + 1),
  permalink: `https://app.daily.dev/${friend.username}`,
}));

const referredCountByState: Partial<Record<LadderState, number>> = {
  [LadderState.NoneJoined]: 0,
  [LadderState.OneJoined]: 1,
  [LadderState.TwoJoined]: 2,
  [LadderState.Completed]: 3,
};

export const getLadder = (state: LadderState): ReferralLadder | undefined => {
  const referredCount = referredCountByState[state];

  if (referredCount === undefined) {
    return undefined;
  }

  return {
    eligible: true,
    referredCount,
    steps: [
      { step: 1, invites: 1, months: 1 },
      { step: 2, invites: 2, months: 3 },
      { step: 3, invites: 3, months: 12 },
    ].map((step) => ({
      ...step,
      unlockedAt:
        step.invites <= referredCount
          ? new Date(2026, 8, 20 + step.step).toISOString()
          : null,
    })),
    friends: friends.slice(0, referredCount),
  };
};
