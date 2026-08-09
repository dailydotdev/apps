import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { NextSeoProps } from 'next-seo';
import { DealsDirectoryPage } from '@dailydotdev/shared/src/features/deals/components/DealsDirectoryPage';
import { DealDetailModal } from '@dailydotdev/shared/src/features/deals/components/DealDetailModal';
import { DealBreadcrumbs } from '@dailydotdev/shared/src/features/deals/components/DealBreadcrumbs';
import {
  mockDeals,
  MOCK_NOW_MS,
} from '@dailydotdev/shared/src/features/deals/mockDeals';
import {
  findDealCategoryBySlug,
  getDealCategoryPath,
  isLiveDeal,
} from '@dailydotdev/shared/src/features/deals/dealsFormat';
import { useDealsMockState } from '@dailydotdev/shared/src/features/deals/useDealsMockState';
import type { Deal } from '@dailydotdev/shared/src/features/deals/types';
import {
  DealsSEOSchema,
  getDealCategoryCrumbs,
  getDealsCollectionJsonLd,
} from '../../../components/DealsSEOSchema';
import {
  getDealCategoryHeading,
  getDealCategoryIntro,
  getDealCategorySeo,
} from '../../../lib/dealsSeo';
import { getLayout } from '../../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../../components/layouts/FooterNavBarLayout';

interface DealCategoryPageProps {
  category: string;
  deals: Deal[];
  filterDeals: Deal[];
  jsonLd: string;
}

interface DealCategoryPageParams extends ParsedUrlQuery {
  category: string;
}

const DealCategoryPage = ({
  category,
  deals,
  filterDeals,
  jsonLd,
}: DealCategoryPageProps): ReactElement => {
  const [selectedDeal, setSelectedDeal] = useState<Deal>();
  const dealsState = useDealsMockState({ now: MOCK_NOW_MS });

  return (
    <div className="flex w-full flex-col">
      <DealsSEOSchema jsonLd={jsonLd} />
      <div className="mx-auto w-full max-w-6xl px-4 pt-4 tablet:px-8 laptop:px-12">
        <DealBreadcrumbs crumbs={getDealCategoryCrumbs(category)} />
      </div>
      <DealsDirectoryPage
        deals={deals}
        filterDeals={filterDeals}
        heading={getDealCategoryHeading(category)}
        intro={getDealCategoryIntro(category, deals)}
        resultsTitle={`${category} deals`}
        initialFilter={category}
        withForYouRail={false}
        state={dealsState}
        now={MOCK_NOW_MS}
        onDealClick={setSelectedDeal}
      />

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          now={MOCK_NOW_MS}
          isClaimedByMe={dealsState.claimedDealIds.has(selectedDeal.id)}
          onClose={() => setSelectedDeal(undefined)}
          onClaim={dealsState.claimDeal}
          onOpenDeal={setSelectedDeal}
        />
      )}
    </div>
  );
};

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<DealCategoryPageParams>): Promise<
  GetStaticPropsResult<DealCategoryPageProps & { seo: NextSeoProps }>
> {
  const slug = params?.category;

  if (!slug) {
    return { notFound: true, revalidate: false };
  }

  const liveDeals = mockDeals.filter(isLiveDeal);
  const category = findDealCategoryBySlug(slug, liveDeals);

  if (!category) {
    return { notFound: true, revalidate: 60 };
  }

  const deals = liveDeals.filter((deal) => deal.categories.includes(category));

  return {
    props: {
      category,
      deals,
      filterDeals: liveDeals,
      jsonLd: getDealsCollectionJsonLd({
        deals,
        path: getDealCategoryPath(category),
        name: getDealCategoryHeading(category),
        description: getDealCategoryIntro(category, deals),
        crumbs: getDealCategoryCrumbs(category),
      }),
      seo: getDealCategorySeo(category, deals),
    },
    revalidate: 300,
  };
}

const getDealCategoryPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

DealCategoryPage.getLayout = getDealCategoryPageLayout;
DealCategoryPage.layoutProps = { screenCentered: false };

export default DealCategoryPage;
