import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { usePaymentContext } from '../../../contexts/payment/context';
import { PlusPriceTypeAppsId } from '../../../lib/featureValues';

import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { ButtonVariant } from '../../../components/buttons/common';
import { ClickableText } from '../../../components/buttons/ClickableText';
import type { ButtonProps } from '../../../components/buttons/Button';
import { Button } from '../../../components/buttons/Button';
import { LazyModal } from '../../../components/modals/common/types';
import { plusFeatureList } from '../../../components/plus/PlusList';
import type { PlusItem } from '../../../components/plus/PlusListItem';
import { PlusItemStatus } from '../../../components/plus/PlusListItem';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useViewSize, ViewSize } from '../../../hooks';
import type { FunnelStepPlusCards } from '../types/funnel';

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

type Parameters = FunnelStepPlusCards['parameters'];

interface OnboardingPlusVariationProps extends Parameters {
  onSkip?: () => void;
  onComplete?: () => void;
}

export const OnboardingPlusVariation = ({
  onSkip,
  onComplete,
  headline,
  explainer,
  free,
  plus,
}: OnboardingPlusVariationProps): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { openModal } = useLazyModal();
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
          type={isLaptop ? TypographyType.LargeTitle : TypographyType.Title2}
          className="mb-4 tablet:mb-6"
        >
          {headline || 'Fast-track your growth'}
        </Typography>
        <Typography
          className="mx-auto text-balance tablet:w-2/3"
          color={TypographyColor.Secondary}
          tag={TypographyTag.H2}
          type={isLaptop ? TypographyType.Title3 : TypographyType.Callout}
        >
          {explainer ||
            `Work smarter, learn faster, and stay ahead with AI tools, custom
          feeds, and pro features. Because copy-pasting code isn't a
          long-term strategy.`}
        </Typography>
      </header>

      {/* Pricing Plans Section */}
      <div className="w-full">
        <div className="mx-auto flex flex-col-reverse justify-center gap-4 tablet:flex-row">
          {/* Free Plan Card */}
          <div className="flex h-fit flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4 backdrop-blur-xl tablet:max-w-xs">
            <VariationCardOption
              onClickNext={onSkip}
              button={{
                copy: free?.cta || 'Join for free',
                variant: ButtonVariant.Subtle,
              }}
              title={free.title || 'Free'}
              description={
                free.description ||
                'For casual browsing. Get the basics and stay updated with the essentials.'
              }
              price={`${item?.currency?.symbol ?? '$'}0`}
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
                onClickNext={onSkip}
                button={{
                  copy: plus?.cta || 'Get started',
                  variant: ButtonVariant.Primary,
                  title: plus?.cta || 'Get started',
                  onClick: onComplete,
                }}
                title={plus?.title || 'Plus'}
                description={
                  plus?.description ||
                  'For serious developers. Unlock smarter learning, pro insights, and exclusive tools to grow faster.'
                }
                price={item?.price.monthly?.formatted ?? '0'}
                note={
                  plus?.note || '30 day hassle-free refund. No questions asked.'
                }
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
        title={plus?.cta || 'Get started'}
        className="mx-auto"
        onClick={onComplete}
      >
        Get started
      </Button>
    </section>
  );
};
