import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks';
import type { NextSeoProps } from 'next-seo';

import { useRouter } from 'next/router';
import { managePlusUrl, plusUrl } from '@dailydotdev/shared/src/lib/constants';
import { SubscriptionProvider } from '@dailydotdev/shared/src/lib/plus';

import { PlusUser } from '@dailydotdev/shared/src/components/PlusUser';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { isIOSNative } from '@dailydotdev/shared/src/lib/func';
import {
  postWebKitMessage,
  WebKitMessageHandlers,
} from '@dailydotdev/shared/src/lib/ios';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
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
  const { openModal } = useLazyModal();
  const { isPlus, plusProvider, logSubscriptionEvent } = usePlusSubscription();

  useEffect(() => {
    if (!isPlus) {
      router.push(plusUrl);
    }
  }, [isPlus, router]);

  if (!router.isReady) {
    return null;
  }

  return (
    <AccountPageContainer title="Payment & Subscription">
      <div className="flex flex-col gap-6">
        <PlusUser
          iconSize={IconSize.XSmall}
          typographyType={TypographyType.Callout}
        />

        <div className="flex flex-col gap-1">
          <Typography bold type={TypographyType.Body}>
            You&apos;re already a Plus member!
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Thanks for supporting daily.dev and unlocking our most powerful
            experience.
          </Typography>

          {!isIOSNative() &&
            plusProvider === SubscriptionProvider.AppleStoreKit && (
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
                className="mt-2"
              >
                Your plus subscription is managed via App Store, to manage it
                please visit the App Store
              </Typography>
            )}
        </div>

        <div className="flex gap-3">
          <Button
            tag="a"
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
            href={managePlusUrl}
            target="_blank"
            disabled={
              !isIOSNative() &&
              plusProvider === SubscriptionProvider.AppleStoreKit
            }
            onClick={() => {
              if (
                isIOSNative() &&
                plusProvider === SubscriptionProvider.AppleStoreKit
              ) {
                postWebKitMessage(
                  WebKitMessageHandlers.IAPSubscriptionManage,
                  null,
                );
              }

              logSubscriptionEvent({
                event_name: LogEvent.ManageSubscription,
              });
            }}
          >
            Manage subscription
          </Button>
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
            onClick={() => {
              logSubscriptionEvent({
                event_name: LogEvent.GiftSubscription,
              });
              openModal({
                type: LazyModal.GiftPlus,
              });
            }}
          >
            Gift plus
          </Button>
        </div>
      </div>
    </AccountPageContainer>
  );
};

AccountManageSubscriptionPage.getLayout = getAccountLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
