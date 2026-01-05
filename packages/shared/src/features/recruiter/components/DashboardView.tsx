import type { ReactElement } from 'react';
import React from 'react';
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
import { PlusIcon } from '../../../components/icons';
import type { Opportunity } from '../../opportunity/types';
import { OpportunityCard } from './OpportunityCard';

export type DashboardViewProps = {
  opportunities: Opportunity[];
  onAddNew: () => void;
};

export const DashboardView = ({
  opportunities,
  onAddNew,
}: DashboardViewProps): ReactElement => {
  return (
    <div className="relative mx-4 mt-10 max-w-[47.875rem] tablet:mx-auto">
      <div className="flex flex-col gap-8 tablet:mx-4 laptop:mx-0">
        <div className="flex flex-col gap-2 text-center">
          <Typography type={TypographyType.Title1} bold>
            Your Opportunities
          </Typography>
          <Typography color={TypographyColor.Tertiary}>
            Manage your job opportunities and find top candidates
          </Typography>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Typography type={TypographyType.Title2} bold>
              All Opportunities ({opportunities.length})
            </Typography>
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={onAddNew}
            >
              Add New
            </Button>
          </div>

          <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
