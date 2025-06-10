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
import { useOrganizationSubscription } from '../../hooks/useOrganizationSubscription';
import { formatOrganizationSubscriptionPreviewCurrency as formatCurrency } from '../../../../lib/utils';

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
  const { updateSubscription, isUpdatingSubscription, nextBilling } =
    useOrganizationSubscription(organizationId);

  const difference = quantity - seats.total;

  const pricing = data.pricing[0];
  const currency = pricing.currency.code;

  const checkoutButtons = (
    <div className="mt-auto flex flex-col gap-3 tablet:ml-auto tablet:flex-row-reverse">
      <Button
        loading={isUpdatingSubscription}
        variant={ButtonVariant.Primary}
        disabled={!nextBilling}
        onClick={() => {
          updateSubscription({
            id: organizationId,
            quantity,
          });
        }}
      >
        Pay now
      </Button>
      <Button
        loading={isUpdatingSubscription}
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
            {formatCurrency({
              amount: data.prorated.total.amount,
              currency,
            })}
          </Typography>
        </div>

        <Typography
          className="rounded-10 bg-surface-float p-4"
          type={TypographyType.Callout}
        >
          {nextBilling ? (
            <>
              (You will be charged for {quantity} total seats at your next
              renewal on {nextBilling})
            </>
          ) : (
            'Plan has been canceled and will not be renewed.'
          )}
        </Typography>

        <div className="flex flex-row items-center justify-between">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Subtotal
          </Typography>

          <Typography type={TypographyType.Body}>
            {formatCurrency({
              amount: data.prorated.subTotal.amount,
              currency,
            })}
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
            {formatCurrency({
              amount: data.prorated.tax.amount,
              currency,
            })}
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
            {formatCurrency({
              amount: nextBilling ? data.prorated.total.amount : 0,
              currency,
            })}
          </span>
        </Typography>

        {isMobile && checkoutButtons}
      </div>

      {!isMobile && <Modal.Footer>{checkoutButtons}</Modal.Footer>}
    </>
  );
};
