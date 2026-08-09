import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { GetStaticPropsResult } from 'next';
import type { NextSeoProps } from 'next-seo';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { DealsDirectoryPage } from '@dailydotdev/shared/src/features/deals/components/DealsDirectoryPage';
import { DealDetailModal } from '@dailydotdev/shared/src/features/deals/components/DealDetailModal';
import { DealShareBar } from '@dailydotdev/shared/src/features/deals/components/DealShareBar';
import { MyCouponsWallet } from '@dailydotdev/shared/src/features/deals/components/MyCouponsWallet';
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

type DealsTab = 'directory' | 'wallet';

const tabs: { id: DealsTab; label: string }[] = [
  { id: 'directory', label: 'Directory' },
  { id: 'wallet', label: 'My coupons' },
];

const DealsPage = ({ deals, jsonLd }: DealsPageProps): ReactElement => {
  const [activeTab, setActiveTab] = useState<DealsTab>('directory');
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
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-4 pt-4 tablet:px-8 laptop:px-12">
        {tabs.map(({ id, label }) => (
          <Button
            key={id}
            type="button"
            size={ButtonSize.Small}
            variant={
              activeTab === id ? ButtonVariant.Secondary : ButtonVariant.Float
            }
            pressed={activeTab === id}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      {activeTab === 'directory' ? (
        <DealsDirectoryPage
          deals={deals}
          state={dealsState}
          now={MOCK_NOW_MS}
          onDealClick={setSelectedDeal}
          onClaim={onClaimed}
        />
      ) : (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 tablet:px-8 laptop:px-12">
          <div className="flex flex-col gap-1">
            <Typography
              tag={TypographyTag.H1}
              type={TypographyType.Title2}
              bold
            >
              My coupons
            </Typography>
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Every code, credit and free month you claimed, in one place.
            </Typography>
          </div>
          <MyCouponsWallet
            claims={dealsState.claims}
            deals={mockDeals}
            now={MOCK_NOW_MS}
            onBrowse={() => setActiveTab('directory')}
          />
        </div>
      )}

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
