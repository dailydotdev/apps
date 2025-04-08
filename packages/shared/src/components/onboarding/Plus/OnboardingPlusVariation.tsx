import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { usePaymentContext } from '../../../contexts/payment/context';
import { PlusPriceType, PlusPriceTypeAppsId } from '../../../lib/featureValues';

import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { ButtonVariant } from '../../buttons/common';
import { anchorDefaultRel } from '../../../lib/strings';
import { plusUrl } from '../../../lib/constants';
import { ClickableText } from '../../buttons/ClickableText';
import type { ButtonProps } from '../../buttons/Button';
import { Button } from '../../buttons/Button';
import type { OnboardingStepProps } from './common';
import { LazyModal } from '../../modals/common/types';
import { plusFeatureList } from '../../plus/PlusList';
import type { PlusItem } from '../../plus/PlusListItem';
import { PlusItemStatus } from '../../plus/PlusListItem';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';

type VariationCardOptionProps = {
  onClickNext: () => void;
  title: string;
  description: string;
  price: string;
  button: {
    copy: string;
  } & ButtonProps<'a' | 'button'>;
  note?: string;
};
const VariationCardOption = ({
  onClickNext,
  title,
  description,
  price,
  button,
  note,
}: VariationCardOptionProps) => {
  const { copy, ...buttonProps } = button;

  return (
    <>
      <div className="flex flex-col gap-2">
        <Typography bold type={TypographyType.Title3} className="text-center">
          {title}
        </Typography>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
          className="text-center"
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

      <Button onClick={onClickNext} {...buttonProps}>
        {button.copy}
      </Button>

      {note ? (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {note}
        </Typography>
      ) : undefined}
    </>
  );
};

export const OnboardingPlusVariation = ({
  onClickNext,
}: OnboardingStepProps): ReactElement => {
  const { openModal } = useLazyModal();
  const { productOptions } = usePaymentContext();
  const { logEvent } = useLogContext();
  const item = useMemo(
    () =>
      [...productOptions]
        .sort(({ appsId, duration }) => {
          if (appsId === PlusPriceTypeAppsId.EarlyAdopter) {
            return -1;
          }
          return duration === PlusPriceType.Yearly ? 0 : 1;
        })
        .at(0),
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

  const handleItemClick = (clickItem: PlusItem) => {
    logEvent({
      event_name: LogEvent.ClickPlusFeature,
      target_id: clickItem.id,
      target_type: TargetType.Grid,
    });
    openModal({
      type: LazyModal.ContentModal,
      props: {
        ...clickItem.modalProps,
        onAfterClose: () => {
          logEvent({
            event_name: LogEvent.ClosePlusFeature,
            target_id: clickItem.id,
            target_type: TargetType.Grid,
          });
        },
      },
    });
  };

  return (
    <section className="flex w-full max-w-screen-laptop flex-col gap-6 tablet:gap-10 tablet:px-10">
      <header className="text-center">
        <Typography
          bold
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          className="mb-0 tablet:mb-10"
        >
          Suffer less. Debugging bad decisions is harder.
        </Typography>
      </header>

      {/* Pricing Plans Section */}
      <div className="w-full">
        <div className="mx-auto flex flex-col-reverse justify-center gap-4 tablet:flex-row">
          {/* Free Plan Card */}
          <div className="flex h-fit flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4 backdrop-blur-xl tablet:max-w-xs">
            <VariationCardOption
              onClickNext={onClickNext}
              button={{
                copy: 'Continue with Free',
                variant: ButtonVariant.Subtle,
              }}
              title="Free"
              description="For casual browsing. Get the basics and stay updated with the essentials."
              price={`${item?.currencySymbol ?? '$'}0`}
            />
          </div>

          {/* Plus Plan Card */}
          <div className="flex flex-col rounded-16 bg-accent-bacon-default p-1 pt-0">
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
            <div className="flex h-fit flex-col gap-4 rounded-12 bg-background-default p-4 tablet:max-w-xs">
              <VariationCardOption
                onClickNext={onClickNext}
                button={{
                  copy: 'Continue with Plus',
                  variant: ButtonVariant.Primary,
                  target: '_blank',
                  tag: 'a',
                  title: 'Continue with Plus',
                  rel: anchorDefaultRel,
                  href: `${plusUrl}?selectedPlan=${item?.value}`,
                }}
                title="Plus"
                description="For serious developers. Unlock smarter learning, pro insights, and exclusive tools to grow faster."
                price={`${item?.currencySymbol ?? ''}${
                  item?.price.monthlyFormatted ?? '0'
                }`}
                note="30 day hassle-free refund. No questions asked."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="w-full">
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-4">
          {featureCardsNew.map((feature) => (
            <a
              href="#"
              key={feature.label}
              className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-4 hover:cursor-pointer hover:bg-surface-float"
              onClick={(e) => {
                e.preventDefault();
                handleItemClick(feature);
              }}
              onMouseEnter={() => handleItemHover(feature)}
            >
              <div
                className={classNames(
                  'mr-auto flex size-8 items-center justify-center rounded-10',
                  feature.iconClasses,
                )}
              >
                {feature.icon}
              </div>

              <Typography bold type={TypographyType.Callout} className="mt-2">
                {feature.label}
              </Typography>

              <Typography
                color={TypographyColor.Secondary}
                type={TypographyType.Footnote}
              >
                {feature.tooltip}
              </Typography>

              <ClickableText
                tag="a"
                textClassName="!text-text-link typo-footnote mt-auto"
              >
                See in action
              </ClickableText>
            </a>
          ))}
        </div>
      </div>

      <Button
        variant={ButtonVariant.Primary}
        target="_blank"
        tag="a"
        title="Continue with Plus"
        rel={anchorDefaultRel}
        href={`${plusUrl}?selectedPlan=${item?.value}`}
        className="mx-auto"
      >
        Continue with Plus
      </Button>
    </section>
  );
};
