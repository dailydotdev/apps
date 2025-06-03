import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { usePaymentContext } from '../../../contexts/payment/context';
import { PlusPriceTypeAppsId } from '../../../lib/featureValues';

import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Button } from '../../buttons/Button';
import type { OnboardingStepProps } from './common';
import { plusFeatureList } from '../../plus/PlusList';
import type { PlusItem } from '../../plus/PlusListItem';
import { PlusItemStatus } from '../../plus/PlusListItem';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useViewSize, ViewSize } from '../../../hooks';
import Carousel from '../../containers/Carousel';
import { ArrowIcon } from '../../icons';
import { RadioItem } from '../../fields/RadioItem';

type VariationCardOptionProps = {
  selected: boolean;
  title: string;
  description: string;
  price: string;
};
const VariationCardOption = ({
  selected,
  title,
  description,
  price,
}: VariationCardOptionProps) => {
  return (
    <div className="flex gap-2">
      <RadioItem
        checked={selected}
        className={{
          content: '!pr-0',
        }}
      />
      <div className="flex flex-1 flex-col gap-2">
        <Typography bold type={TypographyType.Title3}>
          {title}
        </Typography>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
        >
          {description}
        </Typography>
      </div>

      <div className="flex items-center justify-center gap-1">
        <Typography bold type={TypographyType.Title1}>
          {price}
        </Typography>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
        >
          /month
        </Typography>
      </div>
    </div>
  );
};

export const OnboardingPlusVariationV1 = ({
  onClickNext,
  onClickPlus,
}: OnboardingStepProps): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { productOptions } = usePaymentContext();

  const { logEvent } = useLogContext();
  const item = useMemo(
    () =>
      productOptions.find(
        ({ metadata }) => metadata.appsId === PlusPriceTypeAppsId.Annual,
      ),
    [productOptions],
  );

  const featureCardsNew = plusFeatureList.filter(
    (plusItem) => plusItem.status === PlusItemStatus.Ready,
  );

  const handleItemHover = (hoverItem: PlusItem) => {
    logEvent({
      event_name: LogEvent.HoverPlusFeature,
      target_id: hoverItem.id,
      target_type: TargetType.Grid,
    });
  };

  const items = featureCardsNew.map((plusItem) => {
    return (
      <div
        key={plusItem.id}
        className="w-full"
        onMouseEnter={() => handleItemHover(plusItem)}
      >
        <div className="mb-6 h-50 w-full overflow-hidden rounded-10">
          {plusItem.modalProps?.mediaType === 'video' ? (
            <video
              className="w-full border-none"
              poster={plusItem.modalProps.imageUrl}
              src={plusItem.modalProps.videoUrl}
              muted
              autoPlay
              loop
              playsInline
              disablePictureInPicture
              controls={false}
              title={plusItem.modalProps.title}
            />
          ) : (
            <img
              src={plusItem.modalProps?.imageUrl}
              alt={plusItem.modalProps?.title}
              className="h-50 w-full rounded-10"
            />
          )}
        </div>
        <Typography type={TypographyType.Title3} bold className="mb-3">
          {plusItem.label}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {plusItem.modalProps?.description}
        </Typography>
      </div>
    );
  });

  return (
    <section className="flex w-full max-w-screen-laptop flex-col gap-6 tablet:gap-10 tablet:px-10">
      <header className="text-center">
        <Typography
          bold
          tag={TypographyTag.H1}
          type={isLaptop ? TypographyType.LargeTitle : TypographyType.Title2}
          className="mb-4 tablet:mb-6"
        >
          Suffer less. Debugging bad decisions is harder.
        </Typography>
      </header>

      <div className="flex w-full flex-col gap-10 tablet:flex-row tablet:gap-4">
        <div className="mx-auto flex flex-1 flex-col gap-4">
          {/* Plus Plan Card */}
          <a
            href="#"
            className="flex flex-col rounded-16 bg-accent-bacon-default p-1 pt-0"
            onClick={(e) => {
              e.preventDefault();
              onClickPlus();
            }}
          >
            {/* Best Value Badge */}
            <div className="mx-auto my-2">
              <Typography
                bold
                type={TypographyType.Caption1}
                color={TypographyColor.Primary}
                className="text-center uppercase"
              >
                Best value
              </Typography>
            </div>
            <div className="flex h-fit flex-col gap-4 rounded-12 bg-background-default p-4">
              <VariationCardOption
                selected
                title="Plus"
                description="For serious developers. Unlock smarter learning, pro insights, and exclusive tools to grow faster."
                price={item?.price.monthly?.formatted ?? '0'}
              />
            </div>
          </a>

          {/* Free Plan Card */}
          <a
            href="#"
            className="flex h-fit flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4 backdrop-blur-xl"
            onClick={(e) => {
              e.preventDefault();
              onClickNext();
            }}
          >
            <VariationCardOption
              selected={false}
              title="Free"
              description="For casual browsing. Get the basics and stay updated with the essentials."
              price={`${item?.currency?.symbol ?? '$'}0`}
            />
          </a>

          <div className="mx-auto mt-8 flex flex-col items-center gap-1">
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              className="w-full"
              onClick={onClickPlus}
            >
              Continue with Plus
            </Button>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              30 day hassle-free refund. No questions asked.
            </Typography>
          </div>
        </div>
        <div className="flex-1">
          <Carousel
            className={{
              wrapper: 'mx-auto w-[18.75rem]',
            }}
            items={items}
          >
            {({ onSwipedLeft, onSwipedRight, index }, indicator) => (
              <div className="mx-auto mt-4 flex w-full flex-1 justify-between">
                <Button
                  variant={ButtonVariant.Secondary}
                  icon={<ArrowIcon className="-rotate-90" />}
                  onClick={(e) => onSwipedRight(e)}
                  disabled={index === 0}
                />
                <span className="flex justify-center">{indicator}</span>
                <Button
                  variant={ButtonVariant.Secondary}
                  icon={<ArrowIcon className="rotate-90" />}
                  onClick={(e) => onSwipedLeft(e)}
                  disabled={index === items.length - 1}
                />
              </div>
            )}
          </Carousel>
        </div>
      </div>
    </section>
  );
};
