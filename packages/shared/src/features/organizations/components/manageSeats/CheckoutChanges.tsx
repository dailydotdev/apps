import React from 'react';
import type { ReactElement } from 'react';

import { useViewSize, ViewSize } from '../../../../hooks';
import { ButtonVariant } from '../../../../components/buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { HorizontalSeparator } from '../../../../components/utilities';
import { Button } from '../../../../components/buttons/Button';
import { useOrganization } from '../../hooks/useOrganization';
import { Modal } from '../../../../components/modals/common/Modal';
import type { PreviewOrganizationSubscriptionUpdate } from '../../hooks/useOrganizationSubscription';

type Props = {
  organizationId: string;
  goBack: () => void;
  quantity: number;
  data: PreviewOrganizationSubscriptionUpdate;
};

export const CheckoutChanges = ({
  organizationId,
  goBack,
  quantity,
  data,
}: Props): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { seats } = useOrganization(organizationId);

  const difference = quantity - seats.total;

  const pricing = data.pricing[0];

  const checkoutButtons = (
    <div className="mt-auto flex flex-col gap-3 tablet:ml-auto tablet:flex-row-reverse">
      <Button variant={ButtonVariant.Primary}>Pay now</Button>
      <Button
        variant={isMobile ? ButtonVariant.Float : ButtonVariant.Secondary}
        onClick={goBack}
      >
        Cancel
      </Button>
    </div>
  );

  return (
    <>
      <div className="flex w-full flex-1 flex-col gap-4 tablet:p-6">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <Typography type={TypographyType.Callout}>
              {quantity > seats.total ? 'Adding' : 'Removing'}{' '}
              {Math.abs(difference)} seat
              {Math.abs(difference) === 1 ? '' : 's'}
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {difference > 0
                ? 'Prorated amount until next billing cycle'
                : 'Removed seats will remain available until your next renewal'}
            </Typography>
          </div>

          <Typography bold type={TypographyType.Body}>
            {new Intl.NumberFormat(navigator.language, {
              style: 'currency',
              currency: pricing.currency.code,
            }).format(data.prorated.total.amount)}
          </Typography>
        </div>

        <Typography
          className="rounded-10 bg-surface-float p-4"
          type={TypographyType.Callout}
        >
          You will be charged for {quantity} total seats at your next renewal on{' '}
          {new Date(data.nextBilling).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>

        <div className="flex flex-row items-center justify-between">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Subtotal
          </Typography>

          <Typography type={TypographyType.Body}>
            {new Intl.NumberFormat(navigator.language, {
              style: 'currency',
              currency: pricing.currency.code,
            }).format(data.prorated.subTotal.amount)}
          </Typography>
        </div>

        <div className="flex flex-row items-center justify-between">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Tax
          </Typography>

          <Typography type={TypographyType.Body}>
            {new Intl.NumberFormat(navigator.language, {
              style: 'currency',
              currency: pricing.currency.code,
            }).format(data.prorated.tax.amount)}
          </Typography>
        </div>

        <HorizontalSeparator />

        <Typography
          bold
          type={TypographyType.Callout}
          className="flex flex-row justify-between pb-4"
        >
          <span>Total due today</span>

          <span>
            {new Intl.NumberFormat(navigator.language, {
              style: 'currency',
              currency: pricing.currency.code,
            }).format(data.prorated.total.amount)}
          </span>
        </Typography>

        {isMobile && checkoutButtons}
      </div>

      {!isMobile && <Modal.Footer>{checkoutButtons}</Modal.Footer>}
    </>
  );
};
