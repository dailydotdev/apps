import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useViewSize, ViewSize } from '../../hooks';
import type { ProductOption } from '../../contexts/PaymentContext';
import { usePaymentContext } from '../../contexts/PaymentContext';
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
  return (
    <div
      aria-label="Select billing cycle"
      role="radiogroup"
      className="mx-auto my-6 inline-flex gap-1 rounded-12 border border-border-subtlest-tertiary p-1 tablet:my-8"
    >
      {productOptions.map(({ label, extraLabel }, index) => {
        const isActive = index === currentCycleIndex;
        const variant = isActive ? ButtonVariant.Float : ButtonVariant.Option;
        return (
          <Button
            aria-checked={isActive}
            aria-label={label}
            className="flex-1 justify-center"
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
          Supercharge your future
        </Typography>
        <Typography
          className="mx-auto text-balance tablet:w-2/3"
          tag={TypographyTag.H2}
          type={isLaptop ? TypographyType.Title3 : TypographyType.Callout}
        >
          Work smarter, learn faster, and stay ahead with AI tools, custom feeds, and premium features. Because copy-pasting code isn’t a long-term strategy.
        </Typography>
      </header>
      {!!items?.length && (
        <>
          <PlusBillingCycleSwitch
            productOptions={items}
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
