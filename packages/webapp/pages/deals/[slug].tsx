import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { NextSeoProps } from 'next-seo';
import { DealShareLanding } from '@dailydotdev/shared/src/features/deals/components/DealShareLanding';
import { DealBreadcrumbs } from '@dailydotdev/shared/src/features/deals/components/DealBreadcrumbs';
import { DealShareBar } from '@dailydotdev/shared/src/features/deals/components/DealShareBar';
import {
  getDealBySlug,
  mockDeals,
  MOCK_NOW_MS,
} from '@dailydotdev/shared/src/features/deals/mockDeals';
import { getDealComments } from '@dailydotdev/shared/src/features/deals/mockCommunity';
import type { DealComment } from '@dailydotdev/shared/src/features/deals/mockCommunity';
import {
  DealPageStatus,
  getDealPageStatus,
  getSimilarDeals,
  sanitizeSharerName,
} from '@dailydotdev/shared/src/features/deals/dealsFormat';
import { useDealsMockState } from '@dailydotdev/shared/src/features/deals/useDealsMockState';
import type { Deal } from '@dailydotdev/shared/src/features/deals/types';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { onboardingUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  DealsSEOSchema,
  getDealCrumbs,
  getDealPageJsonLd,
} from '../../components/DealsSEOSchema';
import { getDealSeo } from '../../lib/dealsSeo';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';

const SIMILAR_DEALS_COUNT = 4;

interface DealPageProps {
  deal: Deal;
  comments: DealComment[];
  similarDeals: Deal[];
  status: DealPageStatus;
  jsonLd: string;
}

interface DealPageParams extends ParsedUrlQuery {
  slug: string;
}

const DealPage = ({
  deal,
  comments,
  similarDeals,
  status,
  jsonLd,
}: DealPageProps): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const dealsState = useDealsMockState({ now: MOCK_NOW_MS });
  const sharerName = router.isReady
    ? sanitizeSharerName(router.query.ref)
    : undefined;

  const onClaim = (claimed: Deal): void => {
    if (dealsState.claimDeal(claimed)) {
      displayToast(`${claimed.brand.name} is saved to My coupons`);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 tablet:px-8">
      <DealsSEOSchema jsonLd={jsonLd} />
      <DealBreadcrumbs crumbs={getDealCrumbs(deal)} />
      <DealShareLanding
        deal={deal}
        sharerName={sharerName}
        comments={comments}
        similarDeals={similarDeals}
        hasEnded={status !== DealPageStatus.Live}
        isSignedIn={!!user}
        isClaimedByMe={dealsState.claimedDealIds.has(deal.id)}
        now={MOCK_NOW_MS}
        onClaim={onClaim}
        onCodeFeedback={(worked) =>
          dealsState.markCodeFeedback(deal.id, worked)
        }
        onJoin={() => router.push(onboardingUrl)}
        shareBar={
          <DealShareBar deal={deal} username={user?.username ?? undefined} />
        }
      />
    </main>
  );
};

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<DealPageParams>): Promise<
  GetStaticPropsResult<DealPageProps & { seo: NextSeoProps }>
> {
  const slug = params?.slug;

  if (!slug) {
    return { notFound: true, revalidate: false };
  }

  const deal = getDealBySlug(slug);

  if (!deal) {
    return { notFound: true, revalidate: 60 };
  }

  const status = getDealPageStatus(deal, MOCK_NOW_MS);

  if (status === DealPageStatus.Gone) {
    return { notFound: true, revalidate: 60 };
  }

  return {
    props: {
      deal,
      status,
      comments: getDealComments(deal.id),
      similarDeals: getSimilarDeals(deal, mockDeals, SIMILAR_DEALS_COUNT),
      jsonLd: getDealPageJsonLd(deal),
      seo: getDealSeo(deal, MOCK_NOW_MS),
    },
    revalidate: 300,
  };
}

const getDealPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

DealPage.getLayout = getDealPageLayout;
DealPage.layoutProps = { screenCentered: false };

export default DealPage;
