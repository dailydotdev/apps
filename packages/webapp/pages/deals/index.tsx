import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { GetStaticPropsResult } from 'next';
import type { NextSeoProps } from 'next-seo';
import { DealsDirectoryPage } from '@dailydotdev/shared/src/features/deals/components/DealsDirectoryPage';
import { DealDetailModal } from '@dailydotdev/shared/src/features/deals/components/DealDetailModal';
import { DealShareBar } from '@dailydotdev/shared/src/features/deals/components/DealShareBar';
import {
  mockDeals,
  MOCK_NOW_MS,
} from '@dailydotdev/shared/src/features/deals/mockDeals';
import { isLiveDeal } from '@dailydotdev/shared/src/features/deals/dealsFormat';
import { useDealsMockState } from '@dailydotdev/shared/src/features/deals/useDealsMockState';
import type { Deal } from '@dailydotdev/shared/src/features/deals/types';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  DEALS_DIRECTORY_PATH,
  DealsSEOSchema,
  getDealsCollectionJsonLd,
} from '../../components/DealsSEOSchema';
import {
  DEALS_DIRECTORY_DESCRIPTION,
  DEALS_DIRECTORY_TITLE,
  getDealsDirectorySeo,
} from '../../lib/dealsSeo';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';

interface DealsPageProps {
  deals: Deal[];
  jsonLd: string;
}

const DealsPage = ({ deals, jsonLd }: DealsPageProps): ReactElement => {
  const [selectedDeal, setSelectedDeal] = useState<Deal>();
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const dealsState = useDealsMockState({ now: MOCK_NOW_MS });

  const onClaimed = (deal: Deal): void =>
    displayToast(`${deal.brand.name} is saved to My coupons`);

  const onClaimFromModal = (deal: Deal): void => {
    const claim = dealsState.claimDeal(deal);

    if (claim) {
      onClaimed(deal);
    }
  };

  return (
    <div className="flex w-full flex-col">
      <DealsSEOSchema jsonLd={jsonLd} />
      <DealsDirectoryPage
        deals={deals}
        state={dealsState}
        now={MOCK_NOW_MS}
        onDealClick={setSelectedDeal}
        onClaim={onClaimed}
      />

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          now={MOCK_NOW_MS}
          isClaimedByMe={dealsState.claimedDealIds.has(selectedDeal.id)}
          isUpvoted={dealsState.upvotedIds.has(selectedDeal.id)}
          onClose={() => setSelectedDeal(undefined)}
          onClaim={onClaimFromModal}
          onUpvote={dealsState.toggleUpvote}
          onOpenDeal={setSelectedDeal}
          onCodeFeedback={(worked) =>
            dealsState.markCodeFeedback(selectedDeal.id, worked)
          }
          shareBar={
            <DealShareBar
              deal={selectedDeal}
              username={user?.username ?? undefined}
            />
          }
        />
      )}
    </div>
  );
};

export async function getStaticProps(): Promise<
  GetStaticPropsResult<DealsPageProps & { seo: NextSeoProps }>
> {
  const deals = mockDeals.filter(isLiveDeal);

  return {
    props: {
      deals,
      jsonLd: getDealsCollectionJsonLd({
        deals,
        path: DEALS_DIRECTORY_PATH,
        name: DEALS_DIRECTORY_TITLE,
        description: DEALS_DIRECTORY_DESCRIPTION,
        crumbs: [{ name: 'Deals' }],
      }),
      seo: getDealsDirectorySeo(),
    },
    revalidate: 300,
  };
}

const getDealsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

DealsPage.getLayout = getDealsLayout;
DealsPage.layoutProps = { screenCentered: false };

export default DealsPage;
