import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { EyeIcon, ReputationLightningIcon } from '../icons';
import { IconSize } from '../Icon';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { FlexCol, FlexRow } from '../utilities';
import { BoostIcon } from '../icons/Boost';
import Link from '../utilities/Link';
import { useOpportunityContext } from '../../features/opportunity/context/OpportunityContext';
import { boostOpportunityLink, opportunityUrl } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';

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

  const flags = opportunity?.flags || {};
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
            <strong>Autopilot ON:</strong>
            {!!flags?.batchSize &&
              `We will reach out to ${flags.batchSize} candidates per day`}
            {!flags?.batchSize &&
              'We will start reaching out to candidates soon'}
          </Typography>
        </div>
        <FlexRow className="gap-4">
          <Button
            variant={ButtonVariant.Subtle}
            icon={<EyeIcon />}
            size={ButtonSize.Small}
            href={`${opportunityUrl}/${opportunityId || ''}`}
            tag="a"
            target="_blank"
            rel={anchorDefaultRel}
          >
            Job page
          </Button>
          <Button
            variant={ButtonVariant.Primary}
            icon={<BoostIcon />}
            size={ButtonSize.Small}
            href={boostOpportunityLink}
            tag="a"
            target="_blank"
            rel={anchorDefaultRel}
          >
            Boost
          </Button>
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
