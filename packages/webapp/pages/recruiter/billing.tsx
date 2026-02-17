import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { managePlusUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  getLayout,
  layoutProps,
} from '../../components/layouts/RecruiterSelfServeLayout';

function RecruiterBillingPage(): ReactElement {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col p-6">
      <div className="flex flex-col gap-6 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6">
        <div className="flex flex-col gap-1">
          <Typography type={TypographyType.Title2} bold>
            Billing &amp; Subscription
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Manage your subscription, update payment details, view invoices, or
            change your plan through our billing portal.
          </Typography>
        </div>
        <Button
          tag="a"
          href={managePlusUrl}
          target="_blank"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
        >
          Manage subscription
        </Button>
      </div>
    </div>
  );
}

RecruiterBillingPage.getLayout = getLayout;
RecruiterBillingPage.layoutProps = layoutProps;

export default RecruiterBillingPage;
