import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { PlusUser } from '../PlusUser';
import { IconSize } from '../Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { RadioItem } from '../fields/RadioItem';
import { PlusList } from './PlusList';
import { plusInfo } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import { ProductOption } from '../../contexts/PaymentContext';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { LogEvent } from '../../lib/log';

type PlusInfoProps = {
  productOptions: ProductOption[];
  selectedOption: string | null;
  onChange: (priceId: string) => void;
  onContinue?: () => void;
};
export const PlusInfo = ({
  productOptions,
  selectedOption,
  onChange,
  onContinue,
}: PlusInfoProps): ReactElement => {
  const { logSubscriptionEvent } = usePlusSubscription();
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
        Unlock more with Plus
      </Typography>
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title3}
        color={TypographyColor.Secondary}
        className="mb-6"
      >
        Upgrade to daily.dev Plus for an enhanced, ad-free experience with
        exclusive features and perks to level up your game.
      </Typography>
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="mb-4"
        bold
      >
        Billing cycle
      </Typography>
      <div className="min-h-[6.125rem] rounded-10 border border-border-subtlest-tertiary">
        {productOptions.map((option) => {
          const { label, value, price, currencyCode, extraLabel } = option;
          const checked = selectedOption === value;
          return (
            <div
              key={label}
              className={classNames(
                'flex h-12 items-center justify-between rounded-10 p-2',
                checked
                  ? 'border border-border-subtlest-primary bg-surface-float'
                  : undefined,
              )}
            >
              <div className="flex items-center">
                <RadioItem
                  name={label}
                  id={`${label}-${value}`}
                  value={value}
                  checked={checked}
                  onChange={() => {
                    onChange(value);
                    logSubscriptionEvent(
                      LogEvent.SelectBillingCycle,
                      label.toLowerCase(),
                    );
                  }}
                  className={{
                    content: 'truncate',
                  }}
                >
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                  >
                    {option.label}
                  </Typography>
                </RadioItem>
                {extraLabel ? (
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption1}
                    color={TypographyColor.StatusSuccess}
                    className="rounded-10 bg-action-upvote-float px-2 py-1"
                    bold
                  >
                    {extraLabel}
                  </Typography>
                ) : undefined}
              </div>
              <div className="mr-1 flex items-center gap-1">
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Body}
                  color={TypographyColor.Primary}
                  bold
                >
                  {price}
                </Typography>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Body}
                  color={TypographyColor.Secondary}
                >
                  {currencyCode}
                </Typography>
              </div>
            </div>
          );
        })}
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
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Still on the fence?{' '}
        <a
          className="text-text-link hover:underline"
          href={plusInfo}
          target="_blank"
          rel={anchorDefaultRel}
        >
          See what’s inside!
        </a>
      </Typography>
    </>
  );
};
