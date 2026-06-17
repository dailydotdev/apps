import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { NotificationFilterCategory } from '@dailydotdev/shared/src/components/notifications/utils';
import { notificationFilterCategoryLabel } from '@dailydotdev/shared/src/components/notifications/utils';

interface NotificationFilterBarProps {
  categories: NotificationFilterCategory[];
  active: NotificationFilterCategory | null;
  onSelect: (category: NotificationFilterCategory | null) => void;
}

const Chip = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}): ReactElement => (
  <Button
    type="button"
    size={ButtonSize.Small}
    variant={isActive ? ButtonVariant.Primary : ButtonVariant.Float}
    onClick={onClick}
    aria-pressed={isActive}
    className="shrink-0"
  >
    {label}
  </Button>
);

export function NotificationFilterBar({
  categories,
  active,
  onSelect,
}: NotificationFilterBarProps): ReactElement {
  return (
    <div
      className="no-scrollbar sticky top-0 z-2 flex items-center gap-2 overflow-x-auto border-b border-border-subtlest-tertiary bg-background-default px-4 py-3"
      role="group"
      aria-label="Filter notifications by type"
    >
      <Chip
        label="All activity"
        isActive={active === null}
        onClick={() => onSelect(null)}
      />
      {categories.map((category) => (
        <Chip
          key={category}
          label={notificationFilterCategoryLabel[category]}
          isActive={active === category}
          onClick={() => onSelect(category)}
        />
      ))}
    </div>
  );
}
