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
import {
  mockDeals,
  MOCK_NOW_MS,
} from '@dailydotdev/shared/src/features/deals/mockDeals';
import {
  findDealBrandBySlug,
  getDealBrandPath,
  isLiveDeal,
} from '@dailydotdev/shared/src/features/deals/dealsFormat';
import { useDealsMockState } from '@dailydotdev/shared/src/features/deals/useDealsMockState';
import type {
  Deal,
  DealBrand,
} from '@dailydotdev/shared/src/features/deals/types';
import {
  DealsSEOSchema,
  getDealBrandCrumbs,
  getDealsCollectionJsonLd,
} from '../../../components/DealsSEOSchema';
import {
  getDealBrandHeading,
  getDealBrandIntro,
  getDealBrandSeo,
} from '../../../lib/dealsSeo';
import { getLayout } from '../../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../../components/layouts/FooterNavBarLayout';

interface DealBrandPageProps {
  brand: DealBrand;
  deals: Deal[];
  filterDeals: Deal[];
  jsonLd: string;
}

interface DealBrandPageParams extends ParsedUrlQuery {
  brand: string;
}

const DealBrandPage = ({
  brand,
  deals,
  filterDeals,
  jsonLd,
}: DealBrandPageProps): ReactElement => {
  const [selectedDeal, setSelectedDeal] = useState<Deal>();
  const dealsState = useDealsMockState({ now: MOCK_NOW_MS });

  return (
    <div className="flex w-full flex-col">
      <DealsSEOSchema jsonLd={jsonLd} />
      <DealsDirectoryPage
        deals={deals}
        filterDeals={filterDeals}
        activeTab=""
        crumbs={getDealBrandCrumbs(brand.name)}
        heading={getDealBrandHeading(brand)}
        intro={getDealBrandIntro(brand, deals)}
        resultsTitle={`${brand.name} deals`}
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
}: GetStaticPropsContext<DealBrandPageParams>): Promise<
  GetStaticPropsResult<DealBrandPageProps & { seo: NextSeoProps }>
> {
  const slug = params?.brand;

  if (!slug) {
    return { notFound: true, revalidate: false };
  }

  const liveDeals = mockDeals.filter(isLiveDeal);
  const brand = findDealBrandBySlug(slug, liveDeals);

  if (!brand) {
    return { notFound: true, revalidate: 60 };
  }

  const deals = liveDeals.filter((deal) => deal.brand.id === brand.id);

  return {
    props: {
      brand,
      deals,
      filterDeals: liveDeals,
      jsonLd: getDealsCollectionJsonLd({
        deals,
        path: getDealBrandPath(brand),
        name: getDealBrandHeading(brand),
        description: getDealBrandIntro(brand, deals),
        crumbs: getDealBrandCrumbs(brand.name),
      }),
      seo: getDealBrandSeo(brand, deals),
    },
    revalidate: 300,
  };
}

const getDealBrandPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

DealBrandPage.getLayout = getDealBrandPageLayout;
DealBrandPage.layoutProps = { screenCentered: false };

export default DealBrandPage;
