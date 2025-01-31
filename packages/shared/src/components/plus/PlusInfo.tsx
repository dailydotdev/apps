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
import type { ProductOption } from '../../contexts/PaymentContext';
import { usePaymentContext } from '../../contexts/PaymentContext';
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

type PlusInfoProps = {
  productOptions: ProductOption[];
  selectedOption: string | null;
  onChange: (priceId: string) => void;
  onContinue?: () => void;
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
    title: 'Unlock more with Plus',
    description:
      'Upgrade to daily.dev Plus for an enhanced, ad-free experience with exclusive features and perks to level up your game.',
    subtitle: 'Billing cycle',
  },
  [PlusType.Gift]: {
    title: 'Gift daily.dev Plus 🎁',
    description:
      'Gifting daily.dev Plus to a friend is the ultimate way to say, ‘I’ve got your back.’ It unlocks an ad-free experience, advanced content filtering and customizations, plus AI superpowers to supercharge their daily.dev journey.',
    subtitle: "Who's it for?",
  },
};

export const PlusInfo = ({
  productOptions,
  selectedOption,
  onChange,
  onContinue,
}: PlusInfoProps): ReactElement => {
  const router = useRouter();
  const { giftOneYear } = usePaymentContext();
  const { openModal } = useLazyModal();
  const { logSubscriptionEvent } = usePlusSubscription();
  const { giftToUser } = useGiftUserContext();
  const { title, description, subtitle } =
    copy[giftToUser ? PlusType.Gift : PlusType.Self];

  return (
    <>
      <PlusUser
        iconSize={IconSize.Large}
        typographyType={TypographyType.Title1}
        className="mb-6"
      />
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.Mega2}
        color={TypographyColor.Primary}
        className="mb-2"
        bold
      >
        {title}
      </Typography>
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title3}
        color={TypographyColor.Secondary}
        className="mb-6"
      >
        {description}
      </Typography>
      <ConditionalWrapper
        condition={!giftToUser}
        wrapper={(component) => (
          <div className="mb-4 flex flex-row items-center justify-between">
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
                openModal({ type: LazyModal.GiftPlus });
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
          className={giftToUser && 'mb-4'}
          bold
        >
          {subtitle}
        </Typography>
      </ConditionalWrapper>
      {!!giftToUser && (
        <GiftingSelectedUser
          user={giftToUser}
          className="mb-6"
          onClose={() => router.push('/plus')}
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
          productOptions.map((option) => {
            const { label, value } = option;

            return (
              <PlusOptionRadio
                key={value}
                option={option}
                checked={selectedOption === value}
                onChange={() => {
                  onChange(value);
                  logSubscriptionEvent({
                    event_name: LogEvent.SelectBillingCycle,
                    target_id: label.toLowerCase(),
                  });
                }}
              />
            );
          })
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
      <PlusList />
    </>
  );
};
