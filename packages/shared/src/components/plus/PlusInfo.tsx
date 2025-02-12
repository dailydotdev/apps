import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { PlusUser } from '../PlusUser';
import { IconSize } from '../Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { PlusList } from './PlusList';
import { usePaymentContext } from '../../contexts/PaymentContext';
import type {
  OpenCheckoutFn,
  ProductOption,
} from '../../contexts/PaymentContext';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../../lib/log';
import { useGiftUserContext } from './GiftUserContext';
import { PlusOptionRadio } from './PlusOptionRadio';
import { GiftingSelectedUser } from './GiftingSelectedUser';
import ConditionalWrapper from '../ConditionalWrapper';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { GiftIcon } from '../icons/gift';
import type { CommonPlusPageProps } from './common';
import Logo from '../Logo';
import { ElementPlaceholder } from '../ElementPlaceholder';

type PlusInfoProps = {
  productOptions: ProductOption[];
  selectedOption: string | null;
  onChange: OpenCheckoutFn;
  onContinue?: () => void;
  showDailyDevLogo?: boolean;
  showPlusList?: boolean;
  showGiftButton?: boolean;
  title?: string;
  description?: string;
  subtitle?: string;
};

enum PlusType {
  Self = 'self',
  Gift = 'gift',
}

interface PageCopy {
  title: string;
  description: string;
  subtitle: string;
}

const copy: Record<PlusType, PageCopy> = {
  [PlusType.Self]: {
    title: 'Fast-track your growth',
    description:
      'Work smarter, learn faster, and stay ahead with AI tools, custom feeds, and pro features. Because copy-pasting code isn’t a long-term strategy.',
    subtitle: 'Billing cycle',
  },
  [PlusType.Gift]: {
    title: 'Gift daily.dev Plus 🎁',
    description:
      'Gifting daily.dev Plus to a friend is the ultimate way to say, ‘I’ve got your back.’ It unlocks an ad-free experience, advanced content filtering and customizations, plus AI superpowers to supercharge their daily.dev journey.',
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
const getCopy = ({ giftToUser, title, description, subtitle }) => {
  return {
    titleCopy:
      title ||
      (giftToUser ? copy[PlusType.Gift].title : copy[PlusType.Self].title),
    descriptionCopy:
      description ||
      (giftToUser
        ? copy[PlusType.Gift].description
        : copy[PlusType.Self].description),
    subtitleCopy:
      subtitle ||
      (giftToUser
        ? copy[PlusType.Gift].subtitle
        : copy[PlusType.Self].subtitle),
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
  title,
  description,
  subtitle,
}: PlusInfoProps & CommonPlusPageProps): ReactElement => {
  const router = useRouter();
  const { giftOneYear } = usePaymentContext();
  const { openModal } = useLazyModal();
  const { logSubscriptionEvent } = usePlusSubscription();
  const { giftToUser } = useGiftUserContext();

  const { titleCopy, descriptionCopy, subtitleCopy } = getCopy({
    giftToUser,
    title,
    description,
    subtitle,
  });

  return (
    <>
      {shouldShowPlusHeader && (
        <div className="mb-6 flex items-center">
          {showDailyDevLogo && <Logo logoClassName={{ container: 'h-5' }} />}
          <PlusUser
            iconSize={IconSize.Medium}
            typographyType={TypographyType.Title3}
          />
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
      <div className="mb-4">
        <ConditionalWrapper
          condition={!giftToUser && showGiftButton}
          wrapper={(component) => (
            <div className="flex flex-row items-center justify-between">
              <span>{component}</span>
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
                          priceId: productOptions[0].value,
                          giftToUserId: user.id,
                        });
                      },
                    },
                  });
                }}
              >
                Buy as a gift
              </Button>
            </div>
          )}
        >
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
            bold
          >
            {subtitleCopy}
          </Typography>
        </ConditionalWrapper>
      </div>
      {!!giftToUser && (
        <GiftingSelectedUser
          user={giftToUser}
          className="mb-6"
          onClose={() => {
            router.push('/plus');
            onChange({ priceId: productOptions[0].value });
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
            key={giftOneYear?.value}
            option={giftOneYear}
            checked
          />
        ) : (
          <>
            {productOptions.length === 0 && <RadioGroupSkeleton />}
            {productOptions.map((option) => {
              const { label, value } = option;
              return (
                <PlusOptionRadio
                  key={value}
                  option={option}
                  checked={selectedOption === value}
                  onChange={() => {
                    onChange({ priceId: value });
                    logSubscriptionEvent({
                      event_name: LogEvent.SelectBillingCycle,
                      target_id: label.toLowerCase(),
                    });
                  }}
                />
              );
            })}
          </>
        )}
      </div>
      {onContinue ? (
        <div className="py-6">
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            color={ButtonColor.Bacon}
            className="w-full !text-white"
            onClick={onContinue}
          >
            Continue »
          </Button>
        </div>
      ) : undefined}
      {showPlusList && <PlusList />}
    </>
  );
};
