import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { LogoWithPlus } from '@dailydotdev/shared/src/components/Logo';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import type { Browser } from './PaddleFrameMock';
import { PaddleFrameMock } from './PaddleFrameMock';
import type { CheckoutState } from './model';
import { AlreadyPlusPanel, AppStorePanel, SignInPanel, UnavailablePanel } from './panels';
import {
  BackButton,
  Bill,
  BillSkeleton,
  CycleChoice,
  FeatureList,
  GiftRecipient,
  OrderSummary,
  OtherPurchases,
  PanelHeader,
  PriceBlock,
  RefundNote,
  SaleStrip,
  SeatStepper,
  cycleSub,
  entryCopy,
  priceFor,
} from './parts';

/* The kept design, responsive. Breakpoints are the app's own Tailwind screens:
   mobileL 420 · tablet 656 · laptop 1020 · laptopL 1360 · desktop 1976.

   ≥ laptop   one page, two halves (plan | payment), each full height. Content
              hugs the centre line, so wide screens read like 1280.
   < laptop   TWO STEPS on one address (Tsahi, 16 Oct — the common pattern:
              Spotify, YouTube, NYT, Netflix and Stripe-hosted SaaS all separate
              the plan page from payment, and today's two-page phone flow
              converts). Step 1 = the plan, sticky “Continue · $X”. Step 2 =
              Back, a collapsed order summary (Stripe Checkout's mobile pattern)
              with “Change”, then Paddle. The phone's Back returns to step 1
              with the choice kept. Only when there's something to pay on the
              web; the iOS app, already-Plus and unavailable stay one column. */

const settings = {
  themeMode: 'dark',
  loadedSettings: true,
  applyThemeMode: () => undefined,
};

const LAPTOP = '(min-width: 1020px)';

/** Production: useViewSize(ViewSize.Laptop). */
const useIsLaptop = (): boolean => {
  const [isLaptop, setIsLaptop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(LAPTOP).matches,
  );
  useEffect(() => {
    const query = window.matchMedia(LAPTOP);
    const update = () => setIsLaptop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return isLaptop;
};

/** Optional extension points for exploration stories (8. Showcase variants).
    Unset, the page is exactly the approved design. */
export type CheckoutSlots = {
  /** Replaces the feature checklist. */
  features?: (state: CheckoutState) => ReactNode;
  /** After the payment half's content. */
  paymentExtra?: (state: CheckoutState) => ReactNode;
  /** A full-width section under the split. */
  belowFold?: (state: CheckoutState) => ReactNode;
};

export type CheckoutPageProps = {
  slots?: CheckoutSlots;
  state: CheckoutState;
  onChange?: (patch: Partial<CheckoutState>) => void;
  onPay?: () => void;
  browser?: Browser;
  className?: string;
};

const headlineFor = (state: CheckoutState): string => {
  if (state.purchase === 'gift') {
    return 'Give a year of daily.dev Plus.';
  }
  if (state.purchase === 'team') {
    return 'daily.dev Plus for your team.';
  }
  return entryCopy[state.entry].headline;
};

export const CheckoutPage = ({
  state,
  onChange,
  onPay,
  browser = 'chrome',
  className,
  slots,
}: CheckoutPageProps): ReactElement => {
  const payRef = useRef<HTMLDivElement>(null);
  const isLaptop = useIsLaptop();
  const canBuy = state.viewer === 'member';
  const signedOut = state.viewer === 'anonymous';
  // Nothing that changes the price may move while Paddle is charging.
  const locked = state.phase === 'processing' || state.phase === 'authenticating';
  const twoStep = !isLaptop && (canBuy || signedOut) && state.platform === 'web';
  const [step, setStep] = useState<'plan' | 'payment'>(state.mobileStep ?? 'plan');

  useEffect(() => setStep(state.mobileStep ?? 'plan'), [state.mobileStep]);

  // The phone's Back button walks the steps. Production: router.push with a
  // shallow ?step=payment (cycle, type, gift and seats stay in the URL).
  useEffect(() => {
    const onPop = () => setStep(window.location.hash === '#payment' ? 'payment' : 'plan');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const goToPayment = () => {
    window.history.pushState({ plusStep: 'payment' }, '', '#payment');
    setStep('payment');
    window.scrollTo({ top: 0 });
    // Land keyboard and screen-reader users on the new step.
    requestAnimationFrame(() => payRef.current?.focus({ preventScroll: true }));
  };
  const backToPlan = () => {
    if (window.history.state?.plusStep === 'payment') {
      window.history.back();
    } else {
      setStep('plan');
    }
    window.scrollTo({ top: 0 });
  };
  const showPlan = !twoStep || step === 'plan';
  const showPayment = !twoStep || step === 'payment';

  const p = priceFor(state);
  const lead = entryCopy[state.entry].lead;

  let right: ReactNode;
  if (state.viewer === 'anonymous') {
    right = <SignInPanel today={p.today} />;
  } else if (state.viewer === 'plus') {
    right = <AlreadyPlusPanel gifted={state.giftedPlus} />;
  } else if (state.viewer === 'unavailable') {
    right = <UnavailablePanel />;
  } else if (state.platform === 'ios') {
    right = <AppStorePanel today={p.today} cycle={state.cycle} onPay={onPay} />;
  } else {
    right = (
      <>
        <PanelHeader />
        <PaddleFrameMock
          method={state.method}
          onMethod={(method) => onChange?.({ method })}
          // No price yet → Paddle can't open; the frame waits with the page.
          phase={state.pricesLoading ? 'loading' : state.phase}
          browser={browser}
          express={state.express}
          today={p.today}
          then={
            state.purchase === 'gift'
              ? 'no renewal'
              : `${state.purchase === 'team' ? p.today : state.cycle === 'annual' ? '$89.99' : '$9.99'}/${state.cycle === 'annual' ? 'year from 8 Oct 2027' : 'month from 8 Nov 2026'}`
          }
          vatField={state.purchase === 'team'}
          zipField={/^(US|CA)/.test(state.country)}
          onRetry={() => onChange?.({ phase: 'ready' })}
          discountField={false}
          onPay={onPay}
        />
        <RefundNote />
      </>
    );
  }

  // The sticky bar: phones and tablets, step 1 only. Two steps → “Continue” to
  // step 2; the iOS app → “Subscribe” opens Apple's sheet (that is its step 2).
  const showBar =
    !isLaptop && showPlan && (canBuy || signedOut) && !state.pricesLoading && state.phase !== 'success';

  return (
    <SettingsContext.Provider value={settings as never}>
      <div className={classNames('relative flex min-h-full w-full flex-col bg-background-default text-text-primary laptop:grid laptop:min-h-screen laptop:grid-cols-2', className)}>
        {/* Plan half (step 1 on phones) */}
        <section
          aria-label="Your plan"
          className={classNames(
            'flex min-w-0 flex-col px-4 pt-4 tablet:px-10 tablet:pt-8 laptop:px-12 laptop:py-10 laptopL:px-14',
            showBar ? 'pb-28' : 'pb-6',
            // The hidden attribute loses to .flex; the utility wins (it comes later).
            !showPlan && 'hidden',
          )}
          style={{ background: 'radial-gradient(700px 500px at 0% 0%, rgba(113,71,237,.22), transparent 60%)' }}
        >
          <div className="mx-auto flex w-full min-w-0 max-w-[36rem] flex-col gap-6 laptop:ml-auto laptop:mr-0 laptop:max-w-[34rem]">
            <div className="flex items-center gap-2">
              <BackButton />
              <LogoWithPlus />
            </div>
            {state.sale && state.purchase === 'personal' && state.platform === 'web' && <SaleStrip />}
            <div className="flex flex-col gap-1.5 laptop:mt-2">
              <h1 className="text-balance font-bold typo-title3">{headlineFor(state)}</h1>
              {state.viewer !== 'unavailable' && <PriceBlock state={state} />}
            </div>
            {state.purchase === 'gift' && state.giftTo && <GiftRecipient {...state.giftTo} />}
            {state.purchase !== 'gift' && state.viewer !== 'unavailable' && (
              <CycleChoice
                cycle={state.cycle}
                subs={state.pricesLoading ? { annual: '', monthly: '' } : { annual: cycleSub(state, 'annual'), monthly: cycleSub(state, 'monthly') }}
                onChange={(cycle) => onChange?.({ cycle })}
                disabled={locked}
              />
            )}
            {state.purchase === 'team' && <SeatStepper seats={state.seats} onSeats={(seats) => onChange?.({ seats })} disabled={locked} />}
            {slots?.features ? slots.features(state) : <FeatureList lead={lead} />}
            {canBuy && (state.pricesLoading ? <BillSkeleton /> : <Bill state={state} />)}
            {state.platform === 'web' && state.viewer !== 'unavailable' && (
              <OtherPurchases purchase={state.purchase} onPurchase={(purchase) => onChange?.({ purchase })} disabled={locked} />
            )}
          </div>
        </section>

        {/* Payment half (step 2 on phones) */}
        <section
          ref={payRef}
          aria-label="Payment"
          tabIndex={-1}
          className={classNames(
            !showPayment && 'hidden',
            'flex min-w-0 flex-col px-4 outline-none tablet:px-10 laptop:border-l laptop:border-t-0 laptop:px-12 laptop:pb-10 laptop:pt-10 laptopL:px-16',
            // Step 2 is its own screen; one column (iOS) still has the bar over it.
            twoStep ? 'pb-10 pt-4 tablet:pt-8' : 'border-t border-border-subtlest-tertiary pb-28 pt-6',
          )}
        >
          <div className="mx-auto flex w-full min-w-0 max-w-[36rem] flex-col gap-4 laptop:ml-0 laptop:mr-auto laptop:max-w-[32rem]">
            {twoStep && (
              <>
                <div className="flex items-center gap-2">
                  <BackButton onClick={backToPlan} />
                  <LogoWithPlus />
                </div>
                <OrderSummary state={state} onEdit={backToPlan} />
              </>
            )}
            {right}
            {slots?.paymentExtra?.(state)}
          </div>
        </section>

        {slots?.belowFold && showPlan && <div className="min-w-0 laptop:col-span-2">{slots.belowFold(state)}</div>}

        {showBar && (
          <div
            className="fixed inset-x-0 bottom-0 z-1 flex items-center justify-between gap-3 border-t border-border-subtlest-tertiary bg-background-default px-4 py-3"
            // Clear the iPhone home indicator.
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          >
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <b className="tabular-nums typo-callout">{p.today} today</b>
              <span className="typo-caption1 text-text-tertiary">
                {state.purchase === 'gift'
                  ? 'One year, paid once'
                  : `${state.cycle === 'annual' ? 'Annual' : 'Monthly'} · ${state.platform === 'ios' ? 'billed by Apple' : '30-day refund'}`}
              </span>
            </span>
            <button
              type="button"
              disabled={locked}
              onClick={twoStep ? goToPayment : onPay}
              className="h-11 rounded-12 bg-[#fff] px-5 font-bold typo-callout text-[#0F1218]"
            >
              {twoStep ? 'Continue' : 'Subscribe'}
            </button>
          </div>
        )}
      </div>
    </SettingsContext.Provider>
  );
};
