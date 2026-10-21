import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { LogoWithPlus } from '../../Logo';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { usePaymentContext } from '../../../contexts/payment/context';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { usePlusSale } from '../../../hooks/usePlusSale';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { AuthTriggers } from '../../../lib/auth';
import { LogEvent, TargetId } from '../../../lib/log';
import { PlusPlanType, PurchaseType } from '../../../graphql/paddle';
import { webappUrl } from '../../../lib/constants';
import { useGiftUserContext } from '../GiftUserContext';
import { PlusPlus } from '../PlusPlus';
import { PlusUnavailable } from '../PlusUnavailable';
import { PlusCheckoutFeatures } from './PlusCheckoutFeatures';
import type { BillPoint, CycleOption } from './PlusCheckoutParts';
import {
  PlusBackButton,
  PlusBill,
  PlusCycleChoice,
  PlusGiftRecipient,
  PlusOrderSummary,
  PlusOtherPurchases,
  PlusPanelHeader,
  PlusPriceBlock,
  PlusRefundNote,
  PlusSeatStepper,
  PlusSignInPanel,
} from './PlusCheckoutParts';
import type { Cycle, Purchase } from './checkoutData';
import {
  findCycle,
  formatDate,
  formatMoney,
  getEntry,
  getsRenewalReminder,
  monthsFree,
  reminderDate,
  renewalDate,
} from './checkoutData';
import { isPreviewHost } from './usePlusCheckoutV2';

/* The redesigned /plus checkout (flag plus_checkout_v2).

   ≥ laptop  one page, two halves: the plan (left) and Paddle's frame (right).
   < laptop  the same content as two steps on one URL, the common pattern
             (Spotify, YouTube, NYT, Stripe-hosted checkouts): step 1 is the
             plan with a sticky “Continue”, step 2 a collapsed order summary
             above Paddle. ?step=payment is pushed with history.pushState so
             the phone's Back button returns to step 1 with everything kept;
             Paddle stays mounted (hidden on step 1) so step 2 opens loaded. */

const PADDLE_LOAD_TIMEOUT_MS = 10_000;

const problemCopy = (problem: 'blocked' | 'refused'): string => {
  if (problem === 'blocked') {
    return 'An ad or privacy blocker can stop our payment partner, Paddle. Allow paddle.com for this page, then try again. Nothing was charged.';
  }
  if (
    typeof window !== 'undefined' &&
    isPreviewHost(window.location.hostname)
  ) {
    return 'Paddle only opens checkouts on app.daily.dev, so PR previews can’t take payments. Nothing was charged.';
  }
  return 'Nothing was charged. Try again in a moment, or contact support if it keeps happening.';
};

const readStep = (): 'plan' | 'payment' =>
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('step') === 'payment'
    ? 'payment'
    : 'plan';

const getPurchase = (isGift: boolean, isTeam: boolean): Purchase => {
  if (isGift) {
    return 'gift';
  }
  return isTeam ? 'team' : 'personal';
};

type Viewer = 'unavailable' | 'anonymous' | 'plus' | 'member';

const getViewer = ({
  isAvailable,
  isSignedIn,
  isPlusForSelf,
}: {
  isAvailable: boolean;
  isSignedIn: boolean;
  isPlusForSelf: boolean;
}): Viewer => {
  if (!isAvailable) {
    return 'unavailable';
  }
  if (!isSignedIn) {
    return 'anonymous';
  }
  return isPlusForSelf ? 'plus' : 'member';
};

const headlineFor = (purchase: Purchase, entryHeadline: string): string => {
  if (purchase === 'gift') {
    return 'Give a year of daily.dev Plus.';
  }
  if (purchase === 'team') {
    return 'daily.dev Plus for your team.';
  }
  return entryHeadline;
};

export const PlusCheckoutV2 = (): ReactElement => {
  const router = useRouter();
  const { user, geo, showLogin } = useAuthContext();
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const { giftToUser } = useGiftUserContext();
  const {
    openCheckout,
    isPaddleReady,
    productOptions,
    giftOneYear,
    isPlusAvailable,
    isOrganization,
    setPriceType,
    checkoutPhase,
  } = usePaymentContext();
  const sale = usePlusSale();
  const { openModal } = useLazyModal();

  const entry = getEntry(router.query.ref);
  const purchase = getPurchase(!!giftToUser, !!isOrganization);
  const [cycle, setCycle] = useState<Cycle>(
    router.query.cycle === 'monthly' ? 'monthly' : 'annual',
  );
  const [seats, setSeats] = useState(1);
  const [step, setStep] = useState<'plan' | 'payment'>(readStep);
  const pushedStep = useRef(false);
  const paymentRef = useRef<HTMLElement>(null);

  // ?type=team opens the team checkout (Settings › Organization links here).
  // Today PlusProductToggle reads it; this page has no toggle.
  const teamQuery = router.query.type === 'team';
  useEffect(() => {
    if (teamQuery && !giftToUser) {
      setPriceType?.(PurchaseType.Organization);
    }
  }, [teamQuery, giftToUser, setPriceType]);

  // --- prices, all from the live Paddle preview -----------------------------
  const annual = findCycle(productOptions, 'annual');
  const monthly = findCycle(productOptions, 'monthly');
  const cycleOption = cycle === 'annual' ? annual : monthly;
  const selected = purchase === 'gift' ? giftOneYear : cycleOption;
  const currency = selected?.currency.code ?? annual?.currency.code ?? 'USD';
  const quantity = purchase === 'team' ? seats : 1;
  const today = selected
    ? formatMoney(selected.price.amount * quantity, currency)
    : undefined;
  const freeMonths = monthsFree(annual, monthly);
  const showSale = sale.isActive && purchase === 'personal';

  const big =
    purchase === 'gift'
      ? giftOneYear?.price.formatted
      : (cycle === 'annual'
          ? annual?.price.monthly?.formatted
          : monthly?.price.formatted) ?? undefined;
  const unit =
    purchase === 'gift'
      ? 'one year of Plus, paid once'
      : `per ${purchase === 'team' ? 'member per ' : ''}month, billed ${
          cycle === 'annual' ? 'yearly' : 'monthly'
        }`;
  const struck =
    purchase !== 'gift' && cycle === 'annual'
      ? monthly?.price.formatted
      : undefined;

  const cycleOptions: Record<Cycle, CycleOption> = {
    annual: {
      title: 'Annual',
      badge:
        freeMonths > 0
          ? `${freeMonths} months free`
          : annual?.metadata.caption?.copy,
      sub: annual
        ? `${annual.price.monthly?.formatted ?? annual.price.formatted}/mo${
            purchase === 'team' ? ' per member' : ''
          } · ${formatMoney(
            annual.price.amount * quantity,
            currency,
          )} billed yearly`
        : undefined,
    },
    monthly: {
      title: 'Monthly',
      sub: monthly
        ? `${monthly.price.formatted}/mo${
            purchase === 'team' ? ' per member' : ''
          } · billed monthly`
        : undefined,
    },
  };

  // --- who is looking --------------------------------------------------------
  const viewer = getViewer({
    isAvailable: isPlusAvailable,
    isSignedIn: !!user,
    isPlusForSelf: !!isPlus && purchase === 'personal',
  });
  const canBuy = viewer === 'member';
  const twoStep = canBuy || viewer === 'anonymous';

  // --- the bill --------------------------------------------------------------
  const renewal = renewalDate(cycle);
  const points: BillPoint[] =
    purchase === 'gift'
      ? [
          ['Today', `${today ?? ''} charged, once`],
          [
            'Today',
            `${
              giftToUser?.name ?? 'They'
            } get Plus, and a pop-up from you next visit`,
          ],
          [
            formatDate(renewalDate('annual')),
            'Plus ends. No renewal, nothing to cancel',
          ],
        ]
      : [
          ['Today', `${today ?? ''} charged`],
          ...(getsRenewalReminder({ cycle, purchase, region: geo?.region })
            ? [
                [
                  `By ${formatDate(reminderDate(renewal))}`,
                  'Reminder email before it renews',
                ] as BillPoint,
              ]
            : []),
          [
            formatDate(renewal),
            showSale && cycle === 'annual'
              ? 'Renews at the regular price, or cancel'
              : `Renews at ${today ?? ''}, or cancel`,
          ],
        ];

  // --- Paddle ----------------------------------------------------------------
  const opened = useRef<string>();
  const [attempt, setAttempt] = useState(0);
  const [problem, setProblem] = useState<'blocked' | 'refused'>();
  // Paddle reported this open as loaded; after that, failures are its own to show.
  const loaded = useRef(false);
  const checkoutKey = selected
    ? `${selected.priceId}:${quantity}:${attempt}`
    : undefined;

  useEffect(() => {
    if (!canBuy || !isPaddleReady || !selected || !checkoutKey) {
      return;
    }
    if (opened.current === checkoutKey) {
      return;
    }
    opened.current = checkoutKey;
    openCheckout?.({
      priceId: selected.priceId,
      quantity,
      giftToUserId: giftToUser?.id,
      settings: {
        allowLogout: false,
        showAddTaxId: purchase === 'team',
        showAddDiscounts: false,
      },
    });
  }, [
    canBuy,
    isPaddleReady,
    selected,
    checkoutKey,
    openCheckout,
    quantity,
    giftToUser?.id,
    purchase,
  ]);

  // No checkout.loaded after 10s: usually an ad/privacy blocker stopping paddle.js.
  // checkout.error before it loaded: Paddle refused to start (e.g. a domain it
  // hasn't approved). A decline after it loaded is shown inside Paddle's frame.
  useEffect(() => {
    if (checkoutPhase === 'ready' || checkoutPhase === 'processing') {
      loaded.current = true;
      setProblem(undefined);
      return undefined;
    }
    if (!canBuy || loaded.current) {
      setProblem(undefined);
      return undefined;
    }
    if (checkoutPhase === 'declined') {
      setProblem('refused');
      return undefined;
    }
    const id = window.setTimeout(
      () => setProblem('blocked'),
      PADDLE_LOAD_TIMEOUT_MS,
    );
    return () => window.clearTimeout(id);
  }, [canBuy, checkoutPhase, attempt]);

  const locked = checkoutPhase === 'processing';

  // --- steps (phones and tablets) --------------------------------------------
  useEffect(() => {
    const onPop = () => setStep(readStep());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const goToPayment = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('step', 'payment');
    // Our own entry: Next's router ignores popstate entries it didn't create.
    window.history.pushState(
      { plusStep: 'payment' },
      '',
      `${window.location.pathname}?${params}`,
    );
    pushedStep.current = true;
    setStep('payment');
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() =>
      paymentRef.current?.focus({ preventScroll: true }),
    );
  }, []);

  const backToPlan = useCallback(() => {
    if (pushedStep.current) {
      pushedStep.current = false;
      window.history.back();
    } else {
      const params = new URLSearchParams(window.location.search);
      params.delete('step');
      const query = params.toString();
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${query ? `?${query}` : ''}`,
      );
      setStep('plan');
    }
    window.scrollTo({ top: 0 });
  }, []);

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(webappUrl);
    }
  };

  // --- purchase switches -----------------------------------------------------
  const switchType = (type: PurchaseType) => {
    setPriceType?.(type);
    const { gift, ...query } = router.query;
    router.replace(
      {
        pathname: '/plus',
        query: {
          ...query,
          type: type === PurchaseType.Organization ? 'team' : 'personal',
        },
      },
      undefined,
      { shallow: !gift },
    );
    logSubscriptionEvent({
      event_name: LogEvent.SelectSubscriptionType,
      target_id: type === PurchaseType.Organization ? 'team' : 'personal',
    });
  };

  const openGift = () => {
    logSubscriptionEvent({
      event_name: LogEvent.GiftSubscription,
      target_id: TargetId.PlusPage,
    });
    openModal({ type: LazyModal.GiftPlus });
  };

  const onCycle = (next: Cycle) => {
    setCycle(next);
    const option = next === 'annual' ? annual : monthly;
    if (option) {
      logSubscriptionEvent({
        event_name: LogEvent.SelectBillingCycle,
        target_id: option.metadata.title.toLowerCase(),
        extra: {
          plan_type: isOrganization
            ? PlusPlanType.Organization
            : PlusPlanType.Personal,
          team_size: isOrganization ? seats : undefined,
          ref: router.query.ref,
        },
      });
    }
  };

  const onSeats = (next: number) => {
    setSeats(next);
    logSubscriptionEvent({
      event_name: LogEvent.SetOrgSize,
      target_id: next.toString(),
      extra: { existing: false },
    });
  };

  // --- payment half ----------------------------------------------------------
  let right: ReactNode;
  if (viewer === 'unavailable') {
    right = (
      <div className="rounded-12 bg-surface-float px-4 py-6">
        <PlusUnavailable />
      </div>
    );
  } else if (viewer === 'anonymous') {
    right = (
      <PlusSignInPanel
        today={today}
        onSignIn={() => showLogin({ trigger: AuthTriggers.Plus })}
      />
    );
  } else if (viewer === 'plus') {
    right = (
      <div className="flex flex-col gap-4">
        <PlusPanelHeader title="You’re on Plus" secure={false} />
        <div className="rounded-12 bg-surface-float px-4 py-6">
          <PlusPlus />
        </div>
      </div>
    );
  } else {
    right = (
      <>
        <PlusPanelHeader />
        {problem && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 typo-footnote"
          >
            <b className="text-text-primary">
              {problem === 'refused'
                ? 'Paddle couldn’t start the checkout.'
                : 'The payment form didn’t load.'}
            </b>
            <span className="text-text-tertiary">{problemCopy(problem)}</span>
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Secondary}
              className="self-start"
              onClick={() => {
                setProblem(undefined);
                loaded.current = false;
                opened.current = undefined;
                setAttempt((value) => value + 1);
              }}
            >
              Try again
            </Button>
          </div>
        )}
        <div className="checkout-container min-h-[28rem]" />
        <PlusRefundNote />
      </>
    );
  }

  const showPlanOnMobile = !twoStep || step === 'plan';
  const showPaymentOnMobile = !twoStep || step === 'payment';
  const otherPurchases = viewer !== 'unavailable' && (
    <PlusOtherPurchases
      showPersonal={purchase !== 'personal'}
      showTeam={purchase !== 'team'}
      showGift={purchase !== 'gift' && !!giftOneYear}
      onPersonal={() =>
        purchase === 'gift'
          ? router.push('/plus')
          : switchType(PurchaseType.Plus)
      }
      onTeam={() => switchType(PurchaseType.Organization)}
      onGift={openGift}
      disabled={locked}
    />
  );

  const summaryTitle = useMemo(() => {
    if (purchase === 'gift') {
      return `A year of Plus for ${giftToUser?.name ?? 'them'}`;
    }
    const plan = cycle === 'annual' ? 'Annual' : 'Monthly';
    return purchase === 'team'
      ? `Plus for ${seats} members · ${plan}`
      : `daily.dev Plus · ${plan}`;
  }, [purchase, giftToUser?.name, cycle, seats]);
  const [lastWhen, lastWhat] = points[points.length - 1];

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-background-default text-text-primary laptop:grid laptop:grid-cols-2">
      {/* The plan (step 1 on phones) */}
      <section
        aria-label="Your plan"
        className={classNames(
          'min-w-0 flex-col px-4 pt-4 tablet:px-10 tablet:pt-8 laptop:flex laptop:px-12 laptop:py-10 laptopL:px-14',
          showPlanOnMobile ? 'flex' : 'hidden',
          twoStep && showPlanOnMobile ? 'pb-28 laptop:pb-10' : 'pb-6',
        )}
        style={{
          background:
            'radial-gradient(43.75rem 31.25rem at 0% 0%, color-mix(in srgb, var(--theme-accent-onion-default) 22%, transparent), transparent 60%)',
        }}
      >
        <div className="mx-auto flex w-full min-w-0 max-w-[36rem] flex-col gap-6 laptop:ml-auto laptop:mr-0 laptop:max-w-[34rem]">
          <div className="flex items-center gap-2">
            <PlusBackButton onClick={goBack} />
            <LogoWithPlus />
          </div>
          {showSale && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-12 border border-accent-cheese-default bg-overlay-float-cheese px-4 py-2 text-text-primary typo-footnote">
              <span className="min-w-0 flex-1">
                <b>{sale.headline || sale.label}</b> Applied, nothing to type.
              </span>
              {sale.code && (
                <span className="rounded-6 border border-dashed border-accent-cheese-default px-2 py-0.5 font-mono typo-caption1">
                  {sale.code}
                </span>
              )}
            </div>
          )}
          <div className="flex flex-col gap-1.5 laptop:mt-2">
            <h1 className="text-balance font-bold typo-title3">
              {headlineFor(purchase, entry.headline)}
            </h1>
            {viewer !== 'unavailable' && (
              <PlusPriceBlock big={big} unit={unit} struck={struck} />
            )}
          </div>
          {purchase === 'gift' && giftToUser && (
            <PlusGiftRecipient
              name={giftToUser.name}
              username={giftToUser.username}
              onChange={openGift}
            />
          )}
          {purchase !== 'gift' && viewer !== 'unavailable' && (
            <PlusCycleChoice
              cycle={cycle}
              options={cycleOptions}
              onChange={onCycle}
              disabled={locked}
            />
          )}
          {purchase === 'team' && (
            <PlusSeatStepper
              seats={seats}
              onSeats={onSeats}
              disabled={locked}
            />
          )}
          <PlusCheckoutFeatures lead={entry.lead} />
          {canBuy && <PlusBill today={today} points={points} />}
          {otherPurchases}
        </div>
      </section>

      {/* Payment (step 2 on phones) */}
      <section
        ref={paymentRef}
        aria-label="Payment"
        tabIndex={-1}
        className={classNames(
          'min-w-0 flex-col px-4 outline-none tablet:px-10 laptop:flex laptop:border-l laptop:border-t-0 laptop:border-border-subtlest-tertiary laptop:px-12 laptop:pb-10 laptop:pt-10 laptopL:px-16',
          showPaymentOnMobile ? 'flex' : 'hidden',
          twoStep
            ? 'pb-10 pt-4 tablet:pt-8'
            : 'border-t border-border-subtlest-tertiary pb-10 pt-6',
        )}
      >
        <div className="mx-auto flex w-full min-w-0 max-w-[36rem] flex-col gap-4 laptop:ml-0 laptop:mr-auto laptop:max-w-[32rem]">
          {twoStep && (
            <div className="flex flex-col gap-4 laptop:hidden">
              <div className="flex items-center gap-2">
                <PlusBackButton onClick={backToPlan} />
                <LogoWithPlus />
              </div>
              <PlusOrderSummary
                title={summaryTitle}
                renewal={
                  purchase === 'gift'
                    ? 'Paid once · no renewal'
                    : `${lastWhen} · ${lastWhat}`
                }
                today={today}
                onEdit={backToPlan}
              >
                <PlusBill today={today} points={points} />
              </PlusOrderSummary>
            </div>
          )}
          {right}
        </div>
      </section>

      {/* Phones and tablets, step 1: the way to step 2. */}
      {twoStep && step === 'plan' && today && (
        <div
          className="fixed inset-x-0 bottom-0 z-1 flex items-center justify-between gap-3 border-t border-border-subtlest-tertiary bg-background-default px-4 py-3 laptop:hidden"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <b className="tabular-nums typo-callout">{today} today</b>
            <span className="text-text-tertiary typo-caption1">
              {purchase === 'gift'
                ? 'One year, paid once'
                : `${
                    cycle === 'annual' ? 'Annual' : 'Monthly'
                  } · 30-day refund`}
            </span>
          </span>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            disabled={locked}
            onClick={goToPayment}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};
