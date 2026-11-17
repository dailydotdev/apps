import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { CoreFAQ } from '@dailydotdev/shared/src/components/cores/CoreFAQ';
import {
  BuyCoresCheckout,
  CoreOptions,
  TransactionStatusListener,
} from '@dailydotdev/shared/src/components/modals/award/BuyCoresModal';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { BuyCoresContextProvider } from '@dailydotdev/shared/src/contexts/BuyCoresContext/BuyCoresContext';
import { useBuyCoresContext } from '@dailydotdev/shared/src/contexts/BuyCoresContext/types';
import { useViewSizeClient, ViewSize } from '@dailydotdev/shared/src/hooks';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import CoresLayout from '../../../../../webapp/components/layouts/CoresLayout';
import { useRoute } from '../../real/providers';
import { friendshipArt } from './frame';
import { Deals } from '../purchase/Deals';

// /cores as production lays it out, in its own layout (the top header with
// the back button, no sidebar), with the character art in place of the hands
// video beside the packs, and the Buy Cores pop-up's Deals over the packs in
// place of production's Startups promo under them.

/** Production's pack list, with the Deals on top */
const PageCoreOptions = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <CoreOptions
    className={classNames('p-6', className)}
    title={
      <div className="mb-4 flex flex-col gap-4">
        <Typography type={TypographyType.LargeTitle} bold>
          Get More Cores
        </Typography>
        <Deals withStartups />
        <h3 className="font-bold typo-callout">Packages</h3>
      </div>
    }
  />
);

const CorePageDesktop = (): ReactElement => {
  const { selectedProduct } = useBuyCoresContext();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-gradient-to-t from-theme-overlay-float-bun to-transparent pt-10">
      <div className="mx-a mx-4 flex w-full max-w-[63.75rem] flex-1 gap-4">
        <PageCoreOptions />
        <BuyCoresCheckout
          className={classNames(
            !selectedProduct && 'hidden',
            'rounded-16 border border-border-subtlest-tertiary p-6',
          )}
        />
        <div
          className={classNames(
            'm-6 flex flex-1 overflow-hidden rounded-16',
            selectedProduct && 'hidden',
          )}
        >
          {!selectedProduct && (
            <img
              src={friendshipArt}
              alt="Friends sharing a Core with Patchy"
              className="h-[36.375rem] max-h-full w-full flex-1 rounded-16 object-cover"
            />
          )}
        </div>
      </div>
      <CoreFAQ />
    </div>
  );
};

export const CoresPage = (): ReactElement => {
  useRoute('/cores');
  const isLaptop = useViewSizeClient(ViewSize.Laptop);

  return (
    <CoresLayout>
      {isLaptop ? (
        <BuyCoresContextProvider origin={Origin.WalletPageCTA}>
          <TransactionStatusListener isOpen isDrawerOnMobile />
          <CorePageDesktop />
        </BuyCoresContextProvider>
      ) : (
        <BuyCoresContextProvider origin={Origin.WalletPageCTA}>
          <PageCoreOptions className="!px-4" />
          <CoreFAQ />
        </BuyCoresContextProvider>
      )}
    </CoresLayout>
  );
};
