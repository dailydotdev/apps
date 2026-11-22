import type { FormEvent, MutableRefObject, ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../../../../components/charm/CharmEmptyState';
import {
  CoreIcon,
  MoveToIcon,
  OpenLinkIcon,
  PlusIcon,
  VIcon,
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { Loader } from '../../../../components/Loader';
import { Tooltip } from '../../../../components/tooltip/Tooltip';
import { SquadImage } from '../../../../components/squads/SquadImage';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useSquad } from '../../../../hooks/squads/useSquad';
import { usePaddlePayment } from '../../../../hooks/usePaddlePayment';
import { usePixelsContext } from '../../../../contexts/PixelsContext';
import { formatCurrency } from '../../../../lib/utils';
import { useViewSize, ViewSize } from '../../../../hooks/useViewSize';
import type { Squad } from '../../../../graphql/sources';
import { SourceMemberRole } from '../../../../graphql/sources';
import AuthOptions from '../../../../components/auth/AuthOptions';
import { AuthDisplay, providerMap } from '../../../../components/auth/common';
import { AuthTriggers } from '../../../../lib/auth';
import { cloudinaryCharmSomethingWentWrong } from '../../../../lib/image';
import { PurchaseType } from '../../../../graphql/paddle';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { webappUrl } from '../../../../lib/constants';
import { RequestKey } from '../../../../lib/query';
import { LogEvent, Origin } from '../../../../lib/log';
import {
  getCompanyPageCreateUrl,
  getSquadManageUrl,
  SquadManageSection,
} from '../../lib/routes';
import {
  getSquadPlanPriceId,
  getSquadPlanTitle,
  isSquadPlan,
  formatBoostCredits,
  formatSquadPlanCredits,
  getSquadPlanCreditsForRate,
  SQUAD_PLAN_CASHBACK_PERCENTAGE,
  SQUAD_PLAN_LIST_PRICE_USD,
  SQUAD_PLAN_SEATS,
  SquadPlan,
  squadPlanDetails,
  squadPlanOverFree,
  squadPlans,
  startupsEnterpriseUrl,
} from '../../lib/plans';
import { useSquadPlanPrices } from '../../hooks/useSquadPlanPrices';
import { useStartupsSetupRefresh } from '../../hooks/useStartupsSetupRefresh';
import { useStartupsCashbackPromo } from '../../hooks/useStartupsCashbackPromo';
import { getSavedCheckoutAttribution } from '../../lib/checkoutAttribution';
import { STARTUPS_X_EVENTS } from '../../lib/startupsXEvents';
import {
  SquadLaunchOfferBanner,
  SquadPlanCashback,
} from '../SquadPlanCashback';
import { useLogStartups } from '../../hooks/useLogStartups';
import {
  startupsSetupRowTitles,
  useStartupsSetupProgress,
} from '../setup/StartupsSetup';
import { useCompanyPageReadiness } from '../readiness/useCompanyPageReadiness';
import { SquadPageReadiness } from '../readiness/SquadPageReadiness';
import { isCountedItem } from '../../lib/readiness';
import { PatchyConfetti } from '../../../../components/onboarding/FeedPatchy/PatchyConfetti';
import {
  StartupsPagePreview,
  StartupsStageSurface,
} from '../setup/StartupsPagePreview';
import type { StartupsSetupRow } from '../setup/StartupsSetupEditor';
import { StartupsSetupEditor } from '../setup/StartupsSetupEditor';
import type { CheckoutBack } from './CheckoutShell';
import {
  CheckoutCta,
  CheckoutShell,
  CheckoutSkeleton,
  CheckoutStage,
  CheckoutTitle,
} from './CheckoutShell';
import { StartupsNameStunt } from './StartupsNameStunt';
import { StartupsSignupPanel } from './StartupsSignupPanel';
import {
  getSubscribedHotjarEvent,
  StartupsHotjarEvent,
  trackHotjarEvent,
} from '../../../../lib/hotjar';

export enum StartupsCheckoutStep {
  Account = 'account',
  Company = 'company',
  Plan = 'plan',
  Checkout = 'checkout',
  Done = 'done',
}

// How long the done step waits for the payment webhook before it asks the
// buyer to check back
const ACTIVATION_POLL_MS = 2000;
const ACTIVATION_TIMEOUT_MS = 60000;
// How long the payment form gets to load before it counts as failed
const PADDLE_TIMEOUT_MS = 15000;

type CompanyChoice = Partial<Squad> &
  Pick<Squad, 'name' | 'handle'> & {
    id: string;
  };

const signupProviders = [providerMap.github, providerMap.google];

// Where each screen's back goes
const backLabels: Partial<Record<string, string>> = {
  [AuthDisplay.Default]: 'Other options',
  [AuthDisplay.Registration]: 'Other options',
  [AuthDisplay.EmailVerification]: 'Change email',
  [AuthDisplay.ForgotPassword]: 'Back to log in',
};

/**
 * A visitor from the landing page signs up right here, then the page starts
 * the checkout for them: no feed onboarding in between.
 */
export const AccountStep = ({
  initialDisplay = AuthDisplay.Default,
  initialEmail,
  trigger = AuthTriggers.StartupsCheckout,
  signUpTitle = 'Create your account',
  signUpDescription = "Start with a free company page, then upgrade it when you're ready.",
  logInDescription = 'Log in, then pick the company page to upgrade.',
}: {
  initialDisplay?: AuthDisplay;
  initialEmail?: string;
  trigger?: AuthTriggers;
  signUpTitle?: string;
  signUpDescription?: string;
  logInDescription?: string;
}): ReactElement => {
  const [display, setDisplay] = useState<string>(initialDisplay);
  const [isLogIn, setIsLogIn] = useState(false);
  const [onScreenBack, setOnScreenBack] = useState<() => void>();
  const onScreenBackChange = useCallback(
    (next?: () => void) => setOnScreenBack(() => next),
    [],
  );
  const back: CheckoutBack | undefined = onScreenBack && {
    label: backLabels[display] ?? 'Back',
    onClick: onScreenBack,
  };

  return (
    <CheckoutShell
      current={CheckoutStage.Account}
      aside={<StartupsSignupPanel />}
      isPhoneWall={display === AuthDisplay.Default && !back && !isLogIn}
      phoneBack={back}
    >
      {back && display !== AuthDisplay.EmailVerification && (
        <div
          className="relative hidden w-full laptop:block"
          style={{ height: 0, marginBottom: -24 }}
        >
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            className="absolute whitespace-nowrap"
            style={{ left: -8, bottom: 12 }}
            icon={<MoveToIcon size={IconSize.Size16} className="rotate-180" />}
            onClick={back.onClick}
          >
            {back.label}
          </Button>
        </div>
      )}
      <div className="flex flex-col">
        <AuthOptions
          formRef={null as unknown as MutableRefObject<HTMLFormElement>}
          trigger={trigger}
          simplified
          preferGithub
          defaultDisplay={initialDisplay}
          initialEmail={initialEmail}
          isLoginFlow={false}
          hideRegistrationHeadline
          signUpTitle={signUpTitle}
          logInTitle="Welcome back"
          signUpDescription={signUpDescription}
          logInDescription={logInDescription}
          signupProviders={signupProviders}
          onDisplayChange={setDisplay}
          onScreenBackChange={onScreenBackChange}
          onLogInChange={setIsLogIn}
        />
      </div>
    </CheckoutShell>
  );
};

const CompanyRow = ({
  company,
  isSelected,
  planTitle,
  onClick,
}: {
  company: CompanyChoice;
  isSelected: boolean;
  /** Already paid for. Says so on the row, with the detail on hover. */
  planTitle?: string;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    role="radio"
    aria-checked={isSelected}
    onClick={onClick}
    className={classNames(
      'flex items-center gap-3 rounded-16 border p-3 text-left',
      isSelected
        ? 'border-accent-cabbage-default bg-surface-float'
        : 'border-border-subtlest-tertiary hover:border-border-subtlest-secondary',
    )}
  >
    <SquadImage {...(company as Squad)} className="size-10 shrink-0" />
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-bold typo-callout">{company.name}</span>
      <span className="truncate text-text-tertiary typo-footnote">
        {`@${company.handle}`}
      </span>
    </span>
    {planTitle && (
      <Tooltip
        content={`${company.name} is already on ${planTitle}, so there's nothing to pay for.`}
      >
        <span className="shrink-0 rounded-8 bg-surface-float px-2 py-0.5 font-bold text-text-secondary typo-caption1">
          {`On ${planTitle}`}
        </span>
      </Tooltip>
    )}
  </button>
);

const CompanyStep = ({
  companyPages,
  selectedId,
  plan,
  onSelect,
  onContinue,
  onSetUp,
}: {
  companyPages: CompanyChoice[];
  selectedId?: string | null;
  plan: SquadPlan;
  onSelect: (id: string) => void;
  onContinue: (squad: CompanyChoice) => void;
  /** A page already on a plan goes on to its setup, as after paying */
  onSetUp: (squad: CompanyChoice, plan: SquadPlan) => void;
}): ReactElement => {
  const { user } = useAuthContext();
  const selected = companyPages.find(({ id }) => id === selectedId);
  const { data: subscription, isFetching } = useQuery(
    squadSubscriptionQueryOptions({ user, sourceId: selected?.id }),
  );
  const activePlan = selected && subscription?.plan;

  // Pages are created free on their own form, so checkout only upgrades one
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selected && !isFetching) {
      onContinue(selected);
    }
  };

  return (
    <CheckoutShell
      current={CheckoutStage.Company}
      isTall={companyPages.length > 3}
      aside={<StartupsNameStunt name={selected?.name ?? ''} />}
    >
      <CheckoutTitle
        title="Which page are you upgrading?"
        description="Your page, posts and followers stay. The plan adds to them."
      />
      <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
        <div className="flex flex-col gap-2">
          <div role="radiogroup" className="flex flex-col gap-2">
            {companyPages.map((squad) => (
              <CompanyRow
                key={squad.id}
                company={squad}
                isSelected={squad.id === selectedId}
                planTitle={
                  squad.id === selectedId && activePlan
                    ? getSquadPlanTitle(activePlan)
                    : undefined
                }
                onClick={() => onSelect(squad.id)}
              />
            ))}
          </div>
          <Button
            tag="a"
            href={getCompanyPageCreateUrl({ plan, checkout: true })}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            className="-ml-2 self-start"
            icon={<PlusIcon />}
          >
            No company page yet? Create one for free
          </Button>
        </div>
        {activePlan ? (
          <CheckoutCta>
            <Button
              tag="a"
              href={getSquadManageUrl(selected.handle, SquadManageSection.Plan)}
              variant={
                isSquadPlan(activePlan)
                  ? ButtonVariant.Float
                  : ButtonVariant.Primary
              }
              className="flex-1"
            >
              Manage subscription
            </Button>
            {isSquadPlan(activePlan) && (
              <Button
                type="button"
                variant={ButtonVariant.Primary}
                className="flex-1"
                onClick={() => onSetUp(selected, activePlan)}
              >
                Set up your page
              </Button>
            )}
          </CheckoutCta>
        ) : (
          <CheckoutCta>
            <Button
              type="submit"
              variant={ButtonVariant.Primary}
              className="flex-1"
              loading={!!selected && isFetching}
              disabled={!selected || isFetching}
            >
              Continue
            </Button>
          </CheckoutCta>
        )}
      </form>
    </CheckoutShell>
  );
};

const PlanOption = ({
  plan,
  price,
  isSelected,
  onClick,
}: {
  plan: SquadPlan;
  price: string;
  isSelected: boolean;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    role="radio"
    aria-checked={isSelected}
    onClick={onClick}
    className={classNames(
      'flex flex-col gap-3 rounded-16 border p-4 text-left',
      isSelected
        ? 'border-accent-cabbage-default bg-surface-float'
        : 'border-border-subtlest-tertiary hover:border-border-subtlest-secondary',
    )}
  >
    <span className="flex flex-wrap items-center gap-2">
      <span
        className={classNames(
          'flex size-5 shrink-0 items-center justify-center rounded-full border',
          isSelected
            ? 'border-accent-cabbage-default bg-accent-cabbage-default'
            : 'border-border-subtlest-secondary',
        )}
      >
        {isSelected && <VIcon size={IconSize.Size16} />}
      </span>
      <span className="font-bold typo-title3">
        {squadPlanDetails[plan].title}
      </span>
      {plan === SquadPlan.Starter && (
        <span className="rounded-8 bg-accent-cabbage-flat px-2 py-0.5 font-bold text-accent-cabbage-default typo-caption1">
          Recommended
        </span>
      )}
      <span className="ml-auto whitespace-nowrap">
        <span className="font-bold tabular-nums typo-title3">{price}</span>
        <span className="text-text-tertiary typo-footnote"> / month</span>
      </span>
    </span>
    <SquadPlanCashback plan={plan} />
    <span className="text-text-tertiary typo-footnote">
      {squadPlanDetails[plan].tagline}
    </span>
  </button>
);

/** One box under the plans, so choosing a plan changes its words and moves nothing. */
const PlanIncludes = ({ plan }: { plan: SquadPlan }): ReactElement => (
  <div className="grid">
    {squadPlans.map((option) => (
      <ul
        key={option}
        aria-hidden={option !== plan}
        className="flex flex-col gap-1.5 px-1"
        style={{
          gridArea: '1 / 1',
          visibility: option === plan ? 'visible' : 'hidden',
        }}
      >
        <li className="font-bold text-text-tertiary typo-footnote">
          {squadPlanOverFree[option].featuresTitle}
        </li>
        {squadPlanOverFree[option].features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-text-secondary typo-footnote"
          >
            <VIcon
              size={IconSize.Size16}
              className="shrink-0 text-accent-avocado-default"
            />
            <span className="min-w-0 flex-1">{feature}</span>
          </li>
        ))}
      </ul>
    ))}
  </div>
);

const PaymentPanel = ({
  company,
  plan,
  price,
  onChangePlan,
  onPaid,
}: {
  company: CompanyChoice;
  plan: SquadPlan;
  price: string;
  onChangePlan: () => void;
  onPaid: () => void;
}): ReactElement => {
  const cashbackPromo = useStartupsCashbackPromo();
  const { trackEvent } = usePixelsContext();
  const { user } = useAuthContext();
  const { openCheckout, isPaddleReady, checkoutTotals } = usePaddlePayment({
    priceType: PurchaseType.Startups,
    successCallback: (event) => {
      const totals = event?.data?.totals;
      trackEvent(
        'Subscribe',
        {
          content_name: 'startups',
          content_category: plan,
          value: totals ? totals.total - totals.tax : 0,
          currency: event?.data?.currency_code,
        },
        {
          eventId: event?.data?.transaction_id,
          xEventId: STARTUPS_X_EVENTS.subscription,
          email: user?.email,
        },
      );
      trackHotjarEvent(getSubscribedHotjarEvent(plan));
      onPaid();
    },
    origin: Origin.StartupsCheckout,
    logExtra: { plan, source_id: company.id },
  });
  const openedRef = useRef<string>();
  const [isTimedOut, setTimedOut] = useState(false);
  const seats = SQUAD_PLAN_SEATS[plan];
  // Paddle knows the real amount once a discount or tax is applied
  const formatTotal = (value: number) =>
    formatCurrency(value, {
      style: 'currency',
      currency: checkoutTotals?.currency,
    });

  useEffect(() => {
    const priceId = getSquadPlanPriceId(plan);

    if (!isPaddleReady || openedRef.current === priceId) {
      return;
    }

    if (!openedRef.current) {
      trackEvent(
        'InitiateCheckout',
        {
          content_name: 'startups',
          content_category: plan,
          value: SQUAD_PLAN_LIST_PRICE_USD[plan],
          currency: 'USD',
        },
        { xEventId: STARTUPS_X_EVENTS.beginCheckout, email: user?.email },
      );
      trackHotjarEvent(StartupsHotjarEvent.CheckoutOpened);
    }
    // A second call while the frame is open swaps the item in place
    openedRef.current = priceId;
    openCheckout({
      priceId,
      customData: { ...getSavedCheckoutAttribution(), source_id: company.id },
    });
  }, [company.id, isPaddleReady, openCheckout, plan, trackEvent, user?.email]);

  useEffect(() => {
    if (isPaddleReady) {
      return undefined;
    }

    const timeout = setTimeout(() => setTimedOut(true), PADDLE_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [isPaddleReady]);

  return (
    <StartupsStageSurface className="flex min-h-full w-full flex-col gap-4 p-2 laptop:p-6">
      {/* The order summary Paddle asks for (items, renewal terms, tax and
          total; its inline frame shows none of them) in two lines, so the
          frame and its pay button start high enough to sit above the fold
          (Ido, 2026-11-09: the button was easy to miss below it). */}
      <div className="flex flex-col gap-1 border-b border-border-subtlest-tertiary pb-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="min-w-0 flex-1 truncate font-bold typo-body">
            {`${squadPlanDetails[plan].title} plan for ${company.name}`}
          </h2>
          <span className="shrink-0 font-bold tabular-nums typo-body">
            {`${checkoutTotals ? formatTotal(checkoutTotals.total) : price} today`}
          </span>
        </div>
        <p className="text-text-tertiary typo-footnote">
          {`${price} a month plus tax for your country. ${seats} ${
            seats === 1 ? 'seat' : 'seats'
          }, ${formatSquadPlanCredits(
            plan,
            cashbackPromo,
          )} every month. Renews monthly, cancel any time.`}
          {!!checkoutTotals?.discount &&
            ` Discount: -${formatTotal(checkoutTotals.discount)}.`}
        </p>
        <Button
          className="mt-1 self-start laptop:hidden"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          onClick={onChangePlan}
        >
          Change plan
        </Button>
      </div>
      {isTimedOut && !isPaddleReady ? (
        <CharmEmptyState
          placement={CharmEmptyStatePlacement.Inline}
          className="my-auto"
          image={cloudinaryCharmSomethingWentWrong}
          imageAlt="daily.dev charm with something gone wrong"
          title="The payment form didn't load"
          description="An ad blocker or a network filter usually causes this. You haven't been charged, and your company page and plan choice are saved."
          action={{
            label: 'Try again',
            onClick: () => globalThis.location?.reload(),
          }}
        />
      ) : (
        <div className="relative flex-1" style={{ minHeight: '28rem' }}>
          {!isPaddleReady && (
            <div className="absolute inset-0 flex flex-col gap-3" aria-busy>
              <div className="grid grid-cols-2 gap-2">
                <CheckoutSkeleton className="h-16 rounded-10" />
                <CheckoutSkeleton className="h-16 rounded-10" />
              </div>
              <CheckoutSkeleton className="h-14 rounded-10" />
              <CheckoutSkeleton className="h-14 rounded-10" />
              <span className="flex-1" />
              <CheckoutSkeleton className="h-12 rounded-14" />
            </div>
          )}
          <div className="checkout-container relative min-w-0" />
        </div>
      )}
    </StartupsStageSurface>
  );
};

const PlanStep = ({
  company,
  plan,
  isPaying,
  onSelect,
  onPay,
  onChoose,
  onPaid,
}: {
  company: CompanyChoice;
  plan: SquadPlan;
  /** On a phone, choosing and paying are two screens. */
  isPaying: boolean;
  onSelect: (plan: SquadPlan) => void;
  onPay: () => void;
  onChoose: () => void;
  onPaid: () => void;
}): ReactElement => {
  const prices = useSquadPlanPrices();
  const logStartups = useLogStartups();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const payment = (
    <PaymentPanel
      company={company}
      plan={plan}
      price={prices[plan]}
      onChangePlan={onChoose}
      onPaid={onPaid}
    />
  );

  // On a phone, paying is a screen of its own under the same logo.
  if (!isLaptop && isPaying) {
    return (
      <CheckoutShell current={CheckoutStage.Plan} isTall>
        <div style={{ paddingTop: 24 }}>{payment}</div>
      </CheckoutShell>
    );
  }

  return (
    <CheckoutShell
      current={CheckoutStage.Plan}
      isTall
      isAsideFlowing
      aside={isLaptop && payment}
    >
      <CheckoutTitle
        title={`Upgrade ${company.name}`}
        description={`Billed monthly. Cancel any time and ${company.name} goes back to Free.`}
      />
      <SquadLaunchOfferBanner />
      <div role="radiogroup" className="flex flex-col gap-3">
        {squadPlans.map((option) => (
          <PlanOption
            key={option}
            plan={option}
            price={prices[option]}
            isSelected={option === plan}
            onClick={() => onSelect(option)}
          />
        ))}
      </div>
      <PlanIncludes plan={plan} />
      <div className="laptop:hidden">
        <CheckoutCta>
          <Button
            variant={ButtonVariant.Primary}
            className="flex-1"
            onClick={onPay}
          >
            {`Continue with ${squadPlanDetails[plan].title}`}
          </Button>
        </CheckoutCta>
      </div>
      <Button
        tag="a"
        href={startupsEnterpriseUrl}
        target="_blank"
        rel="noopener"
        onClick={() =>
          logStartups(LogEvent.UpgradeSubscription, 'enterprise', {
            origin: Origin.StartupsCheckout,
            source_id: company.id,
          })
        }
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        className="-ml-2 self-start"
        icon={<OpenLinkIcon />}
      >
        Need more? Talk to us about Enterprise
      </Button>
    </CheckoutShell>
  );
};

const StatusLine = ({
  state,
  children,
}: {
  state: 'done' | 'working' | 'waiting';
  children: string;
}): ReactElement => (
  <li className="flex items-center gap-3 typo-callout">
    <span className="flex size-6 shrink-0 items-center justify-center">
      {state === 'done' && (
        <VIcon className="text-accent-avocado-default" secondary />
      )}
      {state === 'working' && <Loader />}
      {state === 'waiting' && (
        <span className="size-5 rounded-full border border-dashed border-border-subtlest-secondary" />
      )}
    </span>
    <span
      className={classNames(
        'min-w-0 flex-1',
        state === 'waiting' ? 'text-text-tertiary' : 'text-text-primary',
      )}
    >
      {children}
    </span>
  </li>
);

/** The win moment's boost credits line, for the plan just bought */
const PlanCreditsCard = ({
  name,
  credits,
}: {
  name: string;
  credits: string;
}): ReactElement => (
  <div className="flex items-center gap-3 rounded-16 bg-surface-float p-4">
    <CoreIcon size={IconSize.Large} className="shrink-0" />
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="font-bold typo-callout">
        {`${credits} in boost credits every month`}
      </span>
      <span className="text-pretty text-text-tertiary typo-footnote">
        {`They go to ${name}'s page wallet. Use them to boost your posts.`}
      </span>
    </div>
  </div>
);

const SetupStep = ({
  squad,
  company,
  plan,
  pageUrl,
  isReturning,
}: {
  squad: Squad;
  company: CompanyChoice;
  plan: SquadPlan;
  pageUrl: string;
  isReturning?: boolean;
}): ReactElement => {
  const { user } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [editing, setEditing] = useState<StartupsSetupRow>();
  const checklistScroll = useRef(0);
  const { done, product, cta } = useStartupsSetupProgress(squad, plan);
  const readiness = useCompanyPageReadiness(squad, true, plan);
  const { data: subscription } = useQuery({
    ...squadSubscriptionQueryOptions({ user, sourceId: company.id }),
    enabled: false,
  });
  const credits = formatBoostCredits(
    getSquadPlanCreditsForRate(
      plan,
      subscription?.cashbackPercentage || SQUAD_PLAN_CASHBACK_PERCENTAGE[plan],
    ),
  );
  const isComplete =
    !readiness.isPending &&
    (readiness.isDismissed || !readiness.rows.some(isCountedItem));
  // Shows what the founder's agent changes over MCP as it happens
  useStartupsSetupRefresh({ squad, enabled: !editing });
  const preview = (
    <StartupsPagePreview
      squad={squad}
      isTeam={plan === SquadPlan.Team}
      product={product}
      cta={cta}
      hasSeats={done.seats}
    />
  );

  // On a phone the settings cover this screen, so coming back lands at the same
  // place in the checklist.
  useEffect(() => {
    if (!isLaptop) {
      globalThis.scrollTo?.({
        top: editing ? 0 : checklistScroll.current,
        behavior: 'instant',
      });
    }
  }, [editing, isLaptop]);

  const editor = editing && (
    <StartupsSetupEditor
      key={editing}
      squad={squad}
      row={editing}
      title={startupsSetupRowTitles[editing]}
      isPage={!isLaptop}
      onClose={() => setEditing(undefined)}
    />
  );
  const planTitle = squadPlanDetails[plan].title;

  return (
    <>
      {!isLaptop && editor}
      {/* Stays mounted under a phone's editor, so its tab isn't lost. */}
      <div className={classNames(!isLaptop && editing && 'hidden')}>
        <CheckoutShell
          current={CheckoutStage.Setup}
          isTall
          aside={isLaptop && (editor || preview)}
        >
          <div className="relative">
            {!isReturning && (
              <>
                <PatchyConfetti origin={{ left: '20%', top: '30%' }} />
                <PatchyConfetti origin={{ left: '70%', top: '10%' }} />
              </>
            )}
            <CheckoutTitle
              title={
                isReturning
                  ? `Get the most out of ${planTitle}`
                  : `You did it. ${company.name} is on ${planTitle}.`
              }
              description="Your page now reaches developers in their feed, on Google and in AI answers."
            />
          </div>
          {!isReturning && (
            <PlanCreditsCard name={company.name} credits={credits} />
          )}
          {readiness.isPending && (
            <CheckoutSkeleton className="h-96 rounded-16" />
          )}
          {!readiness.isPending && !isComplete && (
            <SquadPageReadiness
              squad={squad}
              plan={plan}
              rows={readiness.rows}
              done={readiness.done}
              onTrySkill={readiness.onTrySkill}
              onDismiss={readiness.onDismiss}
              origin={Origin.StartupsCheckout}
              onEditRow={(item) => {
                if (!item.editor) {
                  return false;
                }

                checklistScroll.current = globalThis.scrollY ?? 0;
                setEditing(item.editor);
                return true;
              }}
            />
          )}
          <Button
            tag="a"
            href={pageUrl}
            variant={isComplete ? ButtonVariant.Primary : ButtonVariant.Subtle}
            className="self-start"
            icon={<OpenLinkIcon size={IconSize.Size16} />}
            iconPosition={ButtonIconPosition.Right}
          >
            Open your page
          </Button>
          {!isLaptop && <div className="p-2 pb-4">{preview}</div>}
        </CheckoutShell>
      </div>
    </>
  );
};

/** The plan is on, and the page's details are still arriving. */
const SetupLoading = ({
  company,
  plan,
  pageUrl,
}: {
  company: CompanyChoice;
  plan: SquadPlan;
  pageUrl: string;
}): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const preview = (
    <StartupsPagePreview
      squad={company as Squad}
      isTeam={plan === SquadPlan.Team}
    />
  );

  return (
    <CheckoutShell
      current={CheckoutStage.Setup}
      isTall
      aside={isLaptop && preview}
    >
      <CheckoutTitle
        title={`You're in. ${company.name} is on ${squadPlanDetails[plan].title}.`}
        description="Your page is live. Set it up with your agent, or yourself."
      />
      <div className="flex flex-col gap-5" aria-busy>
        <CheckoutSkeleton className="h-11 rounded-14" />
        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="flex items-center gap-3">
              <CheckoutSkeleton className="size-6 rounded-full" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <CheckoutSkeleton className="h-4 w-1/2 rounded-6" />
                <CheckoutSkeleton className="h-3 w-5/6 rounded-6" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Button
        tag="a"
        href={pageUrl}
        variant={ButtonVariant.Subtle}
        className="self-start"
        icon={<OpenLinkIcon size={IconSize.Size16} />}
        iconPosition={ButtonIconPosition.Right}
      >
        Open your page
      </Button>
      {!isLaptop && <div className="p-2 pb-4">{preview}</div>}
    </CheckoutShell>
  );
};

const DoneStep = ({
  company,
  plan,
  isReturning,
}: {
  company: CompanyChoice;
  plan: SquadPlan;
  /** Back to set up a page that was already on a plan, nothing was paid */
  isReturning?: boolean;
}): ReactElement => {
  const { user, refetchBoot } = useAuthContext();
  const client = useQueryClient();
  const [startedAt] = useState(() => Date.now());
  const [isTimedOut, setTimedOut] = useState(false);
  const [isRefreshed, setRefreshed] = useState(!!isReturning);
  const { data: subscription } = useQuery(
    squadSubscriptionQueryOptions({
      user,
      sourceId: company.id,
      refetchInterval: (query) =>
        query.state.data?.plan || isTimedOut ? false : ACTIVATION_POLL_MS,
    }),
  );
  const isActive = !!subscription?.plan;
  const { squad } = useSquad({ handle: company.handle });
  const logStartups = useLogStartups();
  const planTitle = squadPlanDetails[plan].title;

  useEffect(() => {
    if (isActive) {
      if (isReturning) {
        return undefined;
      }

      logStartups(LogEvent.ActivateSquadPlan, plan, {
        source_id: company.id,
        seconds: Math.round((Date.now() - startedAt) / 1000),
      });
      // The squad's features changed with the plan, and boot's squads now
      // carry the owner's seat, which seat-only settings read
      Promise.all([
        client.invalidateQueries({ queryKey: [RequestKey.Squad] }),
        refetchBoot?.(),
      ]).finally(() => setRefreshed(true));
      return undefined;
    }

    const timeout = setTimeout(
      () => setTimedOut(true),
      Math.max(ACTIVATION_TIMEOUT_MS - (Date.now() - startedAt), 0),
    );

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, isActive, startedAt]);

  useEffect(() => {
    if (isTimedOut) {
      logStartups(LogEvent.DelaySquadPlanActivation, plan, {
        source_id: company.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimedOut]);

  const pageUrl = company.permalink ?? `${webappUrl}squads/${company.handle}`;

  if (isActive && isRefreshed && squad) {
    return (
      <SetupStep
        squad={squad}
        company={company}
        plan={plan}
        pageUrl={pageUrl}
        isReturning={isReturning}
      />
    );
  }

  if (isActive) {
    return <SetupLoading company={company} plan={plan} pageUrl={pageUrl} />;
  }

  return (
    <CheckoutShell
      current={CheckoutStage.Setup}
      aside={<StartupsNameStunt name={company.name} />}
    >
      <CheckoutTitle
        title={isTimedOut ? 'Payment received' : `Setting up ${company.name}…`}
        description={
          isTimedOut
            ? `Your ${planTitle} plan is taking longer than usual to switch on. You don't need to pay again or stay on this page. It will show on ${company.name} in a few minutes, and we'll email you the receipt.`
            : 'Your payment went through. This takes a few seconds.'
        }
      />
      <ul className="flex flex-col gap-3">
        <StatusLine state="done">Payment received</StatusLine>
        <StatusLine state="working">{`Switching on ${planTitle}`}</StatusLine>
        <StatusLine state="waiting">Adding your boost credits</StatusLine>
        <StatusLine state="waiting">
          {`Getting ${company.name}'s page ready`}
        </StatusLine>
      </ul>
      {isTimedOut && (
        <Button
          tag="a"
          href={pageUrl}
          variant={ButtonVariant.Secondary}
          className="self-start"
        >
          Go to your page
        </Button>
      )}
    </CheckoutShell>
  );
};

interface StartupsCheckoutProps {
  /** From `?plan=`, the plan picked on the landing page */
  initialPlan?: string;
  /** From `?squad=`, a squad id picked in its Manage page */
  initialSquadId?: string;
  /** Pins a step, for stories */
  initialStep?: StartupsCheckoutStep;
  /** Pins the company, for stories */
  initialCompany?: CompanyChoice;
  /** Pins the account step's screen, for stories */
  initialAuthDisplay?: AuthDisplay;
  /** Pins the account step's email, for stories */
  initialAuthEmail?: string;
}

export const StartupsCheckout = ({
  initialPlan,
  initialSquadId,
  initialStep = StartupsCheckoutStep.Company,
  initialCompany,
  initialAuthDisplay,
  initialAuthEmail,
}: StartupsCheckoutProps): ReactElement => {
  const router = useRouter();
  const { squads, user } = useAuthContext();
  const adminSquads = useMemo<CompanyChoice[]>(
    () =>
      (squads ?? []).filter(
        (squad): squad is Squad & { id: string } =>
          !!squad.id && squad.currentMember?.role === SourceMemberRole.Admin,
      ),
    [squads],
  );
  // Plans are bought for company pages. Any admin squad still opens from its
  // own Manage page, and paying makes it a company page.
  const companyPages = useMemo(
    () => adminSquads.filter((squad) => squad.flags?.company),
    [adminSquads],
  );
  const [step, setStep] = useState(initialStep);
  const [plan, setPlan] = useState<SquadPlan>(
    isSquadPlan(initialPlan) ? initialPlan : SquadPlan.Starter,
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    () =>
      companyPages.find(({ id }) => id === initialSquadId)?.id ??
      companyPages[0]?.id ??
      null,
  );
  const [company, setCompany] = useState<CompanyChoice | undefined>(
    initialCompany,
  );
  const [isReturning, setReturning] = useState(false);
  // A link from a squad's own page already says which page this is for, so
  // it goes straight to the plans, unless that page is already on a plan.
  const linkedSquad = initialSquadId
    ? adminSquads.find(({ id }) => id === initialSquadId)
    : undefined;
  const [isOpeningLink, setOpeningLink] = useState(
    () =>
      !!initialSquadId &&
      initialStep === StartupsCheckoutStep.Company &&
      !initialCompany,
  );
  const { data: linkedSubscription, isError: isLinkedSubscriptionError } =
    useQuery({
      ...squadSubscriptionQueryOptions({ user, sourceId: linkedSquad?.id }),
      enabled: isOpeningLink && !!user?.id && !!linkedSquad,
    });
  const logStartups = useLogStartups();

  useEffect(() => {
    // Squads arrive with boot; pick the one the link asked for once they do
    if (selectedId || !companyPages.length) {
      return;
    }

    setSelectedId(
      companyPages.find(({ id }) => id === initialSquadId)?.id ??
        companyPages[0].id,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyPages.length]);

  useEffect(() => {
    if (!isOpeningLink) {
      return;
    }

    if (!linkedSquad || !user?.id || isLinkedSubscriptionError) {
      setOpeningLink(false);
      return;
    }

    if (!linkedSubscription) {
      return;
    }

    if (!linkedSubscription.plan) {
      setCompany(linkedSquad);
      setStep(StartupsCheckoutStep.Plan);
    }

    setOpeningLink(false);
  }, [
    isOpeningLink,
    linkedSquad,
    user?.id,
    linkedSubscription,
    isLinkedSubscriptionError,
  ]);

  useEffect(() => {
    // Logs the step the link lands on, not the one it skips
    if (isOpeningLink) {
      return;
    }

    globalThis.scrollTo?.({ top: 0 });
    logStartups(LogEvent.ViewStartupsCheckout, step, {
      plan,
      source_id: company?.id,
      company_pages: companyPages.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isOpeningLink]);

  const userId = user?.id;

  // Without a company page there is nothing to upgrade: the page comes first,
  // for free
  const isCreatingPage =
    !isOpeningLink &&
    !!userId &&
    step === StartupsCheckoutStep.Company &&
    !companyPages.length;

  useEffect(() => {
    if (isCreatingPage) {
      router.replace(getCompanyPageCreateUrl({ plan, checkout: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreatingPage]);

  if (isOpeningLink || isCreatingPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (step === StartupsCheckoutStep.Account) {
    return (
      <AccountStep
        initialDisplay={initialAuthDisplay}
        initialEmail={initialAuthEmail}
      />
    );
  }

  if (
    (step === StartupsCheckoutStep.Plan ||
      step === StartupsCheckoutStep.Checkout) &&
    company
  ) {
    return (
      <PlanStep
        company={company}
        plan={plan}
        isPaying={step === StartupsCheckoutStep.Checkout}
        onSelect={(next) => {
          if (next !== plan) {
            setPlan(next);
            logStartups(LogEvent.SelectSquadPlan, next, {
              origin: Origin.StartupsCheckout,
              source_id: company.id,
            });
          }
        }}
        onPay={() => setStep(StartupsCheckoutStep.Checkout)}
        onChoose={() => setStep(StartupsCheckoutStep.Plan)}
        onPaid={() => setStep(StartupsCheckoutStep.Done)}
      />
    );
  }

  if (step === StartupsCheckoutStep.Done && company) {
    return <DoneStep company={company} plan={plan} isReturning={isReturning} />;
  }

  return (
    <CompanyStep
      companyPages={companyPages}
      plan={plan}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onContinue={(next) => {
        setCompany(next);
        setStep(StartupsCheckoutStep.Plan);
      }}
      onSetUp={(next, activePlan) => {
        setCompany(next);
        setPlan(activePlan);
        setReturning(true);
        setStep(StartupsCheckoutStep.Done);
      }}
    />
  );
};
