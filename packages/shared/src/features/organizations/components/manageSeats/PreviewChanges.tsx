import React from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { Modal } from '../../../../components/modals/common/Modal';
import { useOrganization } from '../../hooks/useOrganization';

import { useViewSize, ViewSize } from '../../../../hooks';
import { LogoWithPlus } from '../../../../components/Logo';
import { ButtonVariant } from '../../../../components/buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { HorizontalSeparator } from '../../../../components/utilities';
import { Button } from '../../../../components/buttons/Button';
import { PlusAdjustQuantity } from '../../../../components/plus/PlusAdjustQuantity';
import { PlusPlanExtraLabel } from '../../../../components/plus/PlusPlanExtraLabel';
import { IconSize } from '../../../../components/Icon';
import Link from '../../../../components/utilities/Link';
import { getOrganizationSettingsUrl } from '../../utils';
import { PlusPriceType } from '../../../../lib/featureValues';
import { SeatsOverview } from '../SeatsOverview';
import type { PreviewOrganizationSubscriptionUpdate } from '../../hooks/useOrganizationSubscription';
import { useOrganizationSubscription } from '../../hooks/useOrganizationSubscription';
import { formatOrganizationSubscriptionPreviewCurrency as formatCurrency } from '../../../../lib/utils';

type Props = {
  organizationId: string;
  onContinue: () => void;
  quantity: number;
  setQuantity: Dispatch<SetStateAction<number>>;
  data: PreviewOrganizationSubscriptionUpdate;
};

export const PreviewChanges = ({
  organizationId,
  onContinue,
  quantity,
  setQuantity,
  data,
}: Props) => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { seats } = useOrganization(organizationId);
  const { isLoading, isRefetching, nextBilling } = useOrganizationSubscription(
    organizationId,
    quantity,
  );

  const pricing = data?.pricing[0];
  const currency = pricing.currency.code;

  const isQuantityLessThanSeats = quantity < seats.assigned;

  const disableContinueButton =
    quantity === seats.total || isQuantityLessThanSeats;

  const continueButton = (
    <Button
      variant={ButtonVariant.Primary}
      disabled={disableContinueButton}
      loading={isLoading || isRefetching}
      className={isMobile ? 'w-full' : 'mt-auto'}
      onClick={onContinue}
    >
      Continue
    </Button>
  );

  return (
    <div className="flex w-full flex-1 flex-col tablet:flex-row">
      <section className="flex h-full w-full flex-1 flex-col gap-4 p-6">
        {!isMobile && (
          <LogoWithPlus
            className="mb-4"
            iconSize={IconSize.XSmall}
            logoClassName={{ container: 'h-6' }}
          />
        )}

        <Typography bold type={TypographyType.Body}>
          Number of seats
        </Typography>

        <PlusAdjustQuantity
          itemQuantity={quantity}
          selectedOption="organization.plan"
          checkoutItemsLoading={isLoading || isRefetching}
          setItemQuantity={setQuantity}
        />

        <Typography bold type={TypographyType.Body}>
          Billing cycle
        </Typography>

        <div className="flex h-14 items-center gap-1 rounded-10 border border-border-subtlest-tertiary px-3">
          <Typography bold type={TypographyType.Callout}>
            {pricing.metadata.title}
          </Typography>

          {pricing.metadata.caption && (
            <PlusPlanExtraLabel
              color={pricing.metadata.caption.color}
              label={pricing.metadata.caption.copy}
            />
          )}

          <div className="ml-auto flex flex-col gap-0.5 text-right">
            <Typography type={TypographyType.Body}>
              <span className="font-bold">
                {new Intl.NumberFormat(navigator.language, {
                  style: 'decimal',
                }).format(pricing.price?.monthly?.amount)}
              </span>{' '}
              <span className="text-text-secondary">
                {pricing.currency.code}
              </span>
            </Typography>

            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              per user/month
            </Typography>
          </div>
        </div>

        <Typography bold type={TypographyType.Body}>
          Team overview
        </Typography>

        <SeatsOverview organizationId={organizationId} />
      </section>

      {isMobile && (
        <div className="w-full px-6">
          <HorizontalSeparator />
        </div>
      )}

      <section className="relative flex h-full w-full flex-1 flex-col gap-2 rounded-l-16 border-border-subtlest-tertiary p-6 tablet:border-l">
        {!isMobile && <div className="h-12" />}
        <Typography bold type={TypographyType.Body}>
          Summary
        </Typography>

        <div className="flex flex-col gap-0.5">
          <div className="flex flex-row items-center justify-between">
            <Typography type={TypographyType.Callout}>
              daily.dev for teams
            </Typography>
            <Typography type={TypographyType.Body}>
              {formatCurrency({
                amount: data.total.amount,
                currency,
              })}
            </Typography>
          </div>

          <div className="flex flex-row items-center justify-between">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {quantity} {quantity === 1 ? 'user' : 'users'}{' '}
              {pricing.duration === PlusPriceType.Yearly && 'x 12 months'}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {formatCurrency({
                amount: pricing.price?.monthly?.amount,
                currency,
              })}
              {pricing.price?.monthly?.formatted}
              /seat
            </Typography>
          </div>
        </div>

        {/* TODO: see if we need this */}
        {/* <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <Typography type={TypographyType.Callout}>Discount</Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Annual (-50%)
            </Typography>
          </div>

          <div className="flex flex-col gap-0.5">
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.StatusSuccess}
            >
              -$120
            </Typography>
          </div>
        </div> */}

        <HorizontalSeparator className="my-2" />

        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <Typography type={TypographyType.Callout}>Plan Total</Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Billed{' '}
              {pricing.duration === PlusPriceType.Yearly
                ? 'annually'
                : 'monthly'}{' '}
              starting {nextBilling}
            </Typography>
          </div>

          <Typography bold type={TypographyType.Body}>
            {formatCurrency({
              amount: data.total.amount,
              currency,
            })}
          </Typography>
        </div>

        {isQuantityLessThanSeats && (
          <Typography
            className="rounded-10 bg-surface-float p-4"
            type={TypographyType.Callout}
          >
            You&apos;ve got {seats.assigned} seats assigned. To lower your seat
            count, unassign {seats.assigned - quantity}{' '}
            {seats.assigned - quantity === 1 ? 'member' : 'members'} first.{' '}
            <Link
              href={getOrganizationSettingsUrl(organizationId, 'members')}
              passHref
            >
              <a className="underline">Manage members</a>
            </Link>
          </Typography>
        )}

        {!isMobile && continueButton}
      </section>

      {isMobile && <Modal.Footer>{continueButton}</Modal.Footer>}
    </div>
  );
};
