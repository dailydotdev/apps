import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { CoreFAQ } from '@dailydotdev/shared/src/components/cores/CoreFAQ';
import {
  BuyCoresCheckout,
  TransactionStatusListener,
} from '@dailydotdev/shared/src/components/modals/award/BuyCoresModal';
import { BuyCoresContextProvider } from '@dailydotdev/shared/src/contexts/BuyCoresContext/BuyCoresContext';
import { useBuyCoresContext } from '@dailydotdev/shared/src/contexts/BuyCoresContext/types';
import { useViewSizeClient, ViewSize } from '@dailydotdev/shared/src/hooks';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import ProductionCoresPage, {
  PageCoreOptions,
} from '../../../../../webapp/pages/cores/index';
import CoresLayout from '../../../../../webapp/components/layouts/CoresLayout';
import { useRoute } from '../../real/providers';
import { friendshipArt } from './frame';

// /cores as production lays it out, in its own layout (the top header with
// the back button, no sidebar), with the character art in place of the hands
// video beside the packs. Below laptop production shows no video, so the page
// renders as is.

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
              className="h-[36.375rem] max-h-full w-full flex-1 object-cover"
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
        <ProductionCoresPage />
      )}
    </CoresLayout>
  );
};
