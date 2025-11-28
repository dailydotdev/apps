import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { usePaymentContext } from '@dailydotdev/shared/src/contexts/payment/context';
import { PaymentContextProvider } from '@dailydotdev/shared/src/contexts/payment';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import { MoveToIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';

const RecruiterPaymentPage = (): ReactElement => {
  const router = useRouter();
  const checkoutRef = useRef<HTMLDivElement>(null);
  const { isPaddleReady, openCheckout } = usePaymentContext();

  useEffect(() => {
    if (!isPaddleReady) {
      return;
    }

    // Initialize Paddle checkout with recruiter pricing
    // TODO: Replace with actual price ID for recruiter subscription
    openCheckout({
      priceId: 'your-recruiter-price-id',
    });
  }, [isPaddleReady, openCheckout]);

  const handleBack = () => {
    router.back();
  };

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
              <HeaderLogo isRecruiter />
            </div>
            <div className="flex flex-col gap-6">
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
              >
                Subscription to daily.dev Recruiter
              </Typography>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Typography type={TypographyType.LargeTitle} bold>
                    $149.00
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
                      $149.00 per unit
                    </Typography>
                  </div>
                </FlexCol>
              </div>
              <div className="mt-4 flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-6">
                <div className="flex items-center justify-between">
                  <Typography
                    type={TypographyType.Body}
                    color={TypographyColor.Secondary}
                  >
                    Subtotal
                  </Typography>
                  <Typography type={TypographyType.Body} bold>
                    $149.00
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
                    $149.00
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col bg-white p-10 px-20">
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
  return <PaymentContextProvider>{page}</PaymentContextProvider>;
};

export default RecruiterPaymentPage;
