import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { CharmEmptyState } from '../../../components/charm/CharmEmptyState';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { cloudinaryCharmSearchNoResults } from '../../../lib/image';
import { MOCK_NOW_MS } from '../mockDeals';
import type { Deal } from '../types';
import { DealState } from '../types';
import { getDealsDirectoryEvidence, isLiveDeal } from '../dealsFormat';
import type { DealsMockState } from '../useDealsMockState';
import { useDealsMockState } from '../useDealsMockState';
import { DealListCard } from './DealListCard';
import { DealImpactWidget } from './DealImpactWidget';
import {
  DealsFilterBar,
  DEALS_FILTER_ALL,
  matchesDealFilter,
} from './DealsFilterBar';
import { DealsHero } from './DealsHero';
import { DealsRail } from './DealsRail';

interface DealsDirectoryPageProps {
  deals: Deal[];
  /** The set the filter chips are built from, so a faceted page can still link
   * to every other category while rendering only its own deals. */
  filterDeals?: Deal[];
  isLoggedOut?: boolean;
  initialQuery?: string;
  initialFilter?: string;
  heading?: string;
  intro?: string;
  resultsTitle?: string;
  withRails?: boolean;
  onDealClick?: (deal: Deal) => void;
  onShare?: (deal: Deal) => void;
  onClaim?: (deal: Deal) => void;
  state?: DealsMockState;
  now?: number;
}

interface DealRail {
  title: string;
  label?: string;
  deals: Deal[];
}

const MY_TAG_CATEGORIES = ['AI tools', 'Dev tools', 'Cloud'];

const SHORTCUT_CATEGORIES = ['AI tools', 'Cloud', 'Hardware', 'Courses'];

const RAIL_SIZE = 8;

const matchesQuery = (deal: Deal, query: string): boolean => {
  const haystack = [deal.title, deal.brand.name, ...deal.categories]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
};

const JoinTeaser = (): ReactElement => (
  <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
    <Typography tag={TypographyTag.H2} type={TypographyType.Body} bold>
      Join daily.dev to claim deals
    </Typography>
    <Typography
      tag={TypographyTag.P}
      type={TypographyType.Callout}
      color={TypographyColor.Tertiary}
    >
      Browsing is open to everyone. An account keeps your codes in one place and
      unlocks the members only drops.
    </Typography>
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
    >
      Join daily.dev
    </Button>
  </div>
);

export const DealsDirectoryPage = ({
  deals,
  filterDeals,
  isLoggedOut = false,
  initialQuery = '',
  initialFilter = DEALS_FILTER_ALL,
  heading,
  intro,
  resultsTitle = 'All deals',
  withRails = true,
  onDealClick,
  onShare,
  onClaim,
  state,
  now = MOCK_NOW_MS,
}: DealsDirectoryPageProps): ReactElement => {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState(initialFilter);
  const [claimMessage, setClaimMessage] = useState('');
  const ownState = useDealsMockState({ now });
  const dealsState = state ?? ownState;
  const { claimedDealIds, upvotedIds, impact } = dealsState;

  const trimmedQuery = query.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;

  const evidence = useMemo(
    () => getDealsDirectoryEvidence(deals.filter(isLiveDeal)),
    [deals],
  );

  const filteredDeals = useMemo(
    () => deals.filter((deal) => matchesDealFilter(deal, filter)),
    [deals, filter],
  );

  const results = useMemo(
    () =>
      isSearching
        ? filteredDeals.filter((deal) => matchesQuery(deal, trimmedQuery))
        : filteredDeals,
    [filteredDeals, isSearching, trimmedQuery],
  );

  const rails = useMemo(() => {
    const live = filteredDeals.filter(isLiveDeal);
    const candidates: DealRail[] = [
      {
        title: 'Ending soon',
        deals: filteredDeals
          .filter((deal) => deal.state === DealState.Expiring)
          .sort((a, b) => (a.expiresAt ?? '').localeCompare(b.expiresAt ?? '')),
      },
      {
        title: 'Community picks',
        label: 'Chosen on merit, never paid for',
        deals: live.filter((deal) => deal.isCommunityPick),
      },
      {
        title: 'For you',
        label: 'Based on your tags',
        deals: live.filter((deal) =>
          deal.categories.some((category) =>
            MY_TAG_CATEGORIES.includes(category),
          ),
        ),
      },
      {
        title: 'Trending',
        deals: [...live].sort(
          (a, b) => b.community.upvotes - a.community.upvotes,
        ),
      },
      {
        title: 'New this week',
        deals: [...live].sort((a, b) =>
          b.publishedAt.localeCompare(a.publishedAt),
        ),
      },
    ];

    const allocated = new Set<string>();

    return candidates.reduce<DealRail[]>((list, rail) => {
      const allocatedDeals: Deal[] = [];

      rail.deals.forEach((deal) => {
        if (allocatedDeals.length >= RAIL_SIZE || allocated.has(deal.id)) {
          return;
        }

        allocated.add(deal.id);
        allocatedDeals.push(deal);
      });

      return allocatedDeals.length > 0
        ? [...list, { ...rail, deals: allocatedDeals }]
        : list;
    }, []);
  }, [filteredDeals]);

  const onCategoryShortcut = (category: string): void => {
    setQuery('');
    setFilter(category);
  };

  const onClaimDeal = (deal: Deal): void => {
    const claim = dealsState.claimDeal(deal);

    if (!claim) {
      setClaimMessage(`${deal.title} is already in My coupons.`);

      return;
    }

    setClaimMessage(`${deal.title} is saved to My coupons.`);
    onClaim?.(deal);
  };

  const onShareDeal = onShare ?? onDealClick;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 tablet:px-8 laptop:px-12">
      <DealsHero
        query={query}
        onQueryChange={setQuery}
        heading={heading}
        intro={intro}
        evidence={evidence}
      />
      <DealsFilterBar
        deals={filterDeals ?? deals}
        activeFilter={filter}
        onFilterChange={setFilter}
        withCategoryLinks
        className="py-2"
      />

      <div className="mt-6 flex flex-col gap-8 pb-16 laptop:flex-row laptop:items-start laptop:gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-10">
          {withRails &&
            !isSearching &&
            rails.map(({ title, label, deals: railDeals }) => (
              <DealsRail
                key={title}
                title={title}
                label={label}
                deals={railDeals}
                onDealClick={onDealClick}
                onClaim={onClaimDeal}
                onShare={onShareDeal}
                onUpvote={dealsState.toggleUpvote}
                claimedDealIds={claimedDealIds}
                upvotedIds={upvotedIds}
                now={now}
              />
            ))}

          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline gap-2">
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Title3}
                bold
              >
                {isSearching ? 'Search results' : resultsTitle}
              </Typography>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                aria-live="polite"
                className="tabular-nums"
              >
                {results.length} {results.length === 1 ? 'deal' : 'deals'}
                {isSearching ? ` match "${query.trim()}"` : ''}
              </Typography>
            </div>

            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Footnote}
              color={TypographyColor.StatusSuccess}
              aria-live="polite"
            >
              {claimMessage}
            </Typography>

            {results.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {results.map((deal) => (
                  <DealListCard
                    key={deal.id}
                    deal={deal}
                    onClaim={onClaimDeal}
                    onOpenDetail={onDealClick}
                    onShare={onShareDeal}
                    isClaimedByMe={claimedDealIds.has(deal.id)}
                    now={now}
                  />
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-4 py-8">
                <CharmEmptyState
                  className="max-w-[32rem]"
                  image={cloudinaryCharmSearchNoResults}
                  imageAlt="daily.dev charm searching with a magnifying glass"
                  title={
                    isSearching
                      ? 'Nothing matches that search'
                      : 'No deals in this category yet'
                  }
                  description="No live offer fits yet. Try a broader term or start from another category."
                />
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {SHORTCUT_CATEGORIES.map((category) => (
                    <Button
                      key={category}
                      type="button"
                      size={ButtonSize.Small}
                      variant={ButtonVariant.Float}
                      onClick={() => onCategoryShortcut(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                <Button
                  type="button"
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Tertiary}
                >
                  Request a deal
                </Button>
              </div>
            )}
          </section>
        </div>

        <div className="hidden w-80 flex-col gap-4 laptop:flex">
          {isLoggedOut ? (
            <JoinTeaser />
          ) : (
            <DealImpactWidget
              claimedCount={impact.claimedCount}
              totalSavedUsd={impact.savedUsd}
              invitesDone={impact.invitesDone}
              invitesRequired={impact.invitesRequired}
            />
          )}
        </div>
      </div>
    </div>
  );
};
