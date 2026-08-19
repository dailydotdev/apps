import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { GetStaticPropsResult } from 'next';
import type { NextSeoProps } from 'next-seo';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { DealsDirectoryHeader } from '@dailydotdev/shared/src/features/deals/components/DealsDirectoryHeader';
import { MyCouponsWallet } from '@dailydotdev/shared/src/features/deals/components/MyCouponsWallet';
import {
  mockDeals,
  MOCK_NOW_MS,
} from '@dailydotdev/shared/src/features/deals/mockDeals';
import {
  DEALS_DIRECTORY_PATH,
  DEALS_TAB_MY_COUPONS,
  isLiveDeal,
} from '@dailydotdev/shared/src/features/deals/dealsFormat';
import { useDealsMockState } from '@dailydotdev/shared/src/features/deals/useDealsMockState';
import type { Deal } from '@dailydotdev/shared/src/features/deals/types';
import { getMyCouponsSeo } from '../../lib/dealsSeo';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';

interface MyCouponsPageProps {
  deals: Deal[];
}

const MyCouponsPage = ({ deals }: MyCouponsPageProps): ReactElement => {
  const router = useRouter();
  const dealsState = useDealsMockState({ now: MOCK_NOW_MS });

  return (
    <div className="flex w-full flex-col">
      <DealsDirectoryHeader deals={deals} activeFilter={DEALS_TAB_MY_COUPONS} />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 tablet:px-8 laptop:px-12">
        <div className="flex flex-col gap-1">
          <Typography tag={TypographyTag.H1} type={TypographyType.Title2} bold>
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
          onBrowse={() => router.push(DEALS_DIRECTORY_PATH)}
        />
      </div>
    </div>
  );
};

export async function getStaticProps(): Promise<
  GetStaticPropsResult<MyCouponsPageProps & { seo: NextSeoProps }>
> {
  return {
    props: {
      deals: mockDeals.filter(isLiveDeal),
      seo: getMyCouponsSeo(),
    },
    revalidate: 300,
  };
}

const getDealsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

MyCouponsPage.getLayout = getDealsLayout;
MyCouponsPage.layoutProps = { screenCentered: false };

export default MyCouponsPage;
