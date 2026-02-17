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
import { OpportunityState } from '../../opportunity/protobuf/opportunity';
import { OpportunityCard } from './OpportunityCard';
import TabList from '../../../components/tabs/TabList';

type StateFilterOption = OpportunityState | undefined;

const stateFilterOptions: { label: string; value: StateFilterOption }[] = [
  { label: 'All', value: undefined },
  { label: 'Live', value: OpportunityState.LIVE },
  { label: 'In Review', value: OpportunityState.IN_REVIEW },
  { label: 'Draft', value: OpportunityState.DRAFT },
  { label: 'Closed', value: OpportunityState.CLOSED },
];

const getFilterLabel = (value: StateFilterOption): string => {
  return stateFilterOptions.find((opt) => opt.value === value)?.label ?? 'All';
};

export type DashboardViewProps = {
  opportunities: Opportunity[];
  onAddNew: () => void;
  stateFilter?: StateFilterOption;
  onStateFilterChange?: (state: StateFilterOption) => void;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
};

export const DashboardView = ({
  opportunities,
  onAddNew,
  stateFilter,
  onStateFilterChange,
  hasNextPage,
  onLoadMore,
  isLoadingMore,
}: DashboardViewProps): ReactElement => {
  const handleTabClick = (label: string): void => {
    const option = stateFilterOptions.find((opt) => opt.label === label);
    onStateFilterChange?.(option?.value);
  };

  const currentLabel = getFilterLabel(stateFilter);

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

          {onStateFilterChange && (
            <div className="overflow-x-auto border-b border-border-subtlest-tertiary">
              <TabList
                items={stateFilterOptions.map((opt) => ({ label: opt.label }))}
                active={currentLabel}
                onClick={handleTabClick}
              />
            </div>
          )}

          {opportunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Typography color={TypographyColor.Tertiary}>
                {stateFilter !== undefined
                  ? `No ${currentLabel.toLowerCase()} opportunities`
                  : 'No opportunities found'}
              </Typography>
            </div>
          ) : (
            <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
              {opportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                />
              ))}
            </div>
          )}

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant={ButtonVariant.Secondary}
                onClick={onLoadMore}
                loading={isLoadingMore}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
