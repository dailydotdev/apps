import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import {
  PlusList,
  plusFeatureList,
  plusOrganizationFeatureList,
} from './PlusList';
import { usePaymentContext } from '../../contexts/payment/context';
import type { OpenCheckoutFn } from '../../contexts/payment/context';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { usePlusSubscription } from '../../hooks';
import { LogEvent, TargetId } from '../../lib/log';
import { useGiftUserContext } from './GiftUserContext';
import { PlusOptionRadio } from './PlusOptionRadio';
import { GiftingSelectedUser } from './GiftingSelectedUser';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { GiftIcon } from '../icons';
import type { CommonPlusPageProps } from './common';
import Logo from '../Logo';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { PlusTrustReviews } from './PlusTrustReviews';
import { PlusSupportedAgents } from './PlusSupportedAgents';
import type { ProductPricingPreview } from '../../graphql/paddle';
import { PlusPlanType } from '../../graphql/paddle';
import { isIOSNative } from '../../lib/func';
import { PlusPriceType } from '../../lib/featureValues';
import { PlusAdjustQuantity } from './PlusAdjustQuantity';

type PlusInfoProps = {
  productOptions: ProductPricingPreview[];
  selectedOption: string | null;
  onChange: OpenCheckoutFn;
  onContinue?: () => void;
  showDailyDevLogo?: boolean;
  showPlusList?: boolean;
  showTrustReviews?: boolean;
  showGiftButton?: boolean;
  title?: string;
  description?: string;
  subtitle?: string;
  continueEnabled?: boolean;
  isContinueLoading?: boolean;
};

export enum PlusType {
  Self = 'self',
  Gift = 'gift',
  Organization = 'organization',
}

interface PageCopy {
  title: string;
  description: string;
  subtitle: string;
}

const plusFeaturePillars = [
  {
    title: 'For your agents',
    featureIds: [
      'ai-agent-integration',
      'public-api',
      'presidential-briefing',
      'smart prompts',
    ],
  },
  {
    title: 'For your feed',
    featureIds: [
      'custom feeds',
      'clean titles',
      'keyword filter',
      'auto-translate',
    ],
  },
  {
    title: 'For your experience',
    featureIds: ['ad-free', 'bookmark folders', 'member squad', 'support team'],
  },
] as const;

const getPlusFeaturesByIds = (featureIds: string[]) => {
  const featureMap = new Map(
    plusFeatureList.map((feature) => [feature.id, feature]),
  );

  return featureIds.map((featureId) => {
    const feature = featureMap.get(featureId);
    if (!feature) {
      throw new Error(`Missing Plus feature for id "${featureId}"`);
    }

    return feature;
  });
};

export const defaultPlusInfoCopy: Record<PlusType, PageCopy> = {
  [PlusType.Self]: {
    title: 'Keep your agents up to date',
    description:
      'Free keeps you up to date. Plus helps your agents and LLMs stay current too with public API access, daily.dev skills, and AI tools built for high-signal developer workflows.',
    subtitle: 'Billing cycle',
  },
  [PlusType.Organization]: {
    title: 'Give your team and their agents an unfair advantage',
    description:
      'Equip every engineer with agent-ready dev intelligence, API access, and AI workflows that scale across your organization. All the benefits of daily.dev Plus, now built for teams.',
    subtitle: 'Billing cycle',
  },
  [PlusType.Gift]: {
    title: 'Gift daily.dev Plus',
    description:
      'Give someone the edge: API access for agents and LLMs, plus AI-powered tools and premium features to help them stay sharper every day.',
    subtitle: "Who's it for?",
  },
};

const skeletonItems = Array.from({ length: 3 }, (_, i) => i);
const RadioGroupSkeleton = () => (
  <div>
    {skeletonItems.map((index) => (
      <div
        key={index}
        className={classNames(
          'flex min-h-12 items-center justify-between gap-2 rounded-10 !p-2',
          index === 0 &&
            '-m-px border border-border-subtlest-primary bg-surface-float',
        )}
      >
        <ElementPlaceholder className="h-4 w-2/3" />
        <ElementPlaceholder className="h-4 w-1/5" />
      </div>
    ))}
  </div>
);

const getPlusType = ({
  isGift,
  isOrganization,
}: {
  isGift?: boolean;
  isOrganization?: boolean;
}): PlusType => {
  if (isOrganization) {
    return PlusType.Organization;
  }
  if (isGift) {
    return PlusType.Gift;
  }
  return PlusType.Self;
};

const getCopy = (plusType: PlusType, { title, description, subtitle }) => {
  const fallback = defaultPlusInfoCopy[plusType];

  return {
    titleCopy: title || fallback.title,
    descriptionCopy: description || fallback.description,
    subtitleCopy: subtitle || fallback.subtitle,
  };
};

export const PlusInfo = ({
  productOptions,
  selectedOption,
  onChange,
  onContinue,
  shouldShowPlusHeader = true,
  showPlusList = true,
  showDailyDevLogo = false,
  showGiftButton = true,
  showTrustReviews = true,
  title,
  description,
  subtitle,
  continueEnabled = true,
  isContinueLoading = false,
}: PlusInfoProps & CommonPlusPageProps): ReactElement => {
  const router = useRouter();
  const { giftOneYear, isOrganization, checkoutItemsLoading } =
    usePaymentContext();
  const { openModal } = useLazyModal();
  const { logSubscriptionEvent } = usePlusSubscription();
  const { giftToUser } = useGiftUserContext();

  const [itemQuantity, setItemQuantity] = useState<number>(1);

  const plusType = getPlusType({
    isGift: !!giftToUser,
    isOrganization,
  });

  const { titleCopy, descriptionCopy, subtitleCopy } = getCopy(plusType, {
    title,
    description,
    subtitle,
  });

  const isOnboarding = router.pathname.startsWith('/onboarding');
  const showBuyAsAGiftButton =
    !giftToUser && showGiftButton && !!giftOneYear && !isOnboarding;

  return (
    <>
      {shouldShowPlusHeader && (
        <div className="mb-6 flex items-center">
          {showDailyDevLogo && <Logo logoClassName={{ container: 'h-5' }} />}
        </div>
      )}
      <Typography
        tag={TypographyTag.H1}
        color={TypographyColor.Primary}
        type={TypographyType.LargeTitle}
        className="mb-2"
        bold
      >
        {titleCopy}
      </Typography>
      <Typography
        tag={TypographyTag.H2}
        color={TypographyColor.Secondary}
        type={TypographyType.Body}
        className="mb-6"
      >
        {descriptionCopy}
      </Typography>

      {isOrganization && (
        <PlusAdjustQuantity
          label="Team size"
          className="mb-4"
          itemQuantity={itemQuantity}
          selectedOption={selectedOption}
          checkoutItemsLoading={checkoutItemsLoading ?? false}
          setItemQuantity={setItemQuantity}
          onChange={onChange}
        />
      )}

      <div className="mb-4 flex h-6 flex-row items-center justify-between">
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          bold
        >
          {subtitleCopy}
        </Typography>

        {showBuyAsAGiftButton && (
          <Button
            icon={<GiftIcon />}
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Float}
            onClick={() => {
              logSubscriptionEvent({
                event_name: LogEvent.GiftSubscription,
                target_id: TargetId.PlusPage,
              });
              openModal({
                type: LazyModal.GiftPlus,
                props: {
                  onSelected: (user) => {
                    onChange({
                      priceId: giftOneYear.priceId,
                      giftToUserId: user.id,
                    });
                  },
                },
              });
            }}
          >
            Buy as a gift
          </Button>
        )}
      </div>
      {!!giftToUser && (
        <GiftingSelectedUser
          user={giftToUser}
          className="mb-6"
          onClose={() => {
            router.push('/plus');
            onChange({ priceId: productOptions[0].priceId });
          }}
        />
      )}
      <div
        className={classNames(
          'rounded-10 border border-border-subtlest-tertiary',
          giftToUser ? 'min-h-[3rem]' : 'min-h-[6.125rem]',
        )}
      >
        {giftToUser ? (
          <PlusOptionRadio
            key={giftOneYear?.priceId}
            option={giftOneYear}
            checked
          />
        ) : (
          <>
            {!productOptions && <RadioGroupSkeleton />}
            {productOptions?.map((option) => (
              <PlusOptionRadio
                key={option.priceId}
                shouldShowMonthlyPrice={
                  !isIOSNative() ||
                  (isIOSNative() && option.duration === PlusPriceType.Monthly)
                }
                shouldShowDuration
                isOrganization={isOrganization}
                option={option}
                checked={selectedOption === option.priceId}
                onChange={() => {
                  onChange({ priceId: option.priceId, quantity: itemQuantity });
                  logSubscriptionEvent({
                    event_name: LogEvent.SelectBillingCycle,
                    target_id: option.metadata.title.toLowerCase(),
                    extra: {
                      plan_type: isOrganization
                        ? PlusPlanType.Organization
                        : PlusPlanType.Personal,
                      team_size: isOrganization ? itemQuantity : undefined,
                    },
                  });
                }}
              />
            ))}
          </>
        )}
      </div>
      {onContinue ? (
        <div className="pt-6">
          <Button
            size={ButtonSize.Medium}
            variant={ButtonVariant.Primary}
            className="w-full"
            onClick={onContinue}
            disabled={!continueEnabled}
            loading={isContinueLoading}
          >
            Continue »
          </Button>
        </div>
      ) : undefined}
      {showPlusList &&
        (isOrganization ? (
          <PlusList items={plusOrganizationFeatureList} />
        ) : (
          <div className="flex flex-col gap-4 py-6">
            {plusFeaturePillars.map((pillar) => (
              <section key={pillar.title}>
                <Typography
                  tag={TypographyTag.H3}
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  className="mb-1 uppercase"
                  bold
                >
                  {pillar.title}
                </Typography>
                <PlusList
                  className="!py-0"
                  items={getPlusFeaturesByIds([...pillar.featureIds])}
                />
              </section>
            ))}
          </div>
        ))}
      {showTrustReviews && (
        <div className="flex flex-col gap-4">
          <PlusTrustReviews />
          <PlusSupportedAgents />
        </div>
      )}
    </>
  );
};
