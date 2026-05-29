import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { UpgradeToPlus } from '../../UpgradeToPlus';
import { DevPlusIcon } from '../../icons';
import { IconSize } from '../../Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { TargetId } from '../../../lib/log';

type FeedSettingsPlusGateProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export const FeedSettingsPlusGate = ({
  children,
  title = 'Unlock advanced feed settings',
  description = 'Upgrade to daily.dev Plus to fine-tune this feed with sources, content preferences, filters, and blocking.',
}: FeedSettingsPlusGateProps): ReactElement => {
  const { isPlus } = usePlusSubscription();

  if (isPlus) {
    return <>{children}</>;
  }

  return (
    <div className="flex w-full flex-col items-center gap-4 rounded-12 border border-border-subtlest-tertiary bg-action-plus-float p-6 text-center">
      <DevPlusIcon
        size={IconSize.XLarge}
        className="text-action-plus-default"
      />
      <Typography type={TypographyType.Title3} bold>
        {title}
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="max-w-80"
      >
        {description}
      </Typography>
      <UpgradeToPlus target={TargetId.FeedSettings} />
    </div>
  );
};
