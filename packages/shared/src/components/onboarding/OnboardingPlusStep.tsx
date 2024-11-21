import React, { FC } from 'react';
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
import { Button, ButtonVariant } from '../buttons/Button';
import { plusUrl } from '../../lib/constants';

interface OnboardingStepProps {
  onClickNext: () => void;
}

enum OnboardingPlans {
  Free = 'Free',
  Plus = 'Plus',
}

const PlanCard: FC<
  {
    plan: OnboardingPlans;
  } & Pick<OnboardingStepProps, 'onClickNext'>
> = ({ plan, onClickNext }) => {
  const price = '5';
  const currency = '$';
  const isPlus = plan === OnboardingPlans.Plus;
  const billingCycle = 'monthly';
  const billingLabel = isPlus ? `Billed ${billingCycle}` : 'Free forever';

  return (
    <div
      key={plan}
      className="mx-auto w-70 max-w-full rounded-16 border border-border-subtlest-tertiary bg-background-default p-4"
    >
      <div className="flex items-start justify-between gap-6">
        <Typography
          bold
          className="mb-1.5"
          tag={TypographyTag.H2}
          type={TypographyType.Title3}
          color={isPlus ? TypographyColor.Plus : TypographyColor.Primary}
        >
          {plan}
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
          {price}
          {currency}
        </Typography>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
        >
          {billingLabel}
        </Typography>
      </div>
      {plan === OnboardingPlans.Free ? (
        <Button
          className="my-4 block w-full"
          onClick={onClickNext}
          title="Continue without Plus"
          variant={ButtonVariant.Secondary}
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
        items={isPlus ? plusFeatureList : defaultFeatureList}
        icon={{ size: IconSize.XSmall }}
        text={{
          type: TypographyType.Caption1,
          className: 'self-center',
        }}
      />
    </div>
  );
};

export const OnboardingPlusStep: FC<OnboardingStepProps> = ({
  onClickNext,
}) => {
  return (
    <section className="flex max-w-screen-laptop flex-col tablet:px-10">
      <header className="mb-10 text-center">
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

      <div className="mx-auto grid grid-cols-1 place-content-center gap-6 laptop:grid-cols-2">
        {Object.values(OnboardingPlans).map((plan) => (
          <PlanCard key={plan} plan={plan} onClickNext={onClickNext} />
        ))}
      </div>
    </section>
  );
};
