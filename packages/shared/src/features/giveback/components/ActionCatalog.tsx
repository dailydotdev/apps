import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { useGivebackContext } from '../GivebackContext';
import type { GivebackAction, GivebackActionCategoryFilter } from '../types';
import { GivebackActionCategory } from '../types';
import { actionCategoryLabels } from '../statusLabels';
import { ActionCard } from './ActionCard';
import { GivebackSubmissionModal } from './GivebackSubmissionModal';
import { GivebackSection } from './GivebackSection';
import { formatDonationAmount } from '../utils';

interface FilterChipProps {
  isSelected: boolean;
  label: string;
  onClick: () => void;
}

const FilterChip = ({
  isSelected,
  label,
  onClick,
}: FilterChipProps): ReactElement => (
  <button
    type="button"
    aria-pressed={isSelected}
    className={classNames(
      'h-8 shrink-0 rounded-10 px-3 font-medium transition-colors typo-footnote',
      isSelected
        ? 'bg-accent-cabbage-default text-white'
        : 'bg-surface-float text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
    )}
    onClick={onClick}
  >
    {label}
  </button>
);

type SortKey = 'recommended' | 'value-desc' | 'value-asc' | 'newest';

const sortOptions: [SortKey, string][] = [
  ['recommended', 'Recommended'],
  ['value-desc', 'Highest value'],
  ['value-asc', 'Lowest value'],
  ['newest', 'Newest'],
];

const sortActions = (
  actions: GivebackAction[],
  sort: SortKey,
): GivebackAction[] => {
  if (sort === 'value-desc') {
    return [...actions].sort((a, b) => b.donationAmount - a.donationAmount);
  }
  if (sort === 'value-asc') {
    return [...actions].sort((a, b) => a.donationAmount - b.donationAmount);
  }
  if (sort === 'newest') {
    // No timestamps in the mock layer; treat later catalog entries as newer.
    return [...actions].reverse();
  }
  return actions;
};

export const ActionCatalog = (): ReactElement => {
  const {
    actions,
    donationAccounting,
    filteredActions,
    loveActions,
    userActions,
    selectedCategory,
    setSelectedCategory,
  } = useGivebackContext();
  const [submissionAction, setSubmissionAction] =
    useState<GivebackAction | null>(null);
  const [sort, setSort] = useState<SortKey>('recommended');

  const categories = useMemo(
    () =>
      Array.from(
        new Set([...actions, ...loveActions].map((action) => action.category)),
      ),
    [actions, loveActions],
  );
  const userActionById = useMemo(
    () =>
      new Map(
        userActions.map((userAction) => [userAction.actionId, userAction]),
      ),
    [userActions],
  );
  const sortedActions = useMemo(
    () => sortActions(filteredActions, sort),
    [filteredActions, sort],
  );

  // Love actions live in the same catalog but are non-paid, so they render as a
  // highlighted "just for love" group rather than alongside the paid missions.
  const isLoveCategory =
    selectedCategory === GivebackActionCategory.CommunityLove;
  const donationToRender = isLoveCategory ? [] : sortedActions;
  const loveToRender =
    selectedCategory === 'all' || isLoveCategory ? loveActions : [];
  const hasResults = donationToRender.length > 0 || loveToRender.length > 0;

  // One simple, trust-by-default number: everything you've earned counts the
  // moment you act. Rejected submissions are the only thing we subtract.
  const earnedContribution =
    donationAccounting.unlockedDonationAmount -
    donationAccounting.rejectedDonationAmount;

  return (
    <GivebackSection id="giveback-actions">
      <FlexCol className="gap-1">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          bold
          className="uppercase tracking-wider"
        >
          Your contribution
        </Typography>
        <Typography
          bold
          type={TypographyType.Title1}
          className="tabular-nums text-status-success"
        >
          {formatDonationAmount(earnedContribution, 'USD')}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="max-w-md"
        >
          Counts the moment you act — we trust you. If a submission is rejected,
          we&apos;ll subtract it.
        </Typography>
      </FlexCol>

      <FlexRow className="flex-wrap items-center justify-between gap-3">
        <FlexRow className="flex-wrap gap-2">
          <FilterChip
            isSelected={selectedCategory === 'all'}
            label="All"
            onClick={() => setSelectedCategory('all')}
          />
          {categories.map((category) => (
            <FilterChip
              key={category}
              isSelected={selectedCategory === category}
              label={actionCategoryLabels[category]}
              onClick={() =>
                setSelectedCategory(category as GivebackActionCategoryFilter)
              }
            />
          ))}
        </FlexRow>

        <FlexRow className="shrink-0 items-center gap-2">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Sort
          </Typography>
          <select
            aria-label="Sort actions"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="h-8 rounded-10 bg-surface-float px-2 font-medium text-text-primary typo-footnote"
          >
            {sortOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FlexRow>
      </FlexRow>

      {hasResults ? (
        <FlexCol className="gap-6">
          {donationToRender.length > 0 && (
            <div className="grid gap-3 tablet:grid-cols-2">
              {donationToRender.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  userAction={userActionById.get(action.id)}
                  onSubmit={setSubmissionAction}
                />
              ))}
            </div>
          )}

          {loveToRender.length > 0 && (
            <FlexCol className="gap-3">
              <FlexCol className="gap-0.5">
                <Typography
                  bold
                  type={TypographyType.Footnote}
                  className="text-accent-cabbage-default"
                >
                  Just for love
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  We can&apos;t pay for these — but we&apos;d genuinely
                  appreciate them.
                </Typography>
              </FlexCol>
              <div className="grid gap-3 tablet:grid-cols-2">
                {loveToRender.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    userAction={userActionById.get(action.id)}
                  />
                ))}
              </div>
            </FlexCol>
          )}
        </FlexCol>
      ) : (
        <FlexCol className="items-center gap-1 py-10 text-center">
          <Typography bold type={TypographyType.Callout}>
            No actions match this filter
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Try another filter.
          </Typography>
        </FlexCol>
      )}

      {submissionAction && (
        <GivebackSubmissionModal
          action={submissionAction}
          onClose={() => setSubmissionAction(null)}
        />
      )}
    </GivebackSection>
  );
};
