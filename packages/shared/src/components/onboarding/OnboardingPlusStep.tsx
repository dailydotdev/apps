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
import { ElementPlaceholder } from '../ElementPlaceholder';
import { ListItemPlaceholder } from '../widgets/ListItemPlaceholder';

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

const PlusSkeleton = (): ReactElement => (
  <div className="flex flex-col items-center">
    <div className="mx-auto my-6 inline-flex gap-1 rounded-12 border border-border-subtlest-tertiary p-1 tablet:my-8">
      <ElementPlaceholder className="mx-auto inline-block h-10 w-80 rounded-10" />
    </div>
    <div className="mx-auto grid grid-cols-1 place-content-center items-start gap-6 tablet:grid-cols-2">
      {Array.from({ length: 2 }, (_, i) => i).map((index) => (
        <div
          key={index}
          className={classNames(
            'mx-auto w-[21rem] max-w-full rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4',
            index === 0 ? 'min-h-80' : 'min-h-96',
          )}
        >
          <ElementPlaceholder className="mb-4 h-6 w-10 rounded-4" />
          <ElementPlaceholder className="mb-1 h-8 w-10 rounded-4" />
          <ElementPlaceholder className="h-3 w-20 rounded-4" />
          <ElementPlaceholder className="my-4 h-10 w-full rounded-16" />
          <div className="flex flex-col gap-2">
            <ListItemPlaceholder padding="p-0 gap-2.5" textClassName="h-3" />
            {index === 1 && (
              <ListItemPlaceholder padding="p-0 gap-2.5" textClassName="h-3" />
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

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
  const isLoading = !items.length;

  return (
    <section className="flex max-w-screen-laptop flex-col tablet:px-10">
      <header className="text-center">
        <Typography
          bold
          tag={TypographyTag.H1}
          type={isLaptop ? TypographyType.LargeTitle : TypographyType.Title2}
          className="mb-4 tablet:mb-6"
        >
          Fast-track your growth
        </Typography>
        <Typography
          className="mx-auto text-balance tablet:w-2/3"
          tag={TypographyTag.H2}
          type={isLaptop ? TypographyType.Title3 : TypographyType.Callout}
        >
          Work smarter, learn faster, and stay ahead with AI tools, custom
          feeds, and pro features. Because copy-pasting code isn’t a long-term
          strategy.
        </Typography>
      </header>
      {!isLoading ? (
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
      ) : (
        <PlusSkeleton />
      )}
    </section>
  );
};
