import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { BoostIcon } from '@dailydotdev/shared/src/components/icons/Boost';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

// The strip that offers a boost on your own post: a title, Boost and the close
// button. Every own-post screen uses it.

const BoostButton = ({
  className,
  onClick,
}: {
  className?: string;
  onClick: () => void;
}): ReactElement => (
  <Button
    className={classNames('shrink-0', className)}
    variant={ButtonVariant.Primary}
    color={ButtonColor.BlueCheese}
    size={ButtonSize.Small}
    onClick={onClick}
  >
    Boost
  </Button>
);

const StripIcon = (): ReactElement => (
  <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-accent-blueCheese-flat text-accent-blueCheese-default">
    <BoostIcon size={IconSize.Small} />
  </span>
);

/** One row from tablet: the title, then Boost and the close button on the
 * right. On phones the whole title shows, with Boost full width below it */
export const BoostStripCompact = ({
  title,
  onBoost,
  onDismiss,
}: {
  title: ReactNode;
  onBoost: () => void;
  onDismiss?: () => void;
}): ReactElement => (
  <div className="flex w-full flex-wrap items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-2 pl-3 tablet:flex-nowrap">
    <StripIcon />
    <span className="min-w-0 flex-1 typo-callout tablet:truncate">{title}</span>
    <BoostButton
      className="order-last w-full tablet:order-none tablet:w-auto"
      onClick={onBoost}
    />
    {onDismiss && (
      <CloseButton
        size={ButtonSize.Small}
        aria-label="Dismiss"
        onClick={onDismiss}
      />
    )}
  </div>
);
