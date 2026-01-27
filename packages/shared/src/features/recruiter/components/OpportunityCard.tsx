import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { EditIcon, UserIcon, MoveToIcon } from '../../../components/icons';
import Link from '../../../components/utilities/Link';
import { webappUrl } from '../../../lib/constants';
import type { Opportunity } from '../../opportunity/types';
import { OpportunityState } from '../../opportunity/protobuf/opportunity';

const getCardUrl = (opportunity: Opportunity): string => {
  const { id, state, flags } = opportunity;
  const isPaid = !!flags?.plan;
  const isLive = state === OpportunityState.LIVE;

  if (isPaid && isLive) {
    return `${webappUrl}recruiter/${id}/matches`;
  }

  if (isPaid) {
    return `${webappUrl}recruiter/${id}/prepare`;
  }

  return `${webappUrl}recruiter/${id}/plans`;
};

const getStateLabel = (state: OpportunityState): string => {
  switch (state) {
    case OpportunityState.LIVE:
      return 'Live';
    case OpportunityState.DRAFT:
      return 'Draft';
    case OpportunityState.IN_REVIEW:
      return 'In Review';
    case OpportunityState.CLOSED:
      return 'Closed';
    default:
      return 'Unknown';
  }
};

const getStateColor = (state: OpportunityState): string => {
  switch (state) {
    case OpportunityState.LIVE:
      return 'bg-accent-cabbage-default text-white';
    case OpportunityState.DRAFT:
      return 'bg-surface-float border border-border-subtlest-tertiary text-text-secondary';
    case OpportunityState.IN_REVIEW:
      return 'bg-accent-cheese-default text-raw-pepper-90';
    case OpportunityState.CLOSED:
      return 'bg-surface-float border border-border-subtlest-tertiary text-text-tertiary';
    default:
      return 'bg-surface-float border border-border-subtlest-tertiary text-text-secondary';
  }
};

export type OpportunityCardProps = {
  opportunity: Opportunity;
};

const getActionIcon = (opportunity: Opportunity): ReactElement | null => {
  const { state, flags } = opportunity;
  const isPaid = !!flags?.plan;
  const isLive = state === OpportunityState.LIVE;
  const isDraft = state === OpportunityState.DRAFT;

  if (isPaid && isLive) {
    return <UserIcon className="text-text-tertiary" />;
  }

  if (isPaid && !isLive) {
    return <EditIcon className="text-text-tertiary" />;
  }

  if (!isPaid && isDraft) {
    return <MoveToIcon className="text-text-tertiary" />;
  }

  return null;
};

export const OpportunityCard = ({
  opportunity,
}: OpportunityCardProps): ReactElement => {
  const { title, organization, state } = opportunity;

  return (
    <Link href={getCardUrl(opportunity)}>
      <a className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 transition-colors hover:border-border-subtlest-secondary">
        {organization?.image && (
          <img
            src={organization.image}
            alt={organization.name}
            className="h-12 w-12 rounded-12 object-cover"
          />
        )}

        <div className="flex flex-1 flex-col gap-1">
          <Typography type={TypographyType.Title3} bold>
            {title}
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            {organization?.name || 'Company'}
          </Typography>
        </div>

        <div className="flex items-center justify-between">
          <span
            className={classNames(
              'rounded-8 px-2 py-1 typo-caption1',
              getStateColor(state),
            )}
          >
            {getStateLabel(state)}
          </span>

          {getActionIcon(opportunity)}
        </div>
      </a>
    </Link>
  );
};
