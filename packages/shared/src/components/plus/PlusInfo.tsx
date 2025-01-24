import type { ReactElement } from 'react';
import React from 'react';
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
import { LogEvent } from '../../lib/log';
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
  Regular = 'regular',
  Gift = 'gift',
}

interface PageCopy {
  title: string;
  description: string;
  subtitle: string;
}

const copy: Record<PlusType, PageCopy> = {
  [PlusType.Regular]: {
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
  const { giftOneYear } = usePaymentContext();
  const { openModal } = useLazyModal();
  const { logSubscriptionEvent } = usePlusSubscription();
  const { giftingUser, onUserChange } = useGiftUserContext();
  const { title, description, subtitle } =
    copy[giftingUser ? PlusType.Gift : PlusType.Regular];

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
        condition={!giftingUser}
        wrapper={(component) => (
          <div className="mb-4 flex flex-row items-center justify-between">
            <span>{component}</span>
            <Button
              icon={<GiftIcon />}
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Float}
              onClick={() =>
                openModal({
                  type: LazyModal.GiftPlus,
                  props: { onSubmit: onUserChange },
                })
              }
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
          className={giftingUser && 'mb-4'}
          bold
        >
          {subtitle}
        </Typography>
      </ConditionalWrapper>
      {!!giftingUser && (
        <GiftingSelectedUser
          user={giftingUser}
          onClose={() => onUserChange(null)}
        />
      )}
      <div className="min-h-[6.125rem] rounded-10 border border-border-subtlest-tertiary">
        {giftingUser ? (
          <PlusOptionRadio
            key={giftOneYear.value}
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
