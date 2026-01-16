import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { RecruiterPaymentContext } from '@dailydotdev/shared/src/contexts/RecruiterPaymentContext/RecruiterPaymentContext';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import {
  MoveToIcon,
  ShareIcon,
} from '@dailydotdev/shared/src/components/icons';
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
import {
  OpportunityPreviewProvider,
  useOpportunityPreviewContext,
} from '@dailydotdev/shared/src/features/opportunity/context/OpportunityPreviewContext';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { useToastNotification } from '@dailydotdev/shared/src/hooks';
import { useCopyLink } from '@dailydotdev/shared/src/hooks/useCopy';
import { useAutoCreateOpportunityOrganization } from '@dailydotdev/shared/src/features/opportunity/hooks/useAutoCreateOpportunityOrganization';
import { ErrorBoundary } from '@dailydotdev/shared/src/components/ErrorBoundary';
import RecruiterErrorFallback from '@dailydotdev/shared/src/components/errors/RecruiterErrorFallback';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { getPathnameWithQuery } from '@dailydotdev/shared/src/lib/links';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { recruiterSeo } from '../../../next-seo';

const RecruiterPaymentPage = (): ReactElement => {
  const router = useRouter();
  const checkoutRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthContext();
  const { openCheckout, selectedProduct, prices } =
    useRecruiterPaymentContext();
  const { opportunity } = useOpportunityPreviewContext();
  const { displayToast } = useToastNotification();
  const [, copyLink] = useCopyLink();

  useAutoCreateOpportunityOrganization(opportunity);

  const handleSharePaymentLink = () => {
    if (!opportunity?.id) {
      return;
    }
    const queryParams = [
      selectedProduct?.id && `pid=${selectedProduct.id}`,
      user?.id && `ref=${user.id}`,
    ]
      .filter(Boolean)
      .join('&');
    const link = getPathnameWithQuery(
      `https://app.daily.dev/recruiter/pay/${opportunity.id}`,
      queryParams,
    );
    copyLink({ link, message: 'Payment link copied to clipboard' });
  };

  useEffect(() => {
    if (!opportunity || !opportunity.organization || !selectedProduct) {
      return;
    }

    openCheckout({
      priceId: selectedProduct.id,
      customData: { opportunity_id: opportunity.id },
    });
  }, [selectedProduct, openCheckout, opportunity]);

  useEffect(() => {
    if (!opportunity) {
      return;
    }

    if (opportunity.flags?.plan) {
      displayToast(
        'You already have active subscription for this opportunity.',
      );

      router.replace(`/recruiter/${opportunity.id}/prepare`);

      return;
    }

    if (opportunity.organization?.recruiterTotalSeats > 0) {
      displayToast(
        'You already have active subscription for this organization.',
      );

      router.replace(`/recruiter/${opportunity.id}/prepare`);
    }
  }, [displayToast, opportunity, router]);

  const handleBack = () => {
    router.back();
  };

  const selectedPrice = useMemo(() => {
    if (!prices?.length) {
      return undefined;
    }
    return (
      prices.find((price) => price.priceId === selectedProduct?.id) || prices[0]
    );
  }, [prices, selectedProduct?.id]);

  return (
    <div className="flex min-h-screen flex-col laptop:flex-row">
      <div className="flex flex-1 flex-col items-end bg-background-subtle p-10 px-20">
        <div className="flex w-full max-w-[30rem] gap-1">
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<MoveToIcon className="rotate-180" />}
            onClick={handleBack}
          />
          <div className="flex flex-1 flex-col">
            <div className="mb-10 flex h-8">
              <HeaderLogo isRecruiter href="/recruiter" />
            </div>
            <div className="flex flex-col gap-6">
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
              <div className="mt-6 flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  Need someone else to complete the payment?
                </Typography>
                <Button
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Small}
                  icon={<ShareIcon />}
                  onClick={handleSharePaymentLink}
                >
                  Copy payment link
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col bg-black p-10 px-20">
        <div className="w-full max-w-[30rem]">
          <div ref={checkoutRef} className="checkout-container h-full w-full" />
        </div>
      </div>
    </div>
  );
};

RecruiterPaymentPage.getLayout = function getLayout(
  page: ReactNode,
): ReactNode {
  return (
    <OpportunityPreviewProvider>
      <RecruiterPaymentContext>
        <ErrorBoundary
          feature="recruiter-self-serve"
          fallback={<RecruiterErrorFallback />}
        >
          <Toast autoDismissNotifications />
          {page}
        </ErrorBoundary>
      </RecruiterPaymentContext>
    </OpportunityPreviewProvider>
  );
};
RecruiterPaymentPage.layoutProps = { seo: recruiterSeo };

export default RecruiterPaymentPage;
