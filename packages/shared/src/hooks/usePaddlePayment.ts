import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CheckoutCustomer,
  CheckoutLineItem,
  Environments,
  Paddle,
  PaddleEventData,
} from '@paddle/paddle-js';
import { CheckoutEventNames, initializePaddle } from '@paddle/paddle-js';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent, purchaseTypeToTargetType } from '../lib/log';
import { plusSuccessUrl } from '../lib/constants';
import { checkIsExtension } from '../lib/func';
import type {
  OpenCheckoutProps,
  PaymentContextProviderProps,
} from '../contexts/payment/context';
import { PlusPlanType, PurchaseType } from '../graphql/paddle';

const checkoutContainerSelector = '.checkout-container';
const checkoutIframeSelector = 'iframe';
const missingCheckoutIframeError = 'contentWindow';

const getCheckoutContainers = (): HTMLElement[] => {
  if (typeof document === 'undefined') {
    return [];
  }

  return Array.from(
    document.querySelectorAll<HTMLElement>(checkoutContainerSelector),
  ).filter((element) => element.isConnected);
};

const hasMountedCheckoutContainer = (): boolean =>
  getCheckoutContainers().length > 0;

const hasMountedCheckoutIframe = (): boolean =>
  getCheckoutContainers().some((element) =>
    element.querySelector(checkoutIframeSelector),
  );

const isMissingCheckoutIframeError = (error: unknown): boolean =>
  error instanceof TypeError &&
  error.message.includes(missingCheckoutIframeError);

interface UsePaddlePaymentProps
  extends Pick<
    PaymentContextProviderProps<PaddleEventData, CheckoutEventNames>,
    'successCallback' | 'disabledEvents'
  > {
  priceType: PurchaseType;
  getProductQuantity?: (event: PaddleEventData) => number;
}

export const usePaddlePayment = ({
  successCallback,
  disabledEvents,
  priceType,
  getProductQuantity,
}: UsePaddlePaymentProps) => {
  const targetType = purchaseTypeToTargetType[priceType];
  const router = useRouter();
  const { logEvent } = useLogContext();
  const { user, geo, trackingId } = useAuthContext();
  const [paddle, setPaddle] = useState<Paddle>();
  const isCheckoutOpenRef = useRef(false);
  const scheduledOpenFrameRef = useRef<number>();
  const [checkoutItemsLoading, setCheckoutItemsLoading] = useState(false);
  const [appliedDiscountId, setAppliedDiscountId] = useState<string | null>(
    null,
  );
  const logRef = useRef(logEvent);
  logRef.current = logEvent;
  const successCallbackRef = useRef(successCallback);
  successCallbackRef.current = successCallback;
  const getProductQuantityRef = useRef(getProductQuantity);
  getProductQuantityRef.current = getProductQuantity;
  const discountIdQuery = router.query?.d_id as string | undefined;

  const isOrganization = priceType === PurchaseType.Organization;
  const isPlusPlan = priceType === PurchaseType.Plus || isOrganization;

  useEffect(() => {
    if (checkIsExtension()) {
      // Payment not available on extension
      return;
    }

    isCheckoutOpenRef.current = false;

    initializePaddle({
      environment:
        (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as Environments) ||
        'production',
      token: process.env.NEXT_PUBLIC_PADDLE_TOKEN as string,
      eventCallback: (event: PaddleEventData) => {
        if (disabledEvents?.includes(event?.name as CheckoutEventNames)) {
          if (event?.name === CheckoutEventNames.CHECKOUT_LOADED) {
            isCheckoutOpenRef.current = true;
          }

          return;
        }

        const customData =
          event?.data?.custom_data || ({} as Record<string, unknown>);

        const plusPlanExtra = isPlusPlan
          ? {
              plan_type: isOrganization
                ? PlusPlanType.Organization
                : PlusPlanType.Personal,
              team_size: event?.data?.items?.[0]?.quantity,
            }
          : undefined;

        switch (event?.name) {
          case CheckoutEventNames.CHECKOUT_PAYMENT_INITIATED:
            logRef.current({
              target_type: targetType,
              event_name: LogEvent.InitiatePayment,
              target_id: event?.data?.payment.method_details.type,
              extra: JSON.stringify({
                ...plusPlanExtra,
              }),
            });
            break;
          case CheckoutEventNames.CHECKOUT_LOADED:
            isCheckoutOpenRef.current = true;
            logRef.current({
              target_type: targetType,
              event_name: LogEvent.InitiateCheckout,
              target_id: event?.data?.payment.method_details.type,
              extra: JSON.stringify({
                ...plusPlanExtra,
              }),
            });
            break;
          case CheckoutEventNames.CHECKOUT_PAYMENT_SELECTED:
            logRef.current({
              target_type: targetType,
              event_name: LogEvent.SelectCheckoutPayment,
              target_id: event?.data?.payment.method_details.type,
              extra: JSON.stringify({
                ...plusPlanExtra,
              }),
            });
            break;
          case CheckoutEventNames.CHECKOUT_COMPLETED:
            isCheckoutOpenRef.current = false;
            logRef.current({
              target_type: targetType,
              event_name: LogEvent.CompleteCheckout,
              extra: JSON.stringify({
                user_id:
                  'gifter_id' in customData && 'user_id' in customData
                    ? customData.user_id
                    : undefined,
                quantity: getProductQuantityRef.current?.(event),
                localCost: event?.data?.totals.total,
                localCurrency: event?.data?.currency_code,
                payment: event?.data?.payment.method_details.type,
                cycle:
                  event?.data?.items?.[0]?.billing_cycle?.interval ?? 'one-off',
                ...plusPlanExtra,
              }),
            });

            if (successCallbackRef.current) {
              successCallbackRef.current(event);
            } else {
              router.push(plusSuccessUrl);
            }
            break;
          // This doesn't exist in the original code
          case 'checkout.warning' as CheckoutEventNames:
            logRef.current({
              target_type: targetType,
              event_name: LogEvent.WarningCheckout,
              extra: JSON.stringify({
                transaction_id: event?.data?.transaction_id,
              }),
            });
            break;
          case CheckoutEventNames.CHECKOUT_ERROR:
            logRef.current({
              target_type: targetType,
              event_name: LogEvent.ErrorCheckout,
              extra: JSON.stringify({
                transaction_id: event?.data?.transaction_id,
              }),
            });
            break;
          case CheckoutEventNames.CHECKOUT_PAYMENT_FAILED:
            logRef.current({
              target_type: targetType,
              event_name: LogEvent.ErrorPayment,
              extra: JSON.stringify({
                transaction_id: event?.data?.transaction_id,
              }),
            });
            break;
          case CheckoutEventNames.CHECKOUT_CLOSED:
            isCheckoutOpenRef.current = false;
            break;
          case CheckoutEventNames.CHECKOUT_ITEMS_UPDATED:
            setCheckoutItemsLoading(false);
            break;
          case CheckoutEventNames.CHECKOUT_DISCOUNT_APPLIED:
            setAppliedDiscountId(event?.data?.discount?.id ?? null);
            break;
          case CheckoutEventNames.CHECKOUT_DISCOUNT_REMOVED:
            setAppliedDiscountId(null);
            break;
          default:
            break;
        }
      },
      checkout: {
        settings: {
          displayMode: 'inline',
          frameTarget: 'checkout-container',
          frameInitialHeight: 500,
          frameStyle:
            'width: 100%; background-color: transparent; border: none;',
          theme: 'dark',
          variant: 'one-page',
        },
      },
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
  }, [router, disabledEvents, targetType, isOrganization, isPlusPlan]);

  useEffect(
    () => () => {
      if (typeof window === 'undefined' || !scheduledOpenFrameRef.current) {
        return;
      }

      window.cancelAnimationFrame(scheduledOpenFrameRef.current);
    },
    [],
  );

  const openCheckout = useCallback(
    <TCustomData>({
      priceId,
      giftToUserId,
      discountId,
      quantity = 1,
      customData: customDataProp,
    }: OpenCheckoutProps<TCustomData>) => {
      const items: CheckoutLineItem[] = [{ priceId, quantity }];
      const customer: CheckoutCustomer = {
        ...(user?.email
          ? {
              email: user?.email,
            }
          : {
              id: 'anonymous',
            }),
        ...(geo?.region && {
          address: { countryCode: geo?.region },
        }),
      };

      const recruiterId =
        customDataProp &&
        typeof customDataProp === 'object' &&
        'recruiter_id' in customDataProp
          ? (customDataProp.recruiter_id as string)
          : undefined;

      const customData = {
        ...customDataProp,
        user_id: giftToUserId ?? recruiterId ?? user?.id,
        tracking_id: trackingId,
        ...(!!giftToUserId && { gifter_id: user?.id }),
      };

      const checkoutOptions = {
        items,
        customer,
        customData,
        discountId: discountIdQuery || discountId,
      };

      const openInlineCheckout = () => {
        if (!paddle?.Checkout) {
          return;
        }

        const open = () => {
          if (!hasMountedCheckoutContainer()) {
            return;
          }

          isCheckoutOpenRef.current = false;
          setCheckoutItemsLoading(false);
          paddle.Checkout.open(checkoutOptions);
        };

        if (hasMountedCheckoutContainer()) {
          open();
          return;
        }

        if (typeof window === 'undefined') {
          return;
        }

        if (scheduledOpenFrameRef.current) {
          window.cancelAnimationFrame(scheduledOpenFrameRef.current);
        }

        scheduledOpenFrameRef.current = window.requestAnimationFrame(() => {
          scheduledOpenFrameRef.current = undefined;
          open();
        });
      };

      if (isCheckoutOpenRef.current && hasMountedCheckoutIframe()) {
        setCheckoutItemsLoading(true);
        try {
          paddle?.Checkout.updateItems(items);
        } catch (error) {
          setCheckoutItemsLoading(false);

          if (isMissingCheckoutIframeError(error)) {
            openInlineCheckout();
            return;
          }

          throw error;
        }
        return;
      }

      openInlineCheckout();
    },
    [
      paddle?.Checkout,
      user?.email,
      user?.id,
      geo?.region,
      trackingId,
      discountIdQuery,
    ],
  );

  return {
    paddle,
    openCheckout,
    isPaddleReady: !!paddle,
    checkoutItemsLoading,
    appliedDiscountId,
  };
};
