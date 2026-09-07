import type { ComponentType } from 'react';
import type { IconProps } from '../Icon';
import {
  AnalyticsIcon,
  BellIcon,
  BookmarkIcon,
  BriefIcon,
  CompassIcon,
  HashtagIcon,
  HomeIcon,
  HotIcon,
  JobIcon,
  SettingsIcon,
  SourceIcon,
  SquadIcon,
  TimerIcon,
} from '../icons';
import { BookmarkReminderIcon } from '../icons/Bookmark/Reminder';
import { FolderIcon } from '../icons/Folder';

export type SidebarPageIcon = ComponentType<IconProps>;

// Recognizable glyphs for known internal destinations, so a sidebar row that
// isn't an entity (squad, source, tag, user) still reads as itself instead of
// falling back to a generic link/timer. Shared by the Recent list and the
// shortcuts dock — the same page has to look the same in both, and a dock pin
// is usually created by dragging the very row that already showed the glyph.
//
// Exact paths win over prefixes, which is what keeps the app pages under
// /squads/ (Pending Posts, Find Squads) from being read as squad handles.
const EXACT_PAGE_ICONS: Record<string, SidebarPageIcon> = {
  '/bookmarks': BookmarkIcon,
  '/bookmarks/later': BookmarkReminderIcon,
  '/squads': SquadIcon,
  '/squads/new': SquadIcon,
  '/squads/create': SquadIcon,
  '/squads/moderate': TimerIcon,
  '/squads/discover': SourceIcon,
  '/squads/discover/my': SourceIcon,
  '/squads/discover/featured': SourceIcon,
  '/following': HomeIcon,
  '/game-center': HotIcon,
  '/daily-quests': HotIcon,
};

// Sections whose sub-pages all read as the same thing. Deliberately no
// `/squads` entry: everything under it that isn't listed above is a squad
// handle and has to keep resolving to that squad's own logo.
const PREFIX_PAGE_ICONS: [string, SidebarPageIcon][] = [
  ['/settings', SettingsIcon],
  ['/notifications', BellIcon],
  ['/bookmarks', FolderIcon],
  ['/briefing', BriefIcon],
  ['/analytics', AnalyticsIcon],
  ['/jobs', JobIcon],
  ['/posts', CompassIcon],
  ['/feeds', HashtagIcon],
];

const normalize = (path: string): string =>
  path
    .replace(/^https?:\/\/[^/]+/, '')
    .split('?')[0]
    .split('#')[0];

// The glyph component for a known app page, or null when the path isn't one —
// callers own the size/active props and their own fallback.
export const pageIconForPath = (path: string): SidebarPageIcon | null => {
  const normalized = normalize(path);
  const exact = EXACT_PAGE_ICONS[normalized];
  if (exact) {
    return exact;
  }
  const prefixed = PREFIX_PAGE_ICONS.find(
    ([prefix]) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
  return prefixed?.[1] ?? null;
};
