import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { EyeIcon, ReputationLightningIcon, SettingsIcon } from '../icons';
import { IconSize } from '../Icon';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { FlexRow } from '../utilities';
import { BoostIcon } from '../icons/Boost';

export const ConnectHeader = (): ReactElement => {
  return (
    <FlexRow className="items-center justify-between p-4">
      <div>
        <Typography type={TypographyType.Title2} bold>
          Senior Frontend Developer
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="flex flex-row gap-1"
        >
          <ReputationLightningIcon
            className="text-action-upvote-default"
            secondary
            size={IconSize.XSmall}
          />{' '}
          <strong>Autopilot ON:</strong> We will reach out to 500 per day
        </Typography>
      </div>
      <FlexRow className="gap-2">
        <Button
          variant={ButtonVariant.Subtle}
          icon={<EyeIcon />}
          size={ButtonSize.Small}
        >
          Job page
        </Button>
        <Button
          variant={ButtonVariant.Primary}
          icon={<BoostIcon />}
          size={ButtonSize.Small}
        >
          Boost
        </Button>
        <Button
          icon={<SettingsIcon />}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
        />
      </FlexRow>
    </FlexRow>
  );
};
