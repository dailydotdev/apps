import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useViewSize, ViewSize } from '../../hooks';
import { usePaymentContext } from '../../contexts/payment/context';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { PlusComparingCards } from '../plus/PlusComparingCards';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { ListItemPlaceholder } from '../widgets/ListItemPlaceholder';
import { PlusPriceType, PlusPriceTypeAppsId } from '../../lib/featureValues';

interface OnboardingStepProps {
  onClickNext: () => void;
}

const switchSkeletonItems = Array.from({ length: 2 }, (_, i) => i);
const PlusSkeleton = (): ReactElement => (
  <div className="flex flex-col items-center">
    <div className="mx-auto grid grid-cols-1 place-content-center items-start gap-6 tablet:grid-cols-2">
      {switchSkeletonItems.map((index) => (
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
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { productOptions } = usePaymentContext();
  const item = useMemo(
    () =>
      [...productOptions]
        .sort(({ appsId, duration }) => {
          if (appsId === PlusPriceTypeAppsId.EarlyAdopter) {
            return -1;
          }
          return duration === PlusPriceType.Yearly ? -1 : 0;
        })
        .at(0),
    [productOptions],
  );

  return (
    <section className="flex w-full max-w-screen-laptop flex-col gap-10 tablet:px-10">
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
          color={TypographyColor.Secondary}
          tag={TypographyTag.H2}
          type={isLaptop ? TypographyType.Title3 : TypographyType.Callout}
        >
          Work smarter, learn faster, and stay ahead with AI tools, custom
          feeds, and pro features. Because copy-pasting code isn’t a long-term
          strategy.
        </Typography>
      </header>
      {item ? (
        <PlusComparingCards productOption={item} onClickNext={onClickNext} />
      ) : (
        <PlusSkeleton />
      )}
    </section>
  );
};
