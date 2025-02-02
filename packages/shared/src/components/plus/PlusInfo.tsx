import type { ReactElement } from 'react';
import React from 'react';
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
  const { earlyAdopterPlanId } = usePaymentContext();
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
        Supercharge your future
      </Typography>
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title3}
        color={TypographyColor.Secondary}
        className="mb-6"
      >
        Work smarter, learn faster, and stay ahead with AI tools, custom feeds, and premium features. Because copy-pasting code isn’t a long-term strategy.
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
          const isEarlyAccess = value === earlyAdopterPlanId;
          return (
            <RadioItem
              key={label}
              name={label}
              id={`${label}-${value}`}
              value={value}
              checked={checked}
              onChange={() => {
                onChange(value);
                logSubscriptionEvent({
                  event_name: LogEvent.SelectBillingCycle,
                  target_id: label.toLowerCase(),
                });
              }}
              className={{
                content: classNames(
                  'min-h-12 rounded-10 !p-2',
                  checked
                    ? '-m-px border border-border-subtlest-primary bg-surface-float'
                    : undefined,
                ),
              }}
            >
              <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Callout}
                  color={TypographyColor.Primary}
                >
                  {option.label}
                </Typography>

                {extraLabel && (
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption1}
                    color={
                      isEarlyAccess
                        ? TypographyColor.StatusHelp
                        : TypographyColor.StatusSuccess
                    }
                    className={classNames(
                      'rounded-10 px-2 py-1',
                      isEarlyAccess
                        ? 'whitespace-nowrap bg-action-help-float'
                        : 'bg-action-upvote-float',
                    )}
                    bold
                  >
                    {extraLabel}
                  </Typography>
                )}
              </div>
              <div className="ml-auto mr-1 flex items-center gap-1">
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
                  className="font-normal"
                >
                  {currencyCode}
                </Typography>
              </div>
            </RadioItem>
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
    </>
  );
};
