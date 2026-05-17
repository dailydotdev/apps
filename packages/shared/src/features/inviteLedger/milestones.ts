/**
 * Tiered invite milestones. Each row is a fact about what unlocks at N invites,
 * written in editorial voice — no RPG names, no marketing copy. The reward
 * curve is intentionally steeper at the top so the early invites feel
 * achievable and the top of the ladder feels like an actual flex.
 */

export enum InviteRewardKind {
  Cores = 'cores',
  PlusDays = 'plus_days',
  Cosmetic = 'cosmetic',
  Perk = 'perk',
}

export interface InviteReward {
  kind: InviteRewardKind;
  label: string;
}

export interface InviteMilestone {
  /** Numeric ID used as the visible "01"…"06" prefix. */
  step: number;
  /** Number of invites required to unlock this row. */
  invites: number;
  /** Short, neutral name for the milestone — fact, not flavor. */
  title: string;
  /** Editorial one-liner. Conversational, specific, real stakes. */
  blurb: string;
  rewards: InviteReward[];
}

export const INVITE_MILESTONES: InviteMilestone[] = [
  {
    step: 1,
    invites: 1,
    title: 'Your first bring-in',
    blurb:
      'Someone joins daily.dev because you sent the link. Small reward, big proof it works.',
    rewards: [{ kind: InviteRewardKind.Cores, label: '100 Cores' }],
  },
  {
    step: 2,
    invites: 3,
    title: 'Three deep',
    blurb:
      "You've sent enough links that this isn't an accident. The flywheel starts.",
    rewards: [{ kind: InviteRewardKind.Cores, label: '500 Cores' }],
  },
  {
    step: 3,
    invites: 5,
    title: 'A real circle',
    blurb:
      "Five devs landed here through you. That's a small group chat's worth of credit.",
    rewards: [
      { kind: InviteRewardKind.Cores, label: '1,500 Cores' },
      { kind: InviteRewardKind.PlusDays, label: '7 days of Plus' },
    ],
  },
  {
    step: 4,
    invites: 10,
    title: 'Double-digit territory',
    blurb:
      'Ten bring-ins puts you ahead of 98% of accounts. We start noticing.',
    rewards: [
      { kind: InviteRewardKind.Cores, label: '5,000 Cores' },
      { kind: InviteRewardKind.PlusDays, label: '30 days of Plus' },
    ],
  },
  {
    step: 5,
    invites: 25,
    title: 'Needle-moving territory',
    blurb:
      'Twenty-five bring-ins is the kind of number that shows up in our quarterly review.',
    rewards: [
      { kind: InviteRewardKind.Cores, label: '15,000 Cores' },
      {
        kind: InviteRewardKind.Cosmetic,
        label: 'Inviter frame on your profile',
      },
    ],
  },
  {
    step: 6,
    invites: 50,
    title: 'Top 0.1% of inviters',
    blurb:
      'Fewer than a hundred accounts make it here. We unlock the rest of the kit.',
    rewards: [
      { kind: InviteRewardKind.Cores, label: '50,000 Cores' },
      { kind: InviteRewardKind.Cosmetic, label: 'Glowing public ledger' },
      { kind: InviteRewardKind.Perk, label: 'Custom invite page' },
    ],
  },
];

export const getCurrentInviteTier = (
  invitesAccepted: number,
): InviteMilestone | null => {
  const reached = INVITE_MILESTONES.filter((m) => invitesAccepted >= m.invites);
  return reached[reached.length - 1] ?? null;
};

export const getNextInviteMilestone = (
  invitesAccepted: number,
): InviteMilestone | null =>
  INVITE_MILESTONES.find((m) => m.invites > invitesAccepted) ?? null;

export const getInviteTierProgress = (invitesAccepted: number): number => {
  const next = getNextInviteMilestone(invitesAccepted);
  if (!next) {
    return 100;
  }
  const current = getCurrentInviteTier(invitesAccepted);
  const rangeStart = current?.invites ?? 0;
  const rangeEnd = next.invites;
  if (rangeEnd === rangeStart) {
    return 100;
  }
  const ratio =
    ((invitesAccepted - rangeStart) / (rangeEnd - rangeStart)) * 100;
  return Math.min(Math.max(ratio, 0), 100);
};

export const getInvitesUntilNextTier = (invitesAccepted: number): number => {
  const next = getNextInviteMilestone(invitesAccepted);
  if (!next) {
    return 0;
  }
  return Math.max(0, next.invites - invitesAccepted);
};

/** "01", "02"… for the visible numbered prefix in lists. */
export const formatStep = (step: number): string =>
  step < 10 ? `0${step}` : String(step);
