import React from 'react';
import type { ReactElement } from 'react';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks';
import dynamic from 'next/dynamic';
import type { NextSeoProps } from 'next-seo';

import { SubscriptionProvider } from '@dailydotdev/shared/src/lib/plus';

import { PlusUser } from '@dailydotdev/shared/src/components/PlusUser';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { GiftIcon } from '@dailydotdev/shared/src/components/icons';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonColor,
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
  defaultPlusInfoCopyControl,
  PlusType,
} from '@dailydotdev/shared/src/components/plus/PlusInfo';
import AccountContentSection from '../../components/layouts/SettingsLayout/AccountContentSection';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

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
  ...getPageSeoTitles('Subscriptions'),
};

const PlusInfo = (): ReactElement => {
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
          {`Thank you for supporting daily.dev and unlocking the best experience
          we offer. Manage your subscription to update your plan, payment
          details, or preferences anytime.`}
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
      </div>
    </>
  );
};

const GiftPlusSection = (): ReactElement => {
  const { openModal } = useLazyModal();
  const { logSubscriptionEvent } = usePlusSubscription();

  return (
    <AccountContentSection
      title="Gift daily.dev Plus"
      description={defaultPlusInfoCopyControl[PlusType.Gift].description}
    >
      <Button
        className="mt-4 max-w-fit border-action-plus-default text-action-plus-default"
        icon={<GiftIcon size={IconSize.Small} secondary />}
        variant={ButtonVariant.Secondary}
        color={ButtonColor.Bacon}
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
        Buy as gift
      </Button>
    </AccountContentSection>
  );
};

const UpgradeToPlusInfo = (): ReactElement => {
  const plusCopy = defaultPlusInfoCopyControl;

  return (
    <>
      <div className="flex flex-col gap-1">
        <Typography bold type={TypographyType.Body}>
          {plusCopy[PlusType.Self].title}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {plusCopy[PlusType.Self].description}
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
};

const AccountManageSubscriptionPage = (): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const { isValidRegion: isPlusAvailable } = useAuthContext();

  return (
    <AccountPageContainer title="Payment & Subscription">
      <div className="flex flex-col gap-6">
        <PlusUser
          iconSize={IconSize.XSmall}
          typographyType={TypographyType.Callout}
        />

        {isPlus ? <PlusInfo /> : <UpgradeToPlusInfo />}
      </div>
      {isPlusAvailable && <GiftPlusSection />}
    </AccountPageContainer>
  );
};

AccountManageSubscriptionPage.getLayout = getSettingsLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
