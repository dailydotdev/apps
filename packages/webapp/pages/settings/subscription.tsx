import React from 'react';
import type { ReactElement } from 'react';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks';
import dynamic from 'next/dynamic';
import type { NextSeoProps } from 'next-seo';

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
import { LogEvent, TargetId } from '@dailydotdev/shared/src/lib/log';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import {
  defaultPlusInfoCopy,
  PlusType,
} from '@dailydotdev/shared/src/components/plus/PlusInfo';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const UpgradeToPlus = dynamic(() =>
  import(
    /* webpackChunkName: "upgradeToPlus" */ '@dailydotdev/shared/src/components/UpgradeToPlus'
  ).then((mod) => mod.UpgradeToPlus),
);

const PlusList = dynamic(() =>
  import(
    /* webpackChunkName: "plusList" */ '@dailydotdev/shared/src/components/plus/PlusList'
  ).then((mod) => mod.PlusList),
);

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Manage plus'),
};

const PlusInfo = (): ReactElement => {
  const { openModal } = useLazyModal();
  const { isPlus, plusProvider, logSubscriptionEvent, plusHref } =
    usePlusSubscription();

  return (
    <>
      <div className="flex flex-col gap-1">
        <Typography bold type={TypographyType.Body}>
          You&apos;re already a Plus member!
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Thank you for supporting daily.dev and unlocking the best experience
          we offer. Manage your subscription to update your plan, payment
          details, or preferences anytime. Know a friend or colleague who might
          love daily.dev? Gift them daily.dev Plus!
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
          href={plusHref}
          target={
            isPlus && plusProvider === SubscriptionProvider.Paddle
              ? '_blank'
              : undefined
          }
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
              target_id: TargetId.Account,
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
              target_id: TargetId.Account,
            });
            openModal({
              type: LazyModal.GiftPlus,
            });
          }}
        >
          Gift Plus
        </Button>
      </div>
    </>
  );
};

const UpgradeToPlusInfo = (): ReactElement => (
  <>
    <div className="flex flex-col gap-1">
      <Typography bold type={TypographyType.Body}>
        {defaultPlusInfoCopy[PlusType.Self].title}
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        {defaultPlusInfoCopy[PlusType.Self].description}
      </Typography>
    </div>
    <UpgradeToPlus
      target={TargetId.Account}
      size={ButtonSize.Large}
      className="flex-initial self-start"
    />
    <PlusList className="!py-0" />
  </>
);

const AccountManageSubscriptionPage = (): ReactElement => {
  const { isPlus } = usePlusSubscription();

  return (
    <AccountPageContainer title="Payment & Subscription">
      <div className="flex flex-col gap-6">
        <PlusUser
          iconSize={IconSize.XSmall}
          typographyType={TypographyType.Callout}
        />

        {isPlus ? <PlusInfo /> : <UpgradeToPlusInfo />}
      </div>
    </AccountPageContainer>
  );
};

AccountManageSubscriptionPage.getLayout = getSettingsLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
