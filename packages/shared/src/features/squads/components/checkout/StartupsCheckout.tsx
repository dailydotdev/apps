import type { FormEvent, MutableRefObject, ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
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
import { TextField } from '../../../../components/fields/TextField';
import {
  CoreIcon,
  MoveToIcon,
  OpenLinkIcon,
  PlusIcon,
  SquadIcon,
  VIcon,
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { Loader } from '../../../../components/Loader';
import { Tooltip } from '../../../../components/tooltip/Tooltip';
import { SquadImage } from '../../../../components/squads/SquadImage';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useSquadCreate } from '../../../../hooks/squads/useSquadCreate';
import { useSquad } from '../../../../hooks/squads/useSquad';
import { usePaddlePayment } from '../../../../hooks/usePaddlePayment';
import { useViewSize, ViewSize } from '../../../../hooks/useViewSize';
import type { Squad } from '../../../../graphql/sources';
import { SourceMemberRole } from '../../../../graphql/sources';
import { PrivacyOption } from '../../../../graphql/squads';
import AuthOptions from '../../../../components/auth/AuthOptions';
import { AuthDisplay, providerMap } from '../../../../components/auth/common';
import { AuthTriggers } from '../../../../lib/auth';
import { cloudinaryCharmSomethingWentWrong } from '../../../../lib/image';
import { findFreeSquadHandle, toSquadHandle } from '../../lib/handle';
import { PurchaseType } from '../../../../graphql/paddle';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { webappUrl } from '../../../../lib/constants';
import { RequestKey } from '../../../../lib/query';
import { LogEvent, Origin } from '../../../../lib/log';
import { getSquadManageUrl, SquadManageSection } from '../../lib/routes';
import { getSquadId } from '../../lib/features';
import {
  getSquadPlanPriceId,
  isSquadPlan,
  SQUAD_PLAN_CASHBACK_PERCENTAGE,
  SQUAD_PLAN_SEATS,
  SquadPlan,
  squadPlanDetails,
  squadPlans,
  startupsEnterpriseUrl,
} from '../../lib/plans';
import { useSquadPlanPrices } from '../../hooks/useSquadPlanPrices';
import { useLogStartups } from '../../hooks/useLogStartups';
import {
  StartupsSetup,
  startupsSetupRowTitles,
  useStartupsSetupProgress,
} from '../setup/StartupsSetup';
import { StartupsPagePreview } from '../setup/StartupsPagePreview';
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

const AUTH_STYLES = `
.startups-auth .px-6 { padding-inline: 0; }
.startups-auth [role="list"] { gap: 12px; }
.startups-auth [role="list"] svg { width: 20px; height: 20px; }
@media (min-width: 1020px) {
  .startups-auth h2, .startups-auth > p, .startups-auth p.text-center { text-align: left; }
  .startups-auth h2 { font-size: 2.125rem; line-height: 2.5rem; letter-spacing: -0.02em; }
  .startups-auth:has(.items-center) h2 { text-align: center; }
}
`;

const signupProviders = [providerMap.github, providerMap.google];

/**
 * A visitor from the landing page signs up right here, then the page starts
 * the checkout for them: no feed onboarding in between.
 */
const AccountStep = (): ReactElement => {
  const [display, setDisplay] = useState<string>(AuthDisplay.Default);
  const [onScreenBack, setOnScreenBack] = useState<() => void>();
  const back: CheckoutBack | undefined = onScreenBack && {
    label: 'Go back',
    onClick: onScreenBack,
  };

  return (
    <CheckoutShell
      current={CheckoutStage.Account}
      aside={<StartupsSignupPanel />}
      isPhoneWall={display === AuthDisplay.Default && !onScreenBack}
      phoneBack={back}
    >
      <style dangerouslySetInnerHTML={{ __html: AUTH_STYLES }} />
      {back && (
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
            Back
          </Button>
        </div>
      )}
      <div className="startups-auth flex flex-col">
        <AuthOptions
          formRef={null as unknown as MutableRefObject<HTMLFormElement>}
          trigger={AuthTriggers.StartupsCheckout}
          simplified
          preferGithub
          defaultDisplay={AuthDisplay.Default}
          isLoginFlow={false}
          hideRegistrationHeadline
          signUpTitle="Create your account"
          logInTitle="Welcome back"
          signUpDescription="Create your company page and pick a plan on daily.dev for Startups."
          logInDescription="Log in, then pick the page this plan is for."
          signupProviders={signupProviders}
          onDisplayChange={setDisplay}
          onScreenBackChange={(next) => setOnScreenBack(() => next)}
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
  adminSquads,
  selectedId,
  onSelect,
  onContinue,
}: {
  adminSquads: CompanyChoice[];
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
  onContinue: (squad: CompanyChoice, isNew: boolean) => void;
}): ReactElement => {
  const { user } = useAuthContext();
  const selected = adminSquads.find(({ id }) => id === selectedId);
  const hasPages = adminSquads.length > 0;
  const [name, setName] = useState('');
  const [isMissing, setMissing] = useState(false);
  const [isFindingHandle, setFindingHandle] = useState(false);
  const { onCreateSquad, isLoading } = useSquadCreate({
    onSuccess: (squad) => onContinue({ ...squad, id: getSquadId(squad) }, true),
  });
  const { data: subscription, isFetching } = useQuery(
    squadSubscriptionQueryOptions({ user, sourceId: selected?.id }),
  );
  const activePlan = selected && subscription?.plan;
  const companyName = name.trim();
  const isBusy = isFindingHandle || isLoading;

  const getHint = (): string => {
    if (isMissing && !companyName) {
      return 'Add a name to continue.';
    }

    return companyName
      ? `Your page: daily.dev/squads/${toSquadHandle(companyName)}`
      : ' ';
  };

  // Only the name is asked: the logo, description and the rest are set up
  // after payment, by hand or by the buyer's agent.
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    if (selected) {
      onContinue(selected, false);
      return;
    }

    if (!companyName) {
      setMissing(true);
      return;
    }

    setFindingHandle(true);
    const handle = await findFreeSquadHandle(companyName).finally(() =>
      setFindingHandle(false),
    );

    // A company page is public, and only its team posts to it
    onCreateSquad({
      name: companyName,
      handle,
      description: '',
      status: PrivacyOption.Public,
      memberPostingRole: SourceMemberRole.Moderator,
      memberInviteRole: SourceMemberRole.Member,
      moderationRequired: false,
    });
  };

  return (
    <CheckoutShell
      current={CheckoutStage.Company}
      isTall={adminSquads.length > 3}
      aside={<StartupsNameStunt name={selected?.name ?? name} />}
    >
      <CheckoutTitle
        title={hasPages ? 'Which page is this for?' : 'Name your company'}
        description="It becomes your page on daily.dev, where your posts live."
      />
      <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
        {hasPages && (
          <div role="radiogroup" className="flex flex-col gap-2">
            {adminSquads.map((squad) => (
              <CompanyRow
                key={squad.id}
                company={squad}
                isSelected={squad.id === selectedId}
                planTitle={
                  squad.id === selectedId && activePlan
                    ? squadPlanDetails[activePlan].title
                    : undefined
                }
                onClick={() => onSelect(squad.id)}
              />
            ))}
          </div>
        )}
        <div className="flex flex-col gap-3">
          {/* Always here, so choosing to create one moves nothing. */}
          <div onFocusCapture={() => onSelect(null)}>
            <TextField
              autoFocus={!hasPages}
              inputId="startups-company-name"
              name="name"
              autoComplete="organization"
              label={hasPages ? 'Or create a new page' : 'Company name'}
              leftIcon={hasPages ? <PlusIcon /> : <SquadIcon />}
              className={{ container: 'w-full' }}
              valueChanged={setName}
              valid={isMissing && !companyName ? false : undefined}
              hint={getHint()}
            />
          </div>
          {activePlan ? (
            <CheckoutCta>
              <Button
                tag="a"
                href={getSquadManageUrl(
                  selected.handle,
                  SquadManageSection.Plan,
                )}
                variant={ButtonVariant.Primary}
                className="flex-1"
              >
                Manage subscription
              </Button>
            </CheckoutCta>
          ) : (
            <CheckoutCta>
              <Button
                type="submit"
                variant={ButtonVariant.Primary}
                className="flex-1"
                loading={isBusy || (!!selected && isFetching)}
                disabled={isBusy || (!!selected && isFetching)}
              >
                Continue
              </Button>
            </CheckoutCta>
          )}
        </div>
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
    <span className="flex items-center gap-2">
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
    <span className="flex items-center gap-1.5 text-text-secondary typo-footnote">
      <CoreIcon size={IconSize.Size16} className="shrink-0" />
      {`${SQUAD_PLAN_CASHBACK_PERCENTAGE[plan]}% cashback to boost your posts`}
    </span>
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
          {squadPlanDetails[option].featuresTitle}
        </li>
        {squadPlanDetails[option].features.map((feature) => (
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

const SummaryRow = ({
  label,
  value,
  isBold,
}: {
  label: string;
  value: string;
  isBold?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'flex justify-between gap-3',
      isBold && 'border-t border-border-subtlest-tertiary pt-2 font-bold',
    )}
  >
    <dt className={isBold ? undefined : 'text-text-secondary'}>{label}</dt>
    <dd
      className={classNames(
        'text-right tabular-nums',
        !isBold && 'text-text-tertiary',
      )}
    >
      {value}
    </dd>
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
  const { openCheckout, isPaddleReady } = usePaddlePayment({
    priceType: PurchaseType.Startups,
    successCallback: onPaid,
    origin: Origin.StartupsCheckout,
    logExtra: { plan, source_id: company.id },
  });
  const openedRef = useRef<string>();
  const [isTimedOut, setTimedOut] = useState(false);
  const seats = SQUAD_PLAN_SEATS[plan];

  useEffect(() => {
    const priceId = getSquadPlanPriceId(plan);

    if (!isPaddleReady || openedRef.current === priceId) {
      return;
    }

    // A second call while the frame is open swaps the item in place
    openedRef.current = priceId;
    openCheckout({ priceId, customData: { source_id: company.id } });
  }, [company.id, isPaddleReady, openCheckout, plan]);

  useEffect(() => {
    if (isPaddleReady) {
      return undefined;
    }

    const timeout = setTimeout(() => setTimedOut(true), PADDLE_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [isPaddleReady]);

  return (
    <div className="flex min-h-full w-full flex-col gap-6 p-5 laptop:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="font-bold typo-title2">Payment</h2>
          <p className="truncate text-text-secondary typo-callout">
            {company.name}
          </p>
        </div>
        <Button
          className="laptop:hidden"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          onClick={onChangePlan}
        >
          Change
        </Button>
      </div>
      <dl className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-4 typo-callout">
        <SummaryRow
          label={`${squadPlanDetails[plan].title} plan`}
          value={price}
        />
        <SummaryRow
          label="Includes"
          value={`${seats} ${seats === 1 ? 'seat' : 'seats'}, ${SQUAD_PLAN_CASHBACK_PERCENTAGE[plan]}% cashback`}
        />
        <SummaryRow label="Tax" value="Added by Paddle for your country" />
        <SummaryRow label="Due today" value={price} isBold />
        <p className="text-text-tertiary typo-footnote">
          Renews every month. Cancel any time, your page and posts stay.
        </p>
      </dl>
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
        <div className="relative flex-1" style={{ minHeight: '31.25rem' }}>
          {!isPaddleReady && (
            <div className="absolute inset-0 flex flex-col gap-3" aria-busy>
              <div className="grid grid-cols-2 gap-2">
                <CheckoutSkeleton className="h-16 rounded-10" />
                <CheckoutSkeleton className="h-16 rounded-10" />
              </div>
              <CheckoutSkeleton className="h-14 rounded-10" />
              <CheckoutSkeleton className="h-14 rounded-10" />
              <CheckoutSkeleton className="h-12 rounded-14" />
            </div>
          )}
          <div className="checkout-container relative min-w-0" />
        </div>
      )}
    </div>
  );
};

const PlanStep = ({
  company,
  plan,
  isPaying,
  answers,
  onSelect,
  onPay,
  onChoose,
  onPaid,
}: {
  company: CompanyChoice;
  plan: SquadPlan;
  /** On a phone, choosing and paying are two screens. */
  isPaying: boolean;
  answers: Partial<Record<CheckoutStage, string>>;
  onSelect: (plan: SquadPlan) => void;
  onPay: () => void;
  onChoose: () => void;
  onPaid: () => void;
}): ReactElement => {
  const prices = useSquadPlanPrices();
  const logStartups = useLogStartups();
  const isLaptop = useViewSize(ViewSize.Laptop);

  return (
    <CheckoutShell
      current={CheckoutStage.Plan}
      answers={answers}
      isTall
      isAsideOnPhone={isPaying}
      aside={
        (isLaptop || isPaying) && (
          <PaymentPanel
            company={company}
            plan={plan}
            price={prices[plan]}
            onChangePlan={onChoose}
            onPaid={onPaid}
          />
        )
      }
    >
      <CheckoutTitle
        title={`Choose a plan for ${company.name}`}
        description="Billed monthly. Cancel any time, your page and posts stay."
      />
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

const SetupStep = ({
  squad,
  company,
  plan,
  answers,
  pageUrl,
}: {
  squad: Squad;
  company: CompanyChoice;
  plan: SquadPlan;
  answers: Partial<Record<CheckoutStage, string>>;
  pageUrl: string;
}): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [editing, setEditing] = useState<StartupsSetupRow>();
  const checklistScroll = useRef(0);
  const { done, isComplete, product, cta } = useStartupsSetupProgress(
    squad,
    plan,
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

  return (
    <>
      {!isLaptop && editor}
      {/* Stays mounted under a phone's editor, so its tab isn't lost. */}
      <div className={classNames(!isLaptop && editing && 'hidden')}>
        <CheckoutShell
          current={CheckoutStage.Setup}
          answers={answers}
          isComplete={isComplete}
          isTall
          aside={
            editor || (
              <StartupsPagePreview
                squad={squad}
                isTeam={plan === SquadPlan.Team}
                product={product}
                cta={cta}
                hasSeats={done.seats}
              />
            )
          }
        >
          <CheckoutTitle
            title={
              isComplete
                ? `${company.name} is ready`
                : `You're in. ${company.name} is on ${squadPlanDetails[plan].title}.`
            }
            description={
              isComplete
                ? 'Your page is set up. Your agent can post and boost from here on.'
                : 'Your page is live. Set it up with your agent, or yourself.'
            }
          />
          {!isComplete && (
            <StartupsSetup
              squad={squad}
              plan={plan}
              origin={Origin.StartupsCheckout}
              onEditRow={(row) => {
                checklistScroll.current = globalThis.scrollY ?? 0;
                setEditing(row);
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
        </CheckoutShell>
      </div>
    </>
  );
};

const DoneStep = ({
  company,
  plan,
  answers,
}: {
  company: CompanyChoice;
  plan: SquadPlan;
  answers: Partial<Record<CheckoutStage, string>>;
}): ReactElement => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const [startedAt] = useState(() => Date.now());
  const [isTimedOut, setTimedOut] = useState(false);
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
      logStartups(LogEvent.ActivateSquadPlan, plan, {
        source_id: company.id,
        seconds: Math.round((Date.now() - startedAt) / 1000),
      });
      // The squad's features changed with the plan
      client.invalidateQueries({ queryKey: [RequestKey.Squad] });
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

  if (isActive && squad) {
    return (
      <SetupStep
        squad={squad}
        company={company}
        plan={plan}
        answers={answers}
        pageUrl={pageUrl}
      />
    );
  }

  return (
    <CheckoutShell
      current={CheckoutStage.Setup}
      answers={answers}
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
        <StatusLine state="waiting">Turning on your cashback</StatusLine>
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
}

export const StartupsCheckout = ({
  initialPlan,
  initialSquadId,
  initialStep = StartupsCheckoutStep.Company,
  initialCompany,
}: StartupsCheckoutProps): ReactElement => {
  const { squads } = useAuthContext();
  const adminSquads = useMemo<CompanyChoice[]>(
    () =>
      (squads ?? []).filter(
        (squad): squad is Squad & { id: string } =>
          !!squad.id && squad.currentMember?.role === SourceMemberRole.Admin,
      ),
    [squads],
  );
  const [step, setStep] = useState(initialStep);
  const [plan, setPlan] = useState<SquadPlan>(
    isSquadPlan(initialPlan) ? initialPlan : SquadPlan.Starter,
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    () =>
      adminSquads.find(({ id }) => id === initialSquadId)?.id ??
      adminSquads[0]?.id ??
      null,
  );
  const [company, setCompany] = useState<CompanyChoice | undefined>(
    initialCompany,
  );
  const [isNewCompany, setNewCompany] = useState(false);
  const logStartups = useLogStartups();
  const answers = {
    [CheckoutStage.Company]: company?.name,
    [CheckoutStage.Plan]: squadPlanDetails[plan].title,
  };

  useEffect(() => {
    // Squads arrive with boot; pick the one the link asked for once they do
    if (selectedId || !adminSquads.length) {
      return;
    }

    setSelectedId(
      adminSquads.find(({ id }) => id === initialSquadId)?.id ??
        adminSquads[0].id,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminSquads.length]);

  useEffect(() => {
    globalThis.scrollTo?.({ top: 0 });
    logStartups(LogEvent.ViewStartupsCheckout, step, {
      plan,
      source_id: company?.id,
      new_company: isNewCompany,
      admin_squads: adminSquads.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (step === StartupsCheckoutStep.Account) {
    return <AccountStep />;
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
        answers={answers}
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
    return <DoneStep company={company} plan={plan} answers={answers} />;
  }

  return (
    <CompanyStep
      adminSquads={adminSquads}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onContinue={(next, isNew) => {
        setCompany(next);
        setNewCompany(isNew);
        setStep(StartupsCheckoutStep.Plan);
      }}
    />
  );
};
