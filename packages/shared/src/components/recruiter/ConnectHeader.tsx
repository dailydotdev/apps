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
import { FlexCol, FlexRow } from '../utilities';
import { BoostIcon } from '../icons/Boost';
import Link from '../utilities/Link';
import { useOpportunityContext } from '../../features/opportunity/context/OpportunityContext';

const Item = ({ children }) => {
  return (
    <Link href="#">
      <div className="flex cursor-pointer items-center gap-2 border-b border-transparent px-3 py-2 hover:border-b-brand-default">
        {children}
      </div>
    </Link>
  );
};

export const ConnectHeader = (): ReactElement => {
  const { opportunity } = useOpportunityContext();

  return (
    <FlexCol>
      <FlexRow className="items-center justify-between p-4">
        <div>
          <Typography type={TypographyType.Title2} bold>
            {opportunity?.title || 'Loading...'}
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
      <FlexRow className="border-b border-border-subtlest-tertiary px-4">
        <Item>For Review</Item>
        <Item>Intros</Item>
      </FlexRow>
    </FlexCol>
  );
};
