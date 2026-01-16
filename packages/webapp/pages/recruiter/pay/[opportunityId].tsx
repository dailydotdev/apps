import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { NextSeo } from 'next-seo';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import { useRecruiterPaymentContext } from '@dailydotdev/shared/src/contexts/RecruiterPaymentContext/types';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { ErrorBoundary } from '@dailydotdev/shared/src/components/ErrorBoundary';
import RecruiterErrorFallback from '@dailydotdev/shared/src/components/errors/RecruiterErrorFallback';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { RecruiterPaymentPublicContextProvider } from '@dailydotdev/shared/src/contexts/RecruiterPaymentContext/RecruiterPaymentPublicContext';
import {
  opportunityByIdPublicOptions,
  type OpportunityPublic,
} from '@dailydotdev/shared/src/features/opportunity/queries';
import { VIcon as CheckIcon } from '@dailydotdev/shared/src/components/icons';
import type { ProductPricingPreview } from '@dailydotdev/shared/src/graphql/paddle';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

const PaymentCompleteMessage = (): ReactElement => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-10">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-status-success">
      <CheckIcon className="text-white" size={IconSize.XLarge} />
    </div>
    <Typography type={TypographyType.Title1} bold>
      Payment successful
    </Typography>
    <Typography
      type={TypographyType.Body}
      color={TypographyColor.Secondary}
      className="text-center"
    >
      Thank you for your payment. The recruiter who shared this link has been
      notified.
    </Typography>
  </div>
);

const AlreadyPaidMessage = (): ReactElement => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-10">
    <Typography type={TypographyType.Title1} bold>
      Already subscribed
    </Typography>
    <Typography
      type={TypographyType.Body}
      color={TypographyColor.Secondary}
      className="text-center"
    >
      This opportunity already has an active subscription.
    </Typography>
  </div>
);

const NotFoundMessage = (): ReactElement => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-10">
    <Typography type={TypographyType.Title1} bold>
      Opportunity not found
    </Typography>
    <Typography type={TypographyType.Body} color={TypographyColor.Secondary}>
      The payment link may be invalid or expired.
    </Typography>
  </div>
);

interface PlanSelectorProps {
  prices: ProductPricingPreview[];
  selectedPriceId: string;
  onSelect: (priceId: string) => void;
}

const PlanSelector = ({
  prices,
  selectedPriceId,
  onSelect,
}: PlanSelectorProps): ReactElement => (
  <div className="flex flex-col gap-2">
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      bold
    >
      Select plan
    </Typography>
    <div className="flex gap-2">
      {prices.map((price) => (
        <Button
          key={price.priceId}
          variant={
            selectedPriceId === price.priceId
              ? ButtonVariant.Primary
              : ButtonVariant.Float
          }
          size={ButtonSize.Small}
          onClick={() => onSelect(price.priceId)}
        >
          {price.metadata.title || 'Standard'}
        </Button>
      ))}
    </div>
  </div>
);

interface PaymentFormProps {
  opportunity: OpportunityPublic;
  referrerId?: string;
}

const PaymentForm = ({
  opportunity,
  referrerId,
}: PaymentFormProps): ReactElement => {
  const { openCheckout, selectedProduct, setSelectedProduct, prices } =
    useRecruiterPaymentContext();

  useEffect(() => {
    if (!opportunity || !selectedProduct) {
      return;
    }

    openCheckout?.({
      priceId: selectedProduct.id,
      customData: {
        opportunity_id: opportunity.id,
        ...(referrerId && { recruiter_id: referrerId }),
      },
    });
  }, [selectedProduct, openCheckout, opportunity, referrerId]);

  const selectedPrice = useMemo(() => {
    if (!prices?.length) {
      return undefined;
    }
    return (
      prices.find((price) => price.priceId === selectedProduct?.id) || prices[0]
    );
  }, [prices, selectedProduct?.id]);

  const handlePlanSelect = (priceId: string) => {
    setSelectedProduct({ id: priceId });
  };

  return (
    <div className="flex min-h-screen flex-col laptop:flex-row">
      <div className="flex flex-1 flex-col items-end bg-background-subtle p-10 px-20">
        <div className="flex w-full max-w-[30rem] flex-col">
          <div className="mb-10 flex h-8">
            <HeaderLogo isRecruiter href="/recruiter" />
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
              >
                Payment for job opportunity
              </Typography>
              <Typography type={TypographyType.Title3} bold>
                {opportunity?.title || 'Job Opportunity'}
              </Typography>
              {opportunity?.organization?.name && (
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {opportunity.organization.name}
                </Typography>
              )}
            </div>

            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
            >
              Subscription to daily.dev Recruiter{' '}
              {selectedPrice?.metadata.title ? (
                <Typography
                  tag={TypographyTag.Span}
                  bold
                >{`- ${selectedPrice.metadata.title}`}</Typography>
              ) : (
                ''
              )}
            </Typography>

            {!selectedPrice && <Loader />}
            {!!selectedPrice && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Typography type={TypographyType.LargeTitle} bold>
                    {selectedPrice.price.monthly.formatted}
                  </Typography>
                  <Typography
                    type={TypographyType.Body}
                    color={TypographyColor.Tertiary}
                  >
                    per
                    <br />
                    month
                  </Typography>
                </div>

                {prices && prices.length > 1 && (
                  <PlanSelector
                    prices={prices}
                    selectedPriceId={selectedPrice.priceId}
                    onSelect={handlePlanSelect}
                  />
                )}

                <FlexCol className="gap-1">
                  <div className="flex items-center justify-between">
                    <Typography
                      type={TypographyType.Body}
                      color={TypographyColor.Secondary}
                      bold
                    >
                      Platform plan
                    </Typography>
                    <Typography
                      type={TypographyType.Body}
                      color={TypographyColor.Secondary}
                      bold
                    >
                      Price varies
                    </Typography>
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                    >
                      Billed monthly based on usage
                    </Typography>
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                    >
                      {selectedPrice.price.monthly.formatted} per job
                    </Typography>
                  </div>
                </FlexCol>
              </div>
            )}
            <div className="mt-4 flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-6">
              <div className="flex items-center justify-between">
                <Typography
                  type={TypographyType.Body}
                  color={TypographyColor.Secondary}
                >
                  Subtotal
                </Typography>
                <Typography type={TypographyType.Body} bold>
                  {selectedPrice?.price.monthly.formatted ?? 'X.XX'}
                </Typography>
              </div>

              <div className="flex items-center justify-between">
                <Typography
                  type={TypographyType.Body}
                  color={TypographyColor.Secondary}
                >
                  Tax
                </Typography>
                <Typography type={TypographyType.Body} bold>
                  $0.00
                </Typography>
              </div>

              <div className="flex items-center justify-between border-t border-border-subtlest-tertiary pt-4">
                <Typography type={TypographyType.Title3} bold>
                  Total due today
                </Typography>
                <Typography type={TypographyType.Title3} bold>
                  {selectedPrice?.price.monthly.formatted ?? 'X.XX'}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col bg-black p-10 px-20">
        <div className="w-full max-w-[30rem]">
          <div className="checkout-container h-full w-full" />
        </div>
      </div>
    </div>
  );
};

const RecruiterPublicPaymentPage = (): ReactElement => {
  const router = useRouter();
  const opportunityId = router.query.opportunityId as string;
  const referrerId = router.query.ref as string | undefined;
  const [paymentComplete, setPaymentComplete] = useState(false);

  const { data: opportunity, isLoading: isOpportunityLoading } = useQuery({
    ...opportunityByIdPublicOptions({ id: opportunityId || '' }),
    enabled: !!opportunityId && router.isReady,
  });

  if (paymentComplete) {
    return <PaymentCompleteMessage />;
  }

  if (!router.isReady || isOpportunityLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!opportunity) {
    return <NotFoundMessage />;
  }

  if (opportunity.flags?.plan) {
    return <AlreadyPaidMessage />;
  }

  return (
    <RecruiterPaymentPublicContextProvider
      onPaymentComplete={() => setPaymentComplete(true)}
    >
      <PaymentForm opportunity={opportunity} referrerId={referrerId} />
    </RecruiterPaymentPublicContextProvider>
  );
};

RecruiterPublicPaymentPage.getLayout = function getLayout(
  page: ReactNode,
): ReactNode {
  return (
    <ErrorBoundary
      feature="recruiter-self-serve"
      fallback={<RecruiterErrorFallback />}
    >
      <Toast autoDismissNotifications />
      {page}
    </ErrorBoundary>
  );
};

RecruiterPublicPaymentPage.layoutProps = {
  seo: (
    <NextSeo title="Complete Payment - daily.dev Recruiter" nofollow noindex />
  ),
};

export default RecruiterPublicPaymentPage;
