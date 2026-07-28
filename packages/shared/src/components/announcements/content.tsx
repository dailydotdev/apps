import React from 'react';
import { AnnouncementCardVariant } from './types';
import type { AnnouncementItem } from './types';
import { HotIcon, MegaphoneIcon } from '../icons';
import { IconSize } from '../Icon';
import { cloudinarySquadsDirectoryCardBannerDefault } from '../../lib/image';

// Curated list of "what's new" announcements shown in the sidebar.
// Keep this short and high-signal — show fewer, better entries. Newest first.
// Bump/replace entries on each release; once dismissed, a card stays gone
// (persisted client-side by id via useSidebarAnnouncements).
export const SIDEBAR_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'cover-2026-06-clips',
    variant: AnnouncementCardVariant.Cover,
    image: cloudinarySquadsDirectoryCardBannerDefault,
    badge: { label: 'New' },
    title: 'Introducing Clips',
    description:
      'Save the best moments from any post and share them with your network in one tap.',
    cta: { text: 'Try Clips', href: '/clips' },
  },
  {
    id: 'default-2026-06-custom-feeds',
    variant: AnnouncementCardVariant.Default,
    badge: { label: 'Updated' },
    title: 'Smarter custom feeds',
    description:
      'Custom feeds now learn from what you read to surface more of what matters.',
    cta: { text: 'See what changed', href: '/feeds' },
  },
  {
    id: 'compact-2026-06-shortcuts',
    variant: AnnouncementCardVariant.Compact,
    icon: <HotIcon size={IconSize.Small} />,
    title: 'Keyboard shortcuts are here',
    href: '/settings',
  },
  {
    id: 'compact-2026-05-changelog',
    variant: AnnouncementCardVariant.Compact,
    icon: <MegaphoneIcon size={IconSize.Small} />,
    title: 'Catch up on everything new',
    description: 'Browse the full changelog',
    href: 'https://daily.dev/changelog',
  },
];
