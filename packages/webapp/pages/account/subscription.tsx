import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks';
import type { NextSeoProps } from 'next-seo';

import { useRouter } from 'next/router';
import { managePlusUrl, plusUrl } from '@dailydotdev/shared/src/lib/constants';
import { SubscriptionProvider } from '@dailydotdev/shared/src/lib/plus';
import { isIOSNative } from '@dailydotdev/shared/src/lib/func';
import {
  sendMessage,
  WebKitMessageHandlers,
} from '@dailydotdev/shared/src/lib/ios';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Manage plus'),
};

const AccountManageSubscriptionPage = (): ReactElement => {
  const router = useRouter();
  const { isPlus, plusProvider } = usePlusSubscription();

  useEffect(() => {
    if (!isPlus) {
      router.push(plusUrl);
      return;
    }

    if (plusProvider === SubscriptionProvider.Paddle) {
      router.push(managePlusUrl);
      return;
    }

    if (isIOSNative() && plusProvider === SubscriptionProvider.AppleStoreKit) {
      sendMessage(WebKitMessageHandlers.IAPSubscriptionManage, null);

      // Send the user back to the previous page as the native handler will take over
      router.back();
    }
  }, [isPlus, plusProvider, router]);

  if (!router.isReady) {
    return null;
  }

  return (
    <AccountPageContainer title="Manage plus">
      <span className="text-text-tertiary typo-callout">
        Your plus subscription is managed via App Store, to manage it please
        visit the App Store
      </span>
    </AccountPageContainer>
  );
};

AccountManageSubscriptionPage.getLayout = getAccountLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
