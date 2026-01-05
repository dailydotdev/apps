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
import { EditIcon, UserIcon } from '../../../components/icons';
import { webappUrl } from '../../../lib/constants';
import type { Opportunity } from '../../opportunity/types';
import { OpportunityState } from '../../opportunity/protobuf/opportunity';

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
      return 'bg-accent-cabbage-default';
    case OpportunityState.DRAFT:
      return 'bg-surface-secondary';
    case OpportunityState.IN_REVIEW:
      return 'bg-accent-cheese-default';
    case OpportunityState.CLOSED:
      return 'bg-surface-tertiary';
    default:
      return 'bg-surface-secondary';
  }
};

export type OpportunityCardProps = {
  opportunity: Opportunity;
};

export const OpportunityCard = ({
  opportunity,
}: OpportunityCardProps): ReactElement => {
  const { title, organization, id, state } = opportunity;

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
            'rounded-8 px-2 py-1 text-text-primary typo-caption1',
            getStateColor(state),
          )}
        >
          {getStateLabel(state)}
        </span>

        <div className="flex items-center gap-1">
          <Button
            tag="a"
            href={`${webappUrl}recruiter/${id}/matches`}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<UserIcon />}
            title="View matches"
          />
          <Button
            tag="a"
            href={`${webappUrl}recruiter/${id}/prepare`}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<EditIcon />}
            title="Edit opportunity"
          />
        </div>
      </div>
    </div>
  );
};
