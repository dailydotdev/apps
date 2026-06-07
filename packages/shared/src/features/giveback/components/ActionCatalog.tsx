import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { useGivebackContext } from '../GivebackContext';
import { useGivebackNav } from '../GivebackNavContext';
import type { GivebackAction, GivebackActionCategoryFilter } from '../types';
import { GivebackActionCategory } from '../types';
import { actionCategoryLabels } from '../statusLabels';
import { ArrowIcon, InfoIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { ButtonIconPosition } from '../../../components/buttons/common';
import { ActionCard } from './ActionCard';
import { GivebackFilterChip } from './GivebackFilterChip';
import { GivebackContributorFaces } from './GivebackContributorFaces';
import { GivebackSubmissionModal } from './GivebackSubmissionModal';
import { GivebackSection } from './GivebackSection';
import { GivebackLiveTicker } from './GivebackLiveTicker';
import { formatCompactNumber, formatDonationAmount } from '../utils';

type SortKey = 'recommended' | 'value-desc' | 'value-asc' | 'newest';

const sortOptions: [SortKey, string][] = [
  ['recommended', 'Recommended'],
  ['value-desc', 'Highest value'],
  ['value-asc', 'Lowest value'],
  ['newest', 'Newest'],
];

// Keep the initial grid short so the tab opens scannable; the rest expand on
// demand. 12 fills four clean rows on the 3-column breakpoint (six on the
// 2-column one).
const INITIAL_VISIBLE_ACTIONS = 12;

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
  // "Recommended" leads with popular actions, then by real-time momentum so the
  // catalog surfaces what the community is doing right now.
  return [...actions].sort((a, b) => {
    if (!!a.isTrending !== !!b.isTrending) {
      return a.isTrending ? -1 : 1;
    }
    return (b.contributorsLast24h ?? 0) - (a.contributorsLast24h ?? 0);
  });
};

export const ActionCatalog = (): ReactElement => {
  const {
    actions,
    campaign,
    donationAccounting,
    filteredActions,
    loveActions,
    topContributors,
    userActions,
    selectedCategory,
    setSelectedCategory,
  } = useGivebackContext();
  const { setActiveTab } = useGivebackNav();
  const [submissionAction, setSubmissionAction] =
    useState<GivebackAction | null>(null);
  const [sort, setSort] = useState<SortKey>('recommended');
  const [showAllActions, setShowAllActions] = useState(false);

  // Re-collapse the grid whenever the filter or sort changes so a new view
  // always opens to the short, scannable list.
  useEffect(() => {
    setShowAllActions(false);
  }, [selectedCategory, sort]);

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
  // highlighted "just for love" group. This group sits outside the filters and
  // is always visible below the paid actions, whatever category is selected.
  const isLoveCategory =
    selectedCategory === GivebackActionCategory.CommunityLove;
  const donationToRender = isLoveCategory ? [] : sortedActions;
  const visibleDonationActions = showAllActions
    ? donationToRender
    : donationToRender.slice(0, INITIAL_VISIBLE_ACTIONS);
  const hiddenActionsCount =
    donationToRender.length - visibleDonationActions.length;
  const loveToRender = loveActions;

  // One simple, trust-by-default number: everything you've earned counts the
  // moment you act. Rejected submissions are the only thing we subtract.
  const earnedContribution =
    donationAccounting.unlockedDonationAmount -
    donationAccounting.rejectedDonationAmount;

  const leaderAvatars = topContributors.map((person) => person.avatar);

  return (
    <GivebackSection id="giveback-actions">
      <FlexCol className="mb-4 gap-3 border-b border-border-subtlest-tertiary pb-8 pt-4">
        <button
          type="button"
          onClick={() => setActiveTab('impact')}
          className="group flex w-full items-center justify-between gap-4 text-left"
        >
          <FlexRow className="min-w-0 items-center gap-3">
            {leaderAvatars.length > 0 && (
              <GivebackContributorFaces
                avatars={leaderAvatars}
                totalCount={campaign.backersCount}
                sizeClassName="size-8"
              />
            )}
            <FlexCol className="min-w-0 gap-0.5">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                <span className="font-bold text-text-primary">
                  {formatCompactNumber(campaign.backersCount)}
                </span>{' '}
                developers contributed this week
              </Typography>
            </FlexCol>
          </FlexRow>

          <FlexRow className="shrink-0 items-center gap-1 font-bold text-white typo-footnote">
            See leaderboard
            <span
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              ›
            </span>
          </FlexRow>
        </button>

        <GivebackLiveTicker />
      </FlexCol>

      <FlexRow className="justify-start">
        <FlexCol className="items-start gap-0.5">
          <FlexRow className="items-center gap-1">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              bold
              className="uppercase tracking-wider"
            >
              Your contribution
            </Typography>
            <span className="group/info relative flex">
              <button
                type="button"
                aria-label="How your contribution is counted"
                className="flex text-text-tertiary transition-colors hover:text-text-primary group-focus-within/info:text-text-primary"
              >
                <InfoIcon size={IconSize.Size16} />
              </button>
              <span
                role="tooltip"
                className="pointer-events-none absolute left-0 top-full z-3 mt-2 w-56 rounded-10 border border-border-subtlest-tertiary bg-background-default p-2.5 text-left opacity-0 shadow-2 transition-opacity duration-150 group-focus-within/info:opacity-100 group-hover/info:opacity-100"
              >
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  Counts the moment you act, because we trust you. If a
                  submission is rejected, we&apos;ll subtract it.
                </Typography>
              </span>
            </span>
          </FlexRow>
          <Typography
            bold
            type={TypographyType.Title2}
            className="tabular-nums text-status-success"
          >
            {formatDonationAmount(earnedContribution, 'USD')}
          </Typography>
        </FlexCol>
      </FlexRow>

      <FlexRow className="flex-wrap items-center justify-between gap-3">
        <FlexRow className="flex-wrap gap-2">
          <GivebackFilterChip
            isSelected={selectedCategory === 'all'}
            label="All"
            onClick={() => setSelectedCategory('all')}
          />
          {categories.map((category) => (
            <GivebackFilterChip
              key={category}
              isSelected={selectedCategory === category}
              label={actionCategoryLabels[category]}
              onClick={() =>
                setSelectedCategory(category as GivebackActionCategoryFilter)
              }
            />
          ))}
        </FlexRow>

        <div className="relative shrink-0">
          <select
            aria-label="Sort actions"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="h-8 cursor-pointer appearance-none rounded-10 bg-surface-float pl-3 pr-9 font-medium text-text-primary typo-footnote hover:bg-surface-hover"
          >
            {sortOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ArrowIcon
            size={IconSize.XSmall}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rotate-180 text-text-tertiary"
          />
        </div>
      </FlexRow>

      <FlexCol className="gap-6">
        {donationToRender.length > 0 && (
          <FlexCol className="gap-4">
            <div className="grid gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
              {visibleDonationActions.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  userAction={userActionById.get(action.id)}
                  onSubmit={setSubmissionAction}
                />
              ))}
            </div>
            {donationToRender.length > INITIAL_VISIBLE_ACTIONS && (
              <FlexRow className="justify-center">
                <Button
                  type="button"
                  size={ButtonSize.Medium}
                  variant={ButtonVariant.Float}
                  icon={
                    <ArrowIcon
                      className={showAllActions ? undefined : 'rotate-180'}
                    />
                  }
                  iconPosition={ButtonIconPosition.Right}
                  onClick={() => setShowAllActions((value) => !value)}
                >
                  {showAllActions
                    ? 'Show fewer'
                    : `Show more actions (${hiddenActionsCount})`}
                </Button>
              </FlexRow>
            )}
          </FlexCol>
        )}

        {donationToRender.length === 0 && !isLoveCategory && (
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
                We can&apos;t pay for these, but we&apos;d genuinely appreciate
                them.
              </Typography>
            </FlexCol>
            <div className="grid gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
              {loveToRender.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  userAction={userActionById.get(action.id)}
                  onSubmit={setSubmissionAction}
                />
              ))}
            </div>
          </FlexCol>
        )}
      </FlexCol>

      {submissionAction && (
        <GivebackSubmissionModal
          action={submissionAction}
          onClose={() => setSubmissionAction(null)}
        />
      )}
    </GivebackSection>
  );
};
