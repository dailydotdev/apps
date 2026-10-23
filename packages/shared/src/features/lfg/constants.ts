import type { LfgAsk } from './types';
import { LfgAskType, LfgCommitment, LfgKind } from './types';

// Mirrors of the API's limits (daily-api src/common/schema/lfg.ts).
export const LFG_TITLE_MAX_LENGTH = 80;
export const LFG_BODY_MAX_LENGTH = 1000;
export const LFG_MAX_TAGS = 5;
export const LFG_MAX_ASKS = 3;
export const LFG_ASK_LABEL_MAX_LENGTH = 80;
export const LFG_POST_LIFETIME_DAYS = 30;
export const LFG_DAILY_REACH_OUTS = 5;
export const LFG_PITCH_MAX_LENGTH = 280;
export const LFG_ANSWER_MAX_LENGTH = 200;
export const LFG_HELPER_MAX_TAGS = 10;
export const LFG_HELPER_PER_MONTH_OPTIONS = [1, 2, 4];
export const LFG_HELPER_DEFAULT_PER_MONTH = 2;
// The steps of the board's reputation filter.
export const LFG_REPUTATION_STEPS = [100, 500, 1000];
// Every UTC offset in use, in hours, for picking time zones nobody posts from
// yet.
export const LFG_UTC_OFFSETS = [
  -12, -11, -10, -9.5, -9, -8, -7, -6, -5, -4, -3.5, -3, -2.5, -2, -1, 0, 1, 2,
  3, 3.5, 4, 4.5, 5, 5.5, 5.75, 6, 6.5, 7, 8, 8.75, 9, 9.5, 10, 10.5, 11, 12,
  12.75, 13, 13.75, 14,
];
// The id of the question a poster writes themselves.
export const LFG_CUSTOM_ASK_ID = 'custom';

export const lfgKinds = [LfgKind.Build, LfgKind.Learn, LfgKind.Help];

export const lfgKindLabel: Record<LfgKind, string> = {
  [LfgKind.Build]: 'Build',
  [LfgKind.Learn]: 'Learn',
  [LfgKind.Help]: 'Help',
};

export const lfgKindBlurb: Record<LfgKind, string> = {
  [LfgKind.Build]: 'Find people to build something with',
  [LfgKind.Learn]: 'Find someone to learn with and stay on track',
  [LfgKind.Help]: "Get advice or a second opinion from someone who's done it",
};

// What the badge strip says someone is after.
export const lfgKindLooking: Record<LfgKind, string> = {
  [LfgKind.Build]: 'Looking to build',
  [LfgKind.Learn]: 'Looking to learn',
  [LfgKind.Help]: 'Looking for help',
};

export const lfgCommitmentLabel: Record<LfgCommitment, string> = {
  [LfgCommitment.OneCall]: 'One call',
  [LfgCommitment.FewWeeks]: 'A few weeks',
  [LfgCommitment.Ongoing]: 'Ongoing',
};

const ask = (id: string, label: string, type = LfgAskType.Text): LfgAsk => ({
  id,
  label,
  type,
});

export const lfgAskPresets: Record<LfgKind, LfgAsk[]> = {
  [LfgKind.Build]: [
    ask('shipped', 'A project you shipped', LfgAskType.Link),
    ask('hours', 'Hours per week you can commit'),
    ask('why', 'Why this project'),
  ],
  [LfgKind.Learn]: [
    ask('learning', "What you're learning right now"),
    ask('goal', 'Your goal for the next month'),
    ask('schedule', 'When you usually have time'),
  ],
  [LfgKind.Help]: [
    ask('experience', 'Your experience with this'),
    ask('similar', "Something similar you've done", LfgAskType.Link),
    ask('when', "When you're free for a call"),
  ],
};
