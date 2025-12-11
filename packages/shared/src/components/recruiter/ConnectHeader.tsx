import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
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

type ItemProps = {
  children: ReactNode;
  href: string;
  active?: boolean;
};

const Item = ({ children, href, active }: ItemProps) => {
  return (
    <Link href={href}>
      <div
        className={classNames(
          'flex cursor-pointer items-center gap-2 border-b-2 px-3 py-2',
          active
            ? 'border-b-accent-cabbage-default font-bold'
            : 'border-transparent hover:border-b-brand-default',
        )}
      >
        {children}
      </div>
    </Link>
  );
};

type ConnectHeaderProps = {
  activeTab?: 'review' | 'intros';
};

export const ConnectHeader = ({
  activeTab,
}: ConnectHeaderProps = {}): ReactElement => {
  const { opportunity } = useOpportunityContext();

  const opportunityId = opportunity?.id;
  const forReviewHref = opportunityId
    ? `/recruiter/${opportunityId}/matches`
    : '#';
  const introsHref = opportunityId
    ? `/recruiter/${opportunityId}/matches/intros`
    : '#';

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
        <Item href={forReviewHref} active={activeTab === 'review'}>
          For Review
        </Item>
        <Item href={introsHref} active={activeTab === 'intros'}>
          Intros
        </Item>
      </FlexRow>
    </FlexCol>
  );
};
