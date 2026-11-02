import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { WidgetContainer } from '../widgets/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { CoreIcon } from '../icons';
import { IconSize } from '../Icon';
import { UpgradeToPlus } from '../UpgradeToPlus';
import { ButtonSize } from '../buttons/Button';
import { TargetId } from '../../lib/log';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';

interface PlusCoresGivebackWidgetProps {
  className?: string;
}

export const PlusCoresGivebackWidget = ({
  className,
}: PlusCoresGivebackWidgetProps): ReactElement | null => {
  const { isPlus } = usePlusSubscription();

  if (isPlus) {
    return null;
  }

  return (
    <WidgetContainer
      className={classNames('flex min-w-0 flex-col gap-4 p-6', className)}
      style={{
        backgroundImage:
          'radial-gradient(90% 70% at 100% 0%, color-mix(in srgb, var(--theme-accent-cheese-default) 16%, transparent) 0%, transparent 70%)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-overlay-float-cheese text-accent-cheese-default">
          <CoreIcon size={IconSize.Medium} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Typography type={TypographyType.Body} bold>
            Get 50% back in Cores with Plus
          </Typography>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            Every Plus payment, renewals included, gives you 50% back as Cores.
          </Typography>
        </div>
      </div>
      <UpgradeToPlus
        size={ButtonSize.Medium}
        target={TargetId.CoreWallet}
        label="Upgrade to Plus"
        className="w-full"
      />
    </WidgetContainer>
  );
};
