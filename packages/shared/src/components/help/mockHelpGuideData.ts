export interface HelpGuideItem {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaUrl?: string;
  tag?: string;
  isNew?: boolean;
}

/**
 * Mock data for demo purposes.
 * In production this would come from an API based on user state.
 */
export const mockHelpGuideItems: HelpGuideItem[] = [
  {
    id: 'customize-feed',
    title: 'Customize your feed',
    description:
      'Pick your favorite tags and sources to get a feed tailored to your interests. The more you customize, the better your feed gets.',
    ctaLabel: 'Go to feed settings',
    ctaUrl: '/feeds/new',
    tag: 'Action',
  },
  {
    id: 'smart-prompts',
    title: 'Smart Prompts are here!',
    description:
      'Ask follow-up questions on any post with AI-powered Smart Prompts. Available for Plus members.',
    ctaLabel: 'Try it now',
    isNew: true,
    tag: 'New',
  },
  {
    id: 'squads',
    title: 'Create your first Squad',
    description:
      'Squads are private groups where you and your team can share and discuss articles together.',
    ctaLabel: 'Create a Squad',
    ctaUrl: '/squads/new',
    tag: 'Getting started',
  },
  {
    id: 'bookmarks',
    title: 'Organize with Bookmark Folders',
    description:
      'Save posts for later and organize them into folders so you never lose track of great content.',
    ctaLabel: 'View bookmarks',
    ctaUrl: '/bookmarks',
  },
  {
    id: 'streak',
    title: 'Keep your reading streak going!',
    description:
      "You're on a 3-day streak. Read one more post today to keep it alive and unlock streak milestones.",
    ctaLabel: 'Browse posts',
    ctaUrl: '/',
    tag: 'Streak',
  },
];
