import type { ReactElement } from 'react';
import React from 'react';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryNavbar';
import type { NotificationFilterCategory } from '@dailydotdev/shared/src/components/notifications/utils';
import { notificationFilterCategoryLabel } from '@dailydotdev/shared/src/components/notifications/utils';

interface NotificationFilterBarProps {
  categories: NotificationFilterCategory[];
  active: NotificationFilterCategory | null;
  onSelect: (category: NotificationFilterCategory | null) => void;
}

// Renders the notification type filters as page-header tabs, reusing the same
// navbar/underline treatment as the Squads directory and Explore headers.
export function NotificationFilterBar({
  categories,
  active,
  onSelect,
}: NotificationFilterBarProps): ReactElement {
  // Match the Squads directory: smaller tabs on mobile, regular on laptop.
  const isLaptop = useViewSize(ViewSize.Laptop);
  const buttonSize = isLaptop ? ButtonSize.Small : ButtonSize.XSmall;

  return (
    <SquadDirectoryNavbar
      aria-label="Filter notifications by type"
      className="!mx-0 min-w-0 flex-1 !border-0 !px-0"
    >
      <SquadDirectoryNavbarItem
        buttonSize={buttonSize}
        isActive={active === null}
        label="All activity"
        ariaLabel="Show all notifications"
        onClick={() => onSelect(null)}
      />
      {categories.map((category) => (
        <SquadDirectoryNavbarItem
          key={category}
          buttonSize={buttonSize}
          isActive={active === category}
          label={notificationFilterCategoryLabel[category]}
          ariaLabel={`Show ${notificationFilterCategoryLabel[category]} notifications`}
          onClick={() => onSelect(category)}
        />
      ))}
    </SquadDirectoryNavbar>
  );
}
