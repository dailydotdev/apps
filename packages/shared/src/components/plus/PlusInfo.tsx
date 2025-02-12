import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
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
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { LogEvent } from '../../lib/log';
import type { CommonPlusPageProps } from './common';
import Logo from '../Logo';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { PlusPriceType } from '../../lib/featureValues';

type PlusInfoProps = {
  productOptions: ProductOption[];
  selectedOption: string | null;
  onChange: (priceId: string) => void;
  onContinue?: () => void;
  showDailyDevLogo?: boolean;
  showPlusList?: boolean;
  title?: string;
  description?: string;
};

export const PlusInfo = ({
  productOptions,
  selectedOption,
  onChange,
  onContinue,
  shouldShowPlusHeader = true,
  showPlusList = true,
  showDailyDevLogo = false,
  title = 'Fast-track your growth',
  description = 'Work smarter, learn faster, and stay ahead with AI tools, custom feeds, and pro features. Because copy-pasting code isn’t a long-term strategy.',
}: PlusInfoProps & CommonPlusPageProps): ReactElement => {
  const { logSubscriptionEvent } = usePlusSubscription();
  const planTypes = useFeature(feature.pricingIds);

  const earlyAdopterPlanId = useMemo(() => {
    const monthlyPrices = productOptions.filter(
      (option) => planTypes[option.value] === PlusPriceType.Monthly,
    );

    if (monthlyPrices.length <= 1) {
      return null;
    }

    return monthlyPrices.reduce((acc, plan) => {
      return acc.priceUnformatted < plan.priceUnformatted ? acc : plan;
    }).value;
  }, [productOptions, planTypes]);

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
        {title}
      </Typography>
      <Typography
        tag={TypographyTag.H2}
        color={TypographyColor.Secondary}
        type={TypographyType.Body}
        className="mb-6"
      >
        {description}
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
      {showPlusList && <PlusList />}
    </>
  );
};
