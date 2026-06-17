import type { ReactNode } from 'react';

export enum AnnouncementCardVariant {
  // icon + title (+ one line) + arrow — for minor updates
  Compact = 'compact',
  // badge + title + body + CTA — the standard release card
  Default = 'default',
  // cover image on top of the standard card — for headline launches
  Cover = 'cover',
}

export interface AnnouncementBadge {
  label: string;
  // Override classes for the label. Defaults to brand-colored text.
  className?: string;
}

export interface AnnouncementCta {
  text: string;
  href?: string;
  onClick?: () => void;
}

export interface AnnouncementItem {
  // Stable id — used for dismissal persistence and analytics.
  id: string;
  variant: AnnouncementCardVariant;
  title: string;
  description?: string;
  badge?: AnnouncementBadge;
  // Cover image url, used by the Cover variant.
  image?: string;
  // Leading icon for the Compact variant (Default/Cover lead with the badge).
  icon?: ReactNode;
  cta?: AnnouncementCta;
  // Makes the whole card a link when there is no explicit CTA (Compact).
  href?: string;
}
