import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '../Icon';
import type { NotificationFilterCategory } from './utils';
import { notificationCategoryBadge } from './utils';

interface NotificationCategoryBadgeProps {
  category: NotificationFilterCategory;
  // Corner positioning against the parent avatar/face. The single-actor lead
  // notches it in (`-bottom-1 -right-1`); the smaller stacked face straddles the
  // corner (`bottom-0 right-0 translate-x-1/2 translate-y-1/2`) so the badge
  // covers less of the face. The parent must be `relative`.
  className?: string;
}

// The colored category badge overlaid on a notification avatar (Instagram/
// Facebook/TikTok pattern): a solid accent fill + contrast glyph signalling the
// notification type. Shared by the single-actor lead and the multi-actor stack
// so both render an identical badge, differing only in corner positioning.
export function NotificationCategoryBadge({
  category,
  className,
}: NotificationCategoryBadgeProps): ReactElement {
  const badge = notificationCategoryBadge[category];
  const BadgeIcon = badge.Icon;

  return (
    <span
      className={classNames(
        'absolute z-2 flex size-5 items-center justify-center rounded-8 border-2 border-background-default',
        badge.bg,
        className,
      )}
    >
      <BadgeIcon secondary size={IconSize.XXSmall} className={badge.fg} />
    </span>
  );
}
