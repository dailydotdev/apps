import React, { FC, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import {
  defaultFeatureList,
  plusFeatureList,
  PlusList,
} from '../plus/PlusList';
import { DevPlusIcon } from '../icons';
import { IconSize } from '../Icon';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { plusUrl } from '../../lib/constants';
import {
  PaymentContextData,
  ProductOption,
  usePaymentContext,
} from '../../contexts/PaymentContext';

interface OnboardingStepProps {
  onClickNext: () => void;
}

enum OnboardingPlans {
  Free = 'Free',
  Plus = 'Plus',
}

interface PlanCardProps {
  currency: string;
  onClickNext: () => void;
  productOption?: ProductOption;
}

const PlanCard: FC<PlanCardProps> = ({
  currency,
  productOption: plan,
  onClickNext,
}) => {
  const isPlus = !!plan;
  const price = plan?.price ?? '0';
  const billingLabel = isPlus ? `Billed ${plan?.label}` : 'Free forever';

  return (
    <div className="mx-auto w-70 max-w-full rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
      <div className="flex items-start justify-between gap-6">
        <Typography
          bold
          className="mb-1.5"
          tag={TypographyTag.H2}
          type={TypographyType.Title3}
          color={isPlus ? TypographyColor.Plus : TypographyColor.Primary}
        >
          {isPlus ? 'Plus' : 'Free'}
        </Typography>
        {isPlus && (
          <Typography
            className="grid aspect-square h-8 w-8 place-content-center rounded-8 bg-surface-float"
            tag={TypographyTag.Span}
            color={TypographyColor.Plus}
          >
            <DevPlusIcon />
          </Typography>
        )}
      </div>
      <div>
        <Typography bold tag={TypographyTag.Span} type={TypographyType.Title1}>
          {!isPlus && currency}
          {price}
        </Typography>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
        >
          {billingLabel}
        </Typography>
      </div>
      {!isPlus ? (
        <Button
          className="my-4 block w-full"
          onClick={onClickNext}
          title="Continue without Plus"
          variant={ButtonVariant.Secondary}
          type="button"
        >
          Continue
        </Button>
      ) : (
        <Button
          className="my-4 block w-full"
          href={plusUrl}
          tag="a"
          title="Upgrade to Plus"
          variant={ButtonVariant.Primary}
        >
          Upgrade to Plus
        </Button>
      )}
      <PlusList
        className="!py-0"
        items={
          isPlus
            ? ['Everything on the Free plan', ...plusFeatureList]
            : defaultFeatureList
        }
        icon={{ size: IconSize.XSmall }}
        text={{
          type: TypographyType.Caption1,
          className: 'self-center',
        }}
      />
    </div>
  );
};

const PlanCards: FC<
  Pick<PaymentContextData, 'productOptions'> & {
    currentIndex: number;
    onClickNext: () => void;
  }
> = ({ productOptions, currentIndex, onClickNext }) => {
  const productOption = productOptions[currentIndex];
  const priceFirstChar = productOption.price.at(0);
  const currency = Number.isInteger(+priceFirstChar) ? '' : priceFirstChar;

  return (
    <div className="mx-auto grid grid-cols-1 place-content-center items-start gap-6 laptop:grid-cols-2">
      {Object.values(OnboardingPlans).map((plan) => (
        <PlanCard
          key={plan}
          currency={currency}
          productOption={
            plan === OnboardingPlans.Plus ? productOption : undefined
          }
          onClickNext={onClickNext}
        />
      ))}
    </div>
  );
};

export const OnboardingPlusStep: FC<OnboardingStepProps> = ({
  onClickNext,
}) => {
  const { productOptions } = usePaymentContext();
  const [currentPlanIndex, setCurrentPlanIndex] = useState<number>(0);

  return (
    <section className="flex max-w-screen-laptop flex-col tablet:px-10">
      <header className="text-center">
        <Typography
          bold
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          className="mb-6"
        >
          Unlock more with Plus
        </Typography>
        <Typography
          className="mx-auto text-balance laptop:w-2/3"
          tag={TypographyTag.H2}
          type={TypographyType.Title3}
        >
          Upgrade to daily.dev Plus for an enhanced, ad-free experience with
          exclusive features and perks to level up your game.
        </Typography>
      </header>
      {!!productOptions?.length && (
        <>
          <div className="mx-auto my-8 inline-flex gap-1 rounded-12 border border-border-subtlest-tertiary p-1">
            {productOptions.map(({ label, extraLabel }, index) => {
              const isActive = index === currentPlanIndex;
              const variant = isActive
                ? ButtonVariant.Float
                : ButtonVariant.Option;
              return (
                <Button
                  className="min-w-24 justify-center"
                  key={label}
                  onClick={() => setCurrentPlanIndex(index)}
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

          <PlanCards
            currentIndex={currentPlanIndex}
            productOptions={productOptions}
            onClickNext={onClickNext}
          />
        </>
      )}
    </section>
  );
};
