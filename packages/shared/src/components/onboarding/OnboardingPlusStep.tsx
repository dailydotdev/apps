import React, { ReactElement, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useViewSize, ViewSize } from '../../hooks';
import {
  ProductOption,
  usePaymentContext,
} from '../../contexts/PaymentContext';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { PlusComparingCards } from '../plus/PlusComparingCards';

interface OnboardingStepProps {
  onClickNext: () => void;
}

const PlusBillingCycleSwitch = ({
  productOptions,
  currentCycleIndex,
  onChangeCycle,
}: {
  productOptions: ProductOption[];
  currentCycleIndex: number;
  onChangeCycle: (index: number) => void;
}): ReactElement => {
  const { earlyAdopterPlanId } = usePaymentContext();
  const items = useMemo(
    () => productOptions.filter(({ value }) => value !== earlyAdopterPlanId),
    [productOptions, earlyAdopterPlanId],
  );

  return (
    <div
      aria-label="Select billing cycle"
      role="radiogroup"
      className="mx-auto my-6 inline-flex gap-1 rounded-12 border border-border-subtlest-tertiary p-1 tablet:my-8"
    >
      {items.map(({ label, extraLabel }, index) => {
        const isActive = index === currentCycleIndex;
        const variant = isActive ? ButtonVariant.Float : ButtonVariant.Option;
        return (
          <Button
            aria-checked={isActive}
            aria-label={label}
            className="min-w-24 justify-center"
            key={label}
            onClick={() => onChangeCycle(index)}
            role="radio"
            size={ButtonSize.Medium}
            variant={variant}
          >
            <span>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
                className={classNames('text-center capitalize', {
                  'font-normal': !isActive,
                })}
              >
                {label}
              </Typography>
              {extraLabel && (
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption2}
                  color={TypographyColor.StatusSuccess}
                  className="block text-center font-normal"
                >
                  {extraLabel}
                </Typography>
              )}
            </span>
          </Button>
        );
      })}
    </div>
  );
};

export const OnboardingPlusStep = ({
  onClickNext,
}: OnboardingStepProps): ReactElement => {
  const { productOptions, earlyAdopterPlanId } = usePaymentContext();
  const [currentProductIndex, setCurrentProductIndex] = useState<number>(0);
  const isLaptop = useViewSize(ViewSize.Laptop);

  const items = useMemo(
    () => productOptions.filter(({ value }) => value !== earlyAdopterPlanId),
    [productOptions, earlyAdopterPlanId],
  );

  return (
    <section className="flex max-w-screen-laptop flex-col tablet:px-10">
      <header className="text-center">
        <Typography
          bold
          tag={TypographyTag.H1}
          type={isLaptop ? TypographyType.LargeTitle : TypographyType.Title2}
          className="mb-4 tablet:mb-6"
        >
          Unlock more with Plus
        </Typography>
        <Typography
          className="mx-auto text-balance tablet:w-2/3"
          tag={TypographyTag.H2}
          type={isLaptop ? TypographyType.Title3 : TypographyType.Callout}
        >
          Upgrade to daily.dev Plus for an enhanced, ad-free experience with
          exclusive features and perks to level up your game.
        </Typography>
      </header>
      {!!items?.length && (
        <>
          <PlusBillingCycleSwitch
            productOptions={productOptions}
            currentCycleIndex={currentProductIndex}
            onChangeCycle={setCurrentProductIndex}
          />
          <PlusComparingCards
            currentIndex={currentProductIndex}
            productOptions={items}
            onClickNext={onClickNext}
          />
        </>
      )}
    </section>
  );
};
