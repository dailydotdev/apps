import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons/DevPlus';
import { MedalBadgeIcon } from '@dailydotdev/shared/src/components/icons/MedalBadge';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';

export const quiet = {
  variant: ButtonVariant.Tertiary,
  size: ButtonSize.Small,
} as const;

export const Divider = (): ReactElement => (
  <span aria-hidden className="mx-1 h-6 w-px bg-border-subtlest-tertiary" />
);

export const Arrows = (): ReactElement => (
  <span className="flex items-center gap-1">
    <Button
      {...quiet}
      icon={<ArrowIcon className="-rotate-90" />}
      aria-label="Previous"
      disabled
    />
    <Button
      {...quiet}
      icon={<ArrowIcon className="rotate-90" />}
      aria-label="Next"
    />
  </span>
);

/** One attention dot for every control that wants a look. */
export const AttentionDot = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <span className="relative inline-flex">
    {children}
    <span
      aria-hidden
      className="pointer-events-none absolute right-1 top-1 size-2 rounded-[999px] bg-accent-cabbage-default ring-2 ring-background-default"
    />
  </span>
);

export const AchievementGlyph = ({
  hasDot = true,
}: {
  hasDot?: boolean;
}): ReactElement => (
  <span className="relative inline-flex">
    <MedalBadgeIcon secondary size={IconSize.Small} />
    {hasDot && (
      <span className="absolute -right-0.5 -top-0.5 size-2 rounded-[999px] bg-accent-bacon-default" />
    )}
  </span>
);

export const PlusGlyph = (): ReactElement => (
  <DevPlusIcon className="text-accent-bacon-default" />
);

export const Greeting = ({
  subtitle = 'Wednesday, October 28',
  isCompact,
}: {
  subtitle?: string;
  isCompact?: boolean;
}): ReactElement => (
  <div className="flex min-w-0 flex-1 flex-col">
    <span
      className={classNames(
        'truncate font-bold text-text-primary',
        isCompact ? 'typo-body' : 'typo-title3',
      )}
    >
      Good morning, Alex
    </span>
    {!isCompact && (
      <span className="truncate text-text-tertiary typo-footnote">
        {subtitle}
      </span>
    )}
  </div>
);

export const RailStub = ({
  columns = 3,
}: {
  columns?: number;
}): ReactElement => (
  <div
    className="grid gap-4"
    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
  >
    {Array.from({ length: columns }, (_, i) => (
      <div
        // A fixed row of placeholders; their order never changes.
        // eslint-disable-next-line react/no-array-index-key
        key={i}
        className="h-24 rounded-16 border border-border-subtlest-tertiary bg-surface-float"
      />
    ))}
  </div>
);

export const Tabs = ({
  feeds = ['Frontend'],
}: {
  feeds?: string[];
}): ReactElement => (
  <div className="flex items-center gap-1">
    <Button
      variant={ButtonVariant.Float}
      size={ButtonSize.Small}
      pressed
      icon={<ArrowIcon size={IconSize.Size16} className="rotate-180" />}
      iconPosition={ButtonIconPosition.Right}
    >
      For you
    </Button>
    {feeds.map((feed) => (
      <Button key={feed} {...quiet}>
        {feed}
      </Button>
    ))}
    <Button {...quiet} icon={<PlusIcon />} aria-label="New feed" />
  </div>
);

export const Frame = ({
  header,
  tabs,
  subtitle,
  tabsStart,
  width = 'max-w-[60rem]',
  columns = 3,
  isCompact,
}: {
  header: ReactNode;
  tabs?: ReactNode;
  subtitle?: string;
  tabsStart?: ReactNode;
  width?: string;
  columns?: number;
  isCompact?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'flex w-full flex-col gap-4 rounded-24 border border-border-subtlest-tertiary bg-background-default',
      isCompact ? 'p-4' : 'p-6',
      width,
    )}
  >
    <div className="flex min-h-12 items-center gap-2">
      <Greeting subtitle={subtitle} isCompact={isCompact} />
      <div className="flex shrink-0 items-center gap-1">{header}</div>
    </div>
    <RailStub columns={columns} />
    <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary pb-3">
      <div className="min-w-0 flex-1 overflow-hidden">
        {tabsStart ?? <Tabs />}
      </div>
      {tabs && <div className="flex shrink-0 items-center gap-1">{tabs}</div>}
    </div>
  </div>
);
