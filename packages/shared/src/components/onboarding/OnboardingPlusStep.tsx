import React, { FC, useState } from 'react';
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

const PlusBillingCycleSwitch: FC<{
  productOptions: ProductOption[];
  currentCycleIndex: number;
  onChangeCycle: (index: number) => void;
}> = ({ productOptions, currentCycleIndex, onChangeCycle }) => {
  return (
    <div className="mx-auto my-6 inline-flex gap-1 rounded-12 border border-border-subtlest-tertiary p-1 tablet:my-8">
      {productOptions.map(({ label, extraLabel }, index) => {
        const isActive = index === currentCycleIndex;
        const variant = isActive ? ButtonVariant.Float : ButtonVariant.Option;
        return (
          <Button
            className="min-w-24 justify-center"
            key={label}
            onClick={() => onChangeCycle(index)}
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

export const OnboardingPlusStep: FC<OnboardingStepProps> = ({
  onClickNext,
}) => {
  const { productOptions } = usePaymentContext();
  const [currentProductIndex, setCurrentProductIndex] = useState<number>(0);
  const isLaptop = useViewSize(ViewSize.Laptop);

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
      {!!productOptions?.length && (
        <>
          <PlusBillingCycleSwitch
            productOptions={productOptions}
            currentCycleIndex={currentProductIndex}
            onChangeCycle={setCurrentProductIndex}
          />
          <PlusComparingCards
            currentIndex={currentProductIndex}
            productOptions={productOptions}
            onClickNext={onClickNext}
          />
        </>
      )}
    </section>
  );
};
