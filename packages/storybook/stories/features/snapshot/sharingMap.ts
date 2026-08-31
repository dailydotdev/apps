/**
 * The decision behind every share control, shared by the Sharing map and the
 * Visibility variations pages so the two can never drift apart.
 */
export type LeadAction = 'Link' | 'Share to' | 'Snapshot';

export type Support = 'core' | 'secondary' | 'none';

export interface SharingMapRow {
  surface: string;
  pr: string;
  link: Support;
  snapshot: Support;
  leads: LeadAction;
  why: string;
}

export const SHARING_MAP: SharingMapRow[] = [
  {
    surface: 'Post page & modal',
    pr: '6350',
    link: 'core',
    snapshot: 'secondary',
    leads: 'Link',
    why: 'They want to read it, not look at a picture of it',
  },
  {
    surface: 'Highlighted text',
    pr: '6352',
    link: 'secondary',
    snapshot: 'core',
    leads: 'Snapshot',
    why: 'The quote is the share; the link is attribution',
  },
  {
    surface: 'End of conversation',
    pr: '6349',
    link: 'core',
    snapshot: 'secondary',
    leads: 'Link',
    why: 'The thread keeps moving; a still frame goes stale',
  },
  {
    surface: 'Post-upvote prompt',
    pr: '6351',
    link: 'core',
    snapshot: 'none',
    leads: 'Link',
    why: 'Same payload as the post — no second image',
  },
  {
    surface: 'Briefing / digest',
    pr: '6353',
    link: 'none',
    snapshot: 'core',
    leads: 'Snapshot',
    why: 'Personalized: a link gives them their briefing, or nothing',
  },
  {
    surface: 'Profile',
    pr: '6354',
    link: 'core',
    snapshot: 'secondary',
    leads: 'Link',
    why: 'The point is that they follow you',
  },
  {
    surface: 'Tags & sources',
    pr: '6357',
    link: 'core',
    snapshot: 'none',
    leads: 'Link',
    why: 'A live feed; an image of a tag says little',
  },
  {
    surface: 'Leaderboard — the board',
    pr: '6359',
    link: 'core',
    snapshot: 'secondary',
    leads: 'Link',
    why: 'It changes weekly',
  },
  {
    surface: 'Leaderboard — my rank',
    pr: '6359',
    link: 'secondary',
    snapshot: 'core',
    leads: 'Snapshot',
    why: 'Status content is image-first',
  },
  {
    surface: 'Happening Now',
    pr: '6355',
    link: 'secondary',
    snapshot: 'core',
    leads: 'Snapshot',
    why: 'Payload ≈ the whole page, and news travels in chat apps',
  },
  {
    surface: 'Reading streak',
    pr: '6358',
    link: 'none',
    snapshot: 'core',
    leads: 'Snapshot',
    why: 'A link to your streak means nothing to anyone else',
  },
  {
    surface: 'Celebrations & achievements',
    pr: '6360',
    link: 'none',
    snapshot: 'core',
    leads: 'Snapshot',
    why: 'Pure status',
  },
  {
    surface: 'DevCard',
    pr: '6356',
    link: 'secondary',
    snapshot: 'none',
    leads: 'Share to',
    why: 'Already an image — do not wrap an image in an image',
  },
  {
    surface: 'Reading history',
    pr: '6361',
    link: 'core',
    snapshot: 'none',
    leads: 'Link',
    why: 'Each row is just a post',
  },
  {
    surface: 'Copy my feed',
    pr: '6362',
    link: 'none',
    snapshot: 'core',
    leads: 'Snapshot',
    why: 'No URL anyone else can open',
  },
  {
    surface: 'Squad directory',
    pr: '6363',
    link: 'core',
    snapshot: 'secondary',
    leads: 'Link',
    why: 'The point is joining',
  },
  {
    surface: 'Best-of / discovery',
    pr: '6364',
    link: 'core',
    snapshot: 'secondary',
    leads: 'Link',
    why: 'Evergreen page worth landing on',
  },
  {
    surface: 'Hot takes',
    pr: '6365',
    link: 'secondary',
    snapshot: 'core',
    leads: 'Snapshot',
    why: 'Opinion is quotable and self-contained',
  },
  {
    surface: 'Invite a friend',
    pr: '6366',
    link: 'core',
    snapshot: 'secondary',
    leads: 'Link',
    why: 'An image of a referral cannot be clicked',
  },
  {
    surface: 'Watercooler post',
    pr: '—',
    link: 'core',
    snapshot: 'secondary',
    leads: 'Link',
    why: 'It is a post',
  },
];
