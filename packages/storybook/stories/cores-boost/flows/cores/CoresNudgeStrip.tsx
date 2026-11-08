import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import stripArt from '../../assets/boost-strip-patchy-v2.png';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BoostIcon } from '@dailydotdev/shared/src/components/icons/Boost';
import { CoreIcon, MiniCloseIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';

// New, on your own post once the balance covers the smallest boost. Same
// frame as the production BoostNewPostStrip (features/boost), with the
// balance as the reason and its own Boost button (no arrow to the header).

export interface CoresNudgeStripProps {
  balance: number;
  onBoost: () => void;
  onClose?: () => void;
  className?: string;
}

export function CoresNudgeStrip({
  balance,
  onBoost,
  onClose,
  className,
}: CoresNudgeStripProps): ReactElement {
  return (
    <div
      className={classNames(
        'relative flex min-h-10 w-full flex-row rounded-8 border border-accent-blueCheese-default p-2',
        className,
      )}
    >
      {/* New art: kept to the left so it never sits behind the copy */}
      <img
        src={stripArt}
        alt=""
        className="pointer-events-none absolute inset-y-0 left-0 z-0 hidden h-full w-auto max-w-none rounded-l-8 tablet:block"
      />
      <div className="z-1 flex w-full flex-row items-center gap-1 tablet:pl-24">
        <CoreIcon size={IconSize.Medium} className="shrink-0" />
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Callout}
          className="min-w-0 flex-1"
        >
          <span>You have</span>
          <strong className="mx-1">
            {formatCoresCurrency(balance)} Cores,
          </strong>
          <span>enough to boost this post</span>
        </Typography>
        <Button
          className="ml-auto shrink-0"
          variant={ButtonVariant.Primary}
          size={ButtonSize.XSmall}
          icon={<BoostIcon />}
          onClick={onBoost}
        >
          Boost
        </Button>
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MiniCloseIcon />}
          onClick={onClose}
        />
      </div>
    </div>
  );
}
