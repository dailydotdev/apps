/**
 * Tiered invite milestone system. Each tier unlocks a richer reward bundle
 * the more developers a user brings in. Reads top-down: small first-invite
 * win to drive the first share, then escalating Cores + Plus days + status.
 *
 * Modeled after the streak progression system (see PR #5613) so visual
 * language stays consistent across daily.dev's loyalty surfaces.
 */

export enum InviteTier {
  FirstSpark = 'first_spark',
  OpenDoor = 'open_door',
  InnerCircle = 'inner_circle',
  Crew = 'crew',
  Vanguard = 'vanguard',
  Ambassador = 'ambassador',
}

export enum InviteRewardKind {
  Cores = 'cores',
  PlusDays = 'plus_days',
  Cosmetic = 'cosmetic',
  Perk = 'perk',
}

export type InviteAccentTone =
  | 'cabbage'
  | 'bacon'
  | 'cheese'
  | 'water'
  | 'avocado'
  | 'onion';

export interface InviteReward {
  kind: InviteRewardKind;
  label: string;
}

export interface InviteMilestone {
  invites: number;
  tier: InviteTier;
  label: string;
  blurb: string;
  rewards: InviteReward[];
  tone: InviteAccentTone;
}

export const INVITE_MILESTONES: InviteMilestone[] = [
  {
    invites: 1,
    tier: InviteTier.FirstSpark,
    label: 'First Spark',
    blurb: 'Your first dev joins through your link.',
    tone: 'cabbage',
    rewards: [{ kind: InviteRewardKind.Cores, label: '100 Cores' }],
  },
  {
    invites: 3,
    tier: InviteTier.OpenDoor,
    label: 'Open Door',
    blurb: 'Three friends in. The flywheel starts spinning.',
    tone: 'bacon',
    rewards: [{ kind: InviteRewardKind.Cores, label: '500 Cores' }],
  },
  {
    invites: 5,
    tier: InviteTier.InnerCircle,
    label: 'Inner Circle',
    blurb: 'A small crew of devs who got here because of you.',
    tone: 'cheese',
    rewards: [
      { kind: InviteRewardKind.Cores, label: '1,500 Cores' },
      { kind: InviteRewardKind.PlusDays, label: '7 Plus days for you' },
    ],
  },
  {
    invites: 10,
    tier: InviteTier.Crew,
    label: 'Crew',
    blurb: 'A real network. You start showing up in the leaderboards.',
    tone: 'water',
    rewards: [
      { kind: InviteRewardKind.Cores, label: '5,000 Cores' },
      { kind: InviteRewardKind.PlusDays, label: '30 Plus days for you' },
    ],
  },
  {
    invites: 25,
    tier: InviteTier.Vanguard,
    label: 'Vanguard',
    blurb: 'You are visibly shaping who shows up on daily.dev.',
    tone: 'avocado',
    rewards: [
      { kind: InviteRewardKind.Cores, label: '15,000 Cores' },
      {
        kind: InviteRewardKind.Cosmetic,
        label: 'Inviter profile frame',
      },
    ],
  },
  {
    invites: 50,
    tier: InviteTier.Ambassador,
    label: 'Ambassador',
    blurb: 'Top 0.1% of inviters. Permanent ambassador status.',
    tone: 'onion',
    rewards: [
      { kind: InviteRewardKind.Cores, label: '50,000 Cores' },
      {
        kind: InviteRewardKind.Cosmetic,
        label: 'Glowing ledger',
      },
      {
        kind: InviteRewardKind.Perk,
        label: 'Custom invite page',
      },
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
