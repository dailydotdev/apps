import type { ReactElement } from 'react';
import React, { Fragment, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from '../../../components/utilities/Link';
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
import { dealsListAd } from '../mockDealsAds';
import type { Deal } from '../types';
import {
  DEALS_FILTER_ALL,
  findDealsFilterByQuery,
  getDealCategoryPath,
  getDealsDirectoryEvidence,
  getTrendingDealIds,
  isLiveDeal,
  matchesDealFilter,
} from '../dealsFormat';
import type { DealsMockState } from '../useDealsMockState';
import { useDealsMockState } from '../useDealsMockState';
import { DealListCard } from './DealListCard';
import { DealsAdRow } from './DealsAdRow';
import { DealImpactWidget } from './DealImpactWidget';
import { DealsDirectoryHeader } from './DealsDirectoryHeader';
import { DealsHero } from './DealsHero';
import { DealsRail } from './DealsRail';

interface DealsDirectoryPageProps {
  deals: Deal[];
  /** The whole catalogue, so a faceted page can still link to every other
   * category while rendering only its own deals, and so a trending rank means
   * the same thing on a thin facet as it does on the directory. */
  filterDeals?: Deal[];
  isLoggedOut?: boolean;
  initialQuery?: string;
  initialFilter?: string;
  heading?: string;
  intro?: string;
  resultsTitle?: string;
  withForYouRail?: boolean;
  onDealClick?: (deal: Deal) => void;
  onClaim?: (deal: Deal) => void;
  state?: DealsMockState;
  now?: number;
}

const MY_TAG_CATEGORIES = ['AI tools', 'Dev tools', 'Cloud'];

const SHORTCUT_CATEGORIES = ['AI tools', 'Cloud', 'Hardware', 'Courses'];

const FOR_YOU_RAIL_SIZE = 8;

/**
 * Two cards under a heading read as a bug rather than a recommendation, so a
 * set too thin to fill the rail drops it and leaves the list to do the work.
 */
const MIN_FOR_YOU_RAIL_DEALS = 3;

/**
 * The single paid slot in the directory, and the only one on the page. It sits
 * far enough down that a reader has already scanned six real offers, and a
 * shorter result set simply never reaches it.
 */
const DEALS_LIST_AD_INDEX = 6;

const matchesQuery = (deal: Deal, query: string): boolean => {
  const haystack = [deal.title, deal.brand.name, ...deal.categories]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
};

const JoinStrip = (): ReactElement => (
  <aside className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle px-4 py-3 laptop:flex-row laptop:items-center laptop:gap-6">
    <Typography tag={TypographyTag.H2} type={TypographyType.Footnote} bold>
      Join daily.dev to claim deals
    </Typography>
    <Typography
      tag={TypographyTag.P}
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      className="min-w-0 flex-1"
    >
      Browsing is open to everyone. An account keeps your codes in one place and
      unlocks the members only drops.
    </Typography>
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      className="shrink-0"
    >
      Join daily.dev
    </Button>
  </aside>
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
  withForYouRail = true,
  onDealClick,
  onClaim,
  state,
  now = MOCK_NOW_MS,
}: DealsDirectoryPageProps): ReactElement => {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState(initialFilter);
  const [claimMessage, setClaimMessage] = useState('');
  const ownState = useDealsMockState({ now });
  const dealsState = state ?? ownState;
  const { claimedDealIds, impact } = dealsState;

  const trimmedQuery = query.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;
  // A deep link into a cross-cutting filter has to beat the tab click that has
  // not landed yet, so the URL wins whenever it names one.
  const activeFilter = findDealsFilterByQuery(router?.query?.filter) ?? filter;

  const evidence = useMemo(
    () => getDealsDirectoryEvidence(deals.filter(isLiveDeal)),
    [deals],
  );

  const filteredDeals = useMemo(
    () => deals.filter((deal) => matchesDealFilter(deal, activeFilter)),
    [deals, activeFilter],
  );

  const results = useMemo(
    () =>
      isSearching
        ? filteredDeals.filter((deal) => matchesQuery(deal, trimmedQuery))
        : filteredDeals,
    [filteredDeals, isSearching, trimmedQuery],
  );

  // Ranked over the whole catalogue, never the visible slice. Six of three
  // offers would make trending mean nothing on a thin category page.
  const trendingDealIds = useMemo(
    () => getTrendingDealIds(filterDeals ?? deals),
    [filterDeals, deals],
  );

  const forYouDeals = useMemo(
    () =>
      filteredDeals
        .filter(
          (deal) =>
            isLiveDeal(deal) &&
            deal.categories.some((category) =>
              MY_TAG_CATEGORIES.includes(category),
            ),
        )
        .slice(0, FOR_YOU_RAIL_SIZE),
    [filteredDeals],
  );

  const hasForYouRail =
    withForYouRail &&
    !isSearching &&
    forYouDeals.length >= MIN_FOR_YOU_RAIL_DEALS;

  const onClaimDeal = (deal: Deal): void => {
    const claim = dealsState.claimDeal(deal);

    if (!claim) {
      setClaimMessage(`${deal.title} is already in My coupons.`);

      return;
    }

    setClaimMessage(`${deal.title} is saved to My coupons.`);
    onClaim?.(deal);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 tablet:px-8 laptop:px-12">
      <DealsHero heading={heading} intro={intro} evidence={evidence} />
      <DealsDirectoryHeader
        deals={filterDeals ?? deals}
        activeFilter={activeFilter}
        onFilterChange={setFilter}
        query={query}
        onQueryChange={setQuery}
      />

      <div className="mt-6 flex flex-col gap-10 pb-16">
        {hasForYouRail && (
          <DealsRail
            title="For you"
            label="Based on your tags"
            deals={forYouDeals}
            onDealClick={onDealClick}
            onClaim={onClaimDeal}
            claimedDealIds={claimedDealIds}
            trendingDealIds={trendingDealIds}
            now={now}
          />
        )}

        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
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
            <ul className="animate-deals-results-in flex flex-col">
              {results.map((deal, index) => (
                <Fragment key={deal.id}>
                  {index === DEALS_LIST_AD_INDEX && (
                    <DealsAdRow ad={dealsListAd} />
                  )}
                  <DealListCard
                    deal={deal}
                    onClaim={onClaimDeal}
                    onOpenDetail={onDealClick}
                    isClaimedByMe={claimedDealIds.has(deal.id)}
                    isTrending={trendingDealIds.has(deal.id)}
                    now={now}
                  />
                </Fragment>
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
                  <Link
                    key={category}
                    href={getDealCategoryPath(category)}
                    passHref
                  >
                    <Button
                      tag="a"
                      size={ButtonSize.Small}
                      variant={ButtonVariant.Float}
                    >
                      {category}
                    </Button>
                  </Link>
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

        {isLoggedOut ? (
          <JoinStrip />
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
  );
};
