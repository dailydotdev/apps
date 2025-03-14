import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { BuyCoresContextProvider } from '@dailydotdev/shared/src/contexts/BuyCoresContext';
import { useRouter } from 'next/router';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { CoreAmountNeeded } from '@dailydotdev/shared/src/components/cores/CoreAmountNeeded';
import { CoreOptionList } from '@dailydotdev/shared/src/components/cores/CoreOptionList';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CoinIcon } from '@dailydotdev/shared/src/components/icons';
import { CoreFAQ } from '@dailydotdev/shared/src/components/cores/CoreFAQ';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { getTemplatedTitle } from '../../components/layouts/utils';
import { defaultOpenGraph } from '../../next-seo';
import { getCoresLayout } from '../../components/layouts/CoresLayout';

const seo: NextSeoProps = {
  title: getTemplatedTitle('TODO: Buy cores title'),
  openGraph: { ...defaultOpenGraph },
  description: 'TODO: Buy cores description',
};

const CorePageMobile = (): ReactElement => {
  return <p>Something mobile</p>;
};

const CorePageDesktop = (): ReactElement => {
  return (
    <>
      <div className="flex flex-1 flex-col justify-center gap-20 pt-10">
        <div className="mx-4 flex max-w-[63.75rem] flex-1 gap-20">
          <div className="flex flex-1 flex-col gap-4">
            <Typography type={TypographyType.LargeTitle} bold>
              Get More Cores
            </Typography>
            <CoreAmountNeeded />
            <div className="mt-2 flex items-center justify-between">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Choose how many Cores to buy
              </Typography>
              <Button
                size={ButtonSize.Small}
                variant={ButtonVariant.Float}
                icon={<CoinIcon />}
              >
                350
              </Button>
            </div>
            <CoreOptionList />
          </div>
          <div className="flex-1">
            <div className="checkout-container" />
          </div>
        </div>
        <CoreFAQ />
      </div>
    </>
  );
};

const CoresPage = (): ReactElement => {
  const { isReady } = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);

  if (!isReady) {
    return null;
  }

  return (
    // TODO: Take correct origin from referrer
    <BuyCoresContextProvider origin={Origin.EarningsPageCTA}>
      {isLaptop ? <CorePageDesktop /> : <CorePageMobile />}
    </BuyCoresContextProvider>
  );
};

CoresPage.getLayout = getCoresLayout;
CoresPage.layoutProps = { seo };

export default CoresPage;
