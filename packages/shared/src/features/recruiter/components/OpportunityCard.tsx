import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { EditIcon, UserIcon, MoveToIcon } from '../../../components/icons';
import { webappUrl } from '../../../lib/constants';
import type { Opportunity } from '../../opportunity/types';
import { OpportunityState } from '../../opportunity/protobuf/opportunity';

const getNextStepUrl = (opportunity: Opportunity): string => {
  const { id, flags } = opportunity;
  const isPaid = !!flags?.plan;

  if (!isPaid) {
    return `${webappUrl}recruiter/${id}/plans`;
  }

  return `${webappUrl}recruiter/${id}/edit`;
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

export const OpportunityCard = ({
  opportunity,
}: OpportunityCardProps): ReactElement => {
  const { title, organization, id, state, flags } = opportunity;
  const isPaid = !!flags?.plan;
  const isLive = state === OpportunityState.LIVE;
  const isDraft = state === OpportunityState.DRAFT;

  return (
    <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
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
        <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
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

        <div className="flex items-center gap-1">
          {/* Show matches button only if paid AND live */}
          {isPaid && isLive && (
            <Button
              tag="a"
              href={`${webappUrl}recruiter/${id}/matches`}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<UserIcon />}
              title="View matches"
            />
          )}

          {/* Show edit button only if paid */}
          {isPaid && (
            <Button
              tag="a"
              href={`${webappUrl}recruiter/${id}/edit`}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<EditIcon />}
              title="Edit opportunity"
            />
          )}

          {/* Show continue button if not paid (draft needs to complete payment) */}
          {!isPaid && isDraft && (
            <Button
              tag="a"
              href={getNextStepUrl(opportunity)}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<MoveToIcon />}
              title="Continue setup"
            />
          )}
        </div>
      </div>
    </div>
  );
};
