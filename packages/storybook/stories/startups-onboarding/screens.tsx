import type { ReactElement, ReactNode } from 'react';
import React, {
  cloneElement,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { PasswordField } from '@dailydotdev/shared/src/components/fields/PasswordField';
import { CodeField } from '@dailydotdev/shared/src/components/fields/CodeField';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import {
  CopyIcon,
  CoreIcon,
  CreditCardIcon,
  MailIcon,
  MoveToIcon,
  PlusIcon,
  OpenLinkIcon,
  SquadIcon,
  UserIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import SignupDisclaimer from '@dailydotdev/shared/src/components/auth/SignupDisclaimer';
import { providerMap } from '@dailydotdev/shared/src/components/auth/common';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '@dailydotdev/shared/src/components/charm/CharmEmptyState';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { cloudinaryCharmSomethingWentWrong } from '@dailydotdev/shared/src/lib/image';
import { toSquadHandle } from '@dailydotdev/shared/src/features/squads/lib/handle';
import {
  SQUAD_PLAN_INTEL_TOPICS,
  SQUAD_PLAN_CASHBACK_PERCENTAGE,
  SQUAD_PLAN_SEATS,
  SquadPlan,
  squadPlanDetails,
  squadPlans,
} from '@dailydotdev/shared/src/features/squads/lib/plans';
import {
  AgentClient,
  agentClients,
  agentClientSetup,
  getStartupsSetupPrompt,
} from '@dailydotdev/shared/src/features/squads/lib/setup';
import { agentMarks } from './agentMarks';
import { StuntVisual } from './companyVisuals';
import { FullPagePreview } from './preview';
import { SetupEditor } from './setupEditor';
import {
  Cta,
  FormColumn,
  ProgressContext,
  Shell,
  Skeleton,
  StageFill,
  StepId,
  Title,
} from './shell';
import { CrewLinePanel } from './panels';

export const planPrices: Record<SquadPlan, string> = {
  [SquadPlan.Starter]: '$49',
  [SquadPlan.Team]: '$199',
};

const primary = 'w-full';

/* ----- Agent logos ----- */

export const AgentMark = ({
  client,
}: {
  client: AgentClient;
}): ReactElement | null => {
  const key = {
    [AgentClient.ClaudeCode]: 'claude-code',
    [AgentClient.Cursor]: 'cursor',
    [AgentClient.Codex]: 'codex',
  }[client as string] as keyof typeof agentMarks | undefined;
  const mark = key ? agentMarks[key] : undefined;

  if (!mark) {
    return null;
  }

  return (
    <span
      className="flex size-6 items-center justify-center rounded-6"
      style={{ background: mark.tile, color: '#fff' }}
    >
      <svg
        viewBox={mark.glyph.viewBox}
        className="size-4"
        fill="currentColor"
        aria-hidden
      >
        {mark.glyph.paths.map((d) => (
          <path key={d} d={d} fillRule="evenodd" />
        ))}
      </svg>
    </span>
  );
};

/* ----- Step 1: account ----- */

export enum AccountView {
  Options = 'options',
  Email = 'email',
  Code = 'code',
  LogIn = 'login',
  LogInEmail = 'login-email',
  Reset = 'reset',
  ResetSent = 'reset-sent',
}

export const AgentRow = (): ReactElement => (
  <span className="flex items-center gap-1.5">
    {[AgentClient.ClaudeCode, AgentClient.Cursor, AgentClient.Codex].map(
      (client) => (
        <AgentMark key={client} client={client} />
      ),
    )}
    <span className="text-text-tertiary typo-footnote">or any MCP agent</span>
  </span>
);

// Every way in is the same white button with the same size of icon, as on the
// sign-up pop-up (AuthDefault).
const ProviderButtons = ({
  onNext,
  onEmail,
  isBusy,
  isLogIn,
}: {
  onNext: () => void;
  onEmail: () => void;
  isBusy?: boolean;
  /** Existing accounts may have signed up with any of the four. */
  isLogIn?: boolean;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    {(isLogIn
      ? [
          providerMap.github,
          providerMap.google,
          providerMap.apple,
          providerMap.facebook,
        ]
      : [providerMap.github, providerMap.google]
    ).map(({ icon, label }, index) => (
      <Button
        key={label}
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        className={primary}
        icon={cloneElement(icon, { size: IconSize.XSmall, secondary: true })}
        loading={isBusy && index === 0}
        disabled={isBusy}
        onClick={onNext}
      >
        {`Continue with ${label}`}
      </Button>
    ))}
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Large}
      className={primary}
      icon={<MailIcon secondary size={IconSize.XSmall} />}
      disabled={isBusy}
      onClick={onEmail}
    >
      Continue with email
    </Button>
  </div>
);

const BackLink = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}): ReactElement => (
  // Above the form's first line, taking no room, so that line doesn't move.
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
      onClick={onClick}
    >
      {label}
    </Button>
  </div>
);

/** All the options in one cell, so the tallest sets the height and swapping them moves nothing. */
const Stacked = <T extends string>({
  options,
  current,
  children,
}: {
  options: readonly T[];
  current: T;
  children: (option: T) => ReactNode;
}): ReactElement => (
  <div className="grid">
    {options.map((option) => (
      <div
        key={option}
        aria-hidden={option !== current}
        style={{
          gridArea: '1 / 1',
          visibility: option === current ? 'visible' : 'hidden',
        }}
      >
        {children(option)}
      </div>
    ))}
  </div>
);

const MailMark = (): ReactElement => (
  <MailIcon
    aria-hidden
    className="text-text-primary"
    size={IconSize.XXLarge}
    style={{ marginBottom: -12, marginLeft: -8 }}
  />
);

const Legal = (): ReactElement => (
  <SignupDisclaimer className="!text-left !text-text-tertiary" />
);

// Keeps the line a field's error will use, so an error doesn't push the form down.
const NO_HINT = '\u00A0';
// A password field with room for its strength line or error.
const PASSWORD_HEIGHT = 68;

export const AccountScreen = ({
  initialView = AccountView.Options,
  onNext = () => undefined,
  panel,
  emailError,
  codeError,
  logInError,
  socialBusy,
  socialError,
  nameError,
}: {
  socialBusy?: boolean;
  socialError?: string;
  nameError?: string;
  emailError?: string;
  codeError?: string;
  logInError?: string;
  /** What fills the box. Defaults to the crew and the one line. */
  panel?: ReactNode;
  initialView?: AccountView;
  onNext?: () => void;
}): ReactElement => {
  const [view, setView] = useState(initialView);
  const [email, setEmail] = useState('founder@acme.dev');
  const backTo: Partial<Record<AccountView, [string, AccountView]>> = {
    [AccountView.Email]: ['Other options', AccountView.Options],
    [AccountView.Code]: ['Change email', AccountView.Email],
    [AccountView.LogInEmail]: ['Other options', AccountView.LogIn],
    [AccountView.Reset]: ['Back to log in', AccountView.LogInEmail],
    [AccountView.ResetSent]: ['Back to log in', AccountView.LogInEmail],
  };
  const back = backTo[view];

  return (
    <Shell
      current={StepId.Account}
      aside={panel ?? <CrewLinePanel />}
      asideClassName="hidden laptop:block"
      isFullBleed
      stageFill={StageFill.Surface}
      isPhoneWall={view === AccountView.Options}
      phoneBack={back && { label: back[0], onClick: () => setView(back[1]) }}
    >
      <FormColumn>
        {view === AccountView.Options && (
          <>
            <Title
              title="Create your account"
              description="Create your company page and pick a plan on daily.dev for Startups."
            />
            <ProviderButtons
              onNext={onNext}
              onEmail={() => setView(AccountView.Email)}
              isBusy={socialBusy}
            />
            <div className="flex flex-wrap items-center gap-1 text-text-secondary typo-callout">
              Already have an account?
              <ClickableText
                inverseUnderline
                onClick={() => setView(AccountView.LogIn)}
              >
                Log in
              </ClickableText>
            </div>
            <Legal />
            {socialError && (
              <p
                role="alert"
                className="rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3 typo-callout"
              >
                {socialError}
              </p>
            )}
          </>
        )}
        {view === AccountView.Email && (
          <>
            <BackLink
              label="Other options"
              onClick={() => setView(AccountView.Options)}
            />
            <Title title="Create your account" />
            <form
              className="flex flex-col gap-1"
              onSubmit={(event) => {
                event.preventDefault();
                setView(AccountView.Code);
              }}
            >
              <TextField
                inputId="onboarding-email"
                name="email"
                type="email"
                autoComplete="email"
                label="Work email"
                leftIcon={<MailIcon aria-hidden />}
                value={email}
                valueChanged={setEmail}
                valid={emailError ? false : undefined}
                hint={emailError ?? NO_HINT}
                className={{ container: 'w-full' }}
              />
              <TextField
                inputId="onboarding-name"
                name="name"
                autoComplete="name"
                label="Your name"
                leftIcon={<UserIcon aria-hidden />}
                valid={nameError ? false : undefined}
                hint={nameError ?? NO_HINT}
                className={{ container: 'w-full' }}
              />
              <div style={{ minHeight: PASSWORD_HEIGHT }}>
                <PasswordField
                  inputId="onboarding-password"
                  name="password"
                  label="Create a password"
                  autoComplete="new-password"
                  showStrength
                  className={{ container: 'w-full' }}
                />
              </div>
              <div className="mt-2">
                <Cta>
                  <Button
                    type="submit"
                    variant={ButtonVariant.Primary}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </Cta>
              </div>
            </form>
            <Legal />
          </>
        )}
        {view === AccountView.Code && (
          <>
            <MailMark />
            <Title
              title="Check your email"
              description={
                <>
                  We sent a 6-digit code to{' '}
                  <span className="font-bold text-text-primary">{email}</span>.
                  Check your spam folder if it isn&apos;t there.
                </>
              }
            />
            <div className="flex flex-col gap-2">
              <CodeField onSubmit={onNext} invalid={!!codeError} />
              <p
                role="alert"
                className="text-status-error typo-footnote"
                style={{ minHeight: 18 }}
              >
                {codeError}
              </p>
            </div>
            {/* The same help as the production code step (EmailCodeVerification). */}
            <div
              className="flex flex-col gap-1 text-text-tertiary typo-callout"
              style={{ marginTop: -12 }}
            >
              <p>Didn&apos;t get a verification code?</p>
              <p className="tabular-nums text-text-disabled">Resend code 52s</p>
              <p className="pt-1">
                Wrong email?{' '}
                <button
                  type="button"
                  className="text-text-link"
                  onClick={() => setView(AccountView.Email)}
                >
                  Change email
                </button>
              </p>
            </div>
            <Cta>
              <Button
                variant={ButtonVariant.Primary}
                className="flex-1"
                onClick={onNext}
              >
                Verify
              </Button>
            </Cta>
          </>
        )}
        {view === AccountView.LogIn && (
          <>
            <Title
              title="Welcome back"
              description="Log in, then pick the page this plan is for."
            />
            <ProviderButtons
              onNext={onNext}
              onEmail={() => setView(AccountView.LogInEmail)}
              isLogIn
            />
            <div className="flex flex-wrap items-center gap-1 text-text-secondary typo-callout">
              New to daily.dev?
              <ClickableText
                inverseUnderline
                onClick={() => setView(AccountView.Options)}
              >
                Sign up
              </ClickableText>
            </div>
          </>
        )}
        {view === AccountView.LogInEmail && (
          <>
            <BackLink
              label="Other options"
              onClick={() => setView(AccountView.LogIn)}
            />
            <Title
              title="Log in with email"
              description="Then pick the page this plan is for."
            />
            <div className="flex flex-col gap-1">
              <TextField
                inputId="onboarding-login-email"
                name="identifier"
                type="email"
                autoComplete="username"
                label="Email"
                leftIcon={<MailIcon aria-hidden />}
                hint={NO_HINT}
                className={{ container: 'w-full' }}
              />
              <div style={{ minHeight: PASSWORD_HEIGHT }}>
                <PasswordField
                  inputId="onboarding-login-password"
                  name="password"
                  label="Password"
                  autoComplete="current-password"
                  showStrength={false}
                  valid={logInError ? false : undefined}
                  hint={logInError}
                  className={{ container: 'w-full' }}
                />
              </div>
              <div className="mt-2">
                <Cta>
                  <Button
                    variant={ButtonVariant.Primary}
                    className="flex-1"
                    onClick={onNext}
                  >
                    Log in
                  </Button>
                </Cta>
              </div>
            </div>
            <ClickableText
              inverseUnderline
              className="self-start text-text-secondary typo-callout"
              onClick={() => setView(AccountView.Reset)}
            >
              Forgot password?
            </ClickableText>
          </>
        )}
        {view === AccountView.Reset && (
          <>
            <BackLink
              label="Back to log in"
              onClick={() => setView(AccountView.LogInEmail)}
            />
            <Title
              title="Reset your password"
              description="We'll email you a link to set a new one."
            />
            <TextField
              inputId="onboarding-reset-email"
              name="email"
              type="email"
              autoComplete="email"
              label="Email"
              leftIcon={<MailIcon aria-hidden />}
              value={email}
              valueChanged={setEmail}
              className={{ container: 'w-full' }}
            />
            <Cta>
              <Button
                variant={ButtonVariant.Primary}
                className="flex-1"
                onClick={() => setView(AccountView.ResetSent)}
              >
                Send reset link
              </Button>
            </Cta>
          </>
        )}
        {view === AccountView.ResetSent && (
          <>
            <BackLink
              label="Back to log in"
              onClick={() => setView(AccountView.LogInEmail)}
            />
            <MailMark />
            <Title
              title="Check your email"
              description={
                <>
                  We sent a reset link to{' '}
                  <span className="font-bold text-text-primary">{email}</span>.
                  Open it, then come back to finish.
                </>
              }
            />
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Large}
              className={primary}
              onClick={() => setView(AccountView.Reset)}
            >
              Didn&apos;t receive it? Try again
            </Button>
          </>
        )}
      </FormColumn>
    </Shell>
  );
};

/* ----- Step 2: company page ----- */

export interface ExistingPage {
  name: string;
  handle: string;
  planTitle?: string;
  image?: string;
}

const PageRow = ({
  isSelected,
  onClick,
  title,
  subtitle,
  avatar,
  planTitle,
}: {
  /** Already paid for. Says so on the row, with the detail on hover. */
  planTitle?: string;
  isSelected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  avatar: ReactNode;
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
    {avatar}
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="font-bold typo-callout">{title}</span>
      {subtitle && (
        <span className="text-text-tertiary typo-footnote">{subtitle}</span>
      )}
    </span>
    {planTitle && (
      <Tooltip
        content={`${title} is already on ${planTitle}, so there's nothing to pay for.`}
      >
        <span className="shrink-0 rounded-8 bg-surface-float px-2 py-0.5 font-bold text-text-secondary typo-caption1">
          {`On ${planTitle}`}
        </span>
      </Tooltip>
    )}
  </button>
);

const CompanyAvatar = ({
  name,
  image,
}: {
  name: string;
  image?: string;
}): ReactElement =>
  image ? (
    <img src={image} alt="" className="size-10 shrink-0 rounded-full" />
  ) : (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-float font-bold">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );

export const CompanyScreen = ({
  initialName = '',
  existing = [],
  error,
  isBusy,
  isCentered,
  onNext = () => undefined,
  isChecking,
  isCreatingNew,
  Visual = StuntVisual,
}: {
  /** What fills the box, reacting to the name. */
  Visual?: (props: { name: string }) => ReactElement;
  /** Someone with pages has started typing a new one. */
  isCreatingNew?: boolean;
  /** Looking up whether the selected squad already has a plan. */
  isChecking?: boolean;
  /** The plain single-column direction, with no preview. */
  isCentered?: boolean;
  initialName?: string;
  existing?: ExistingPage[];
  error?: string;
  isBusy?: boolean;
  onNext?: (name: string) => void;
}): ReactElement => {
  const [name, setName] = useState(initialName);
  const [selected, setSelected] = useState<string | null>(
    isCreatingNew ? null : (existing[0]?.handle ?? null),
  );
  const page = existing.find(({ handle }) => handle === selected);
  const shownName = page?.name ?? name;
  const [isMissing, setMissing] = useState(false);
  const fieldError =
    error ??
    (isMissing && !name.trim() ? 'Add a name to continue.' : undefined);

  return (
    <Shell
      current={StepId.Company}
      isCentered={isCentered}
      isTall={existing.length > 3}
      asideClassName="hidden laptop:block"
      isFullBleed
      stageFill={StageFill.Surface}
      aside={<Visual name={shownName} />}
    >
      <FormColumn>
        <Title
          title={
            existing.length ? 'Which page is this for?' : 'Name your company'
          }
          description="It becomes your page on daily.dev, where your posts live."
        />
        {existing.length > 0 && (
          <div role="radiogroup" className="flex flex-col gap-2">
            {existing.map((option) => (
              <PageRow
                key={option.handle}
                isSelected={selected === option.handle}
                onClick={() => setSelected(option.handle)}
                title={option.name}
                subtitle={`@${option.handle}`}
                planTitle={option.planTitle}
                avatar={
                  <CompanyAvatar name={option.name} image={option.image} />
                }
              />
            ))}
          </div>
        )}
        {/* Always here, so choosing to create one moves nothing. */}
        <div className="flex flex-col gap-1">
          <div onFocusCapture={() => setSelected(null)}>
            <TextField
              autoFocus={!existing.length || isCreatingNew}
              inputId="onboarding-company"
              name="name"
              autoComplete="organization"
              label={existing.length ? 'Or create a new page' : 'Company name'}
              leftIcon={
                existing.length ? (
                  <PlusIcon aria-hidden />
                ) : (
                  <SquadIcon aria-hidden />
                )
              }
              value={name}
              valueChanged={setName}
              valid={fieldError ? false : undefined}
              hint={
                fieldError ??
                (name.trim()
                  ? `Your page: daily.dev/squads/${toSquadHandle(name)}`
                  : NO_HINT)
              }
              className={{ container: 'w-full' }}
            />
          </div>
          <div className="mt-2">
            {page?.planTitle ? (
              <Cta current={StepId.Company}>
                <Button variant={ButtonVariant.Primary} className="flex-1">
                  Manage subscription
                </Button>
              </Cta>
            ) : (
              <Cta current={StepId.Company}>
                <Button
                  variant={ButtonVariant.Primary}
                  className="flex-1"
                  loading={isBusy || isChecking}
                  disabled={isBusy || isChecking}
                  onClick={() => {
                    if (selected === null && !name.trim()) {
                      setMissing(true);
                      return;
                    }

                    onNext(shownName);
                  }}
                >
                  Continue
                </Button>
              </Cta>
            )}
          </div>
        </div>
      </FormColumn>
    </Shell>
  );
};

/* ----- Step 3: plan and payment ----- */

const Cashback = ({ plan }: { plan: SquadPlan }): ReactElement => (
  <span className="flex items-center gap-1.5 text-text-secondary typo-footnote">
    <CoreIcon size={IconSize.Size16} className="shrink-0" />
    {`${SQUAD_PLAN_CASHBACK_PERCENTAGE[plan]}% cashback to boost your posts`}
  </span>
);

const PlanOption = ({
  plan,
  isSelected,
  onClick,
}: {
  plan: SquadPlan;
  isSelected: boolean;
  onClick: () => void;
}): ReactElement => {
  const details = squadPlanDetails[plan];

  return (
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
        <span className="font-bold typo-title3">{details.title}</span>
        {plan === SquadPlan.Starter && (
          <span className="rounded-8 bg-accent-cabbage-flat px-2 py-0.5 font-bold text-accent-cabbage-default typo-caption1">
            Recommended
          </span>
        )}
        <span className="ml-auto whitespace-nowrap">
          <span className="font-bold tabular-nums typo-title3">
            {planPrices[plan]}
          </span>
          <span className="text-text-tertiary typo-footnote"> / month</span>
        </span>
      </span>
      <Cashback plan={plan} />
      <span className="text-text-tertiary typo-footnote">
        {details.tagline}
      </span>
    </button>
  );
};

/** One box under the plans, so choosing a plan changes its words and moves nothing. */
const PlanIncludes = ({ plan }: { plan: SquadPlan }): ReactElement => (
  <Stacked options={squadPlans} current={plan}>
    {(option) => (
      <ul className="flex flex-col gap-1.5 px-1">
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
    )}
  </Stacked>
);

export enum PaddleState {
  Ready = 'ready',
  Loading = 'loading',
  Failed = 'failed',
}

/** A stand-in for Paddle's inline frame, which we don't build or restyle here. */
export const PaddleStandIn = ({
  onPay,
  state = PaddleState.Ready,
}: {
  onPay?: () => void;
  state?: PaddleState;
}): ReactElement => {
  if (state === PaddleState.Failed) {
    return (
      <CharmEmptyState
        placement={CharmEmptyStatePlacement.Inline}
        className="my-auto"
        image={cloudinaryCharmSomethingWentWrong}
        imageAlt="daily.dev charm with something gone wrong"
        title="The payment form didn't load"
        description="An ad blocker or a network filter usually causes this. You haven't been charged, and your company page and plan choice are saved."
        action={{ label: 'Try again', onClick: () => undefined }}
      />
    );
  }

  if (state === PaddleState.Loading) {
    return (
      <div className="flex flex-1 flex-col gap-3" aria-busy>
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-16 rounded-10" />
          <Skeleton className="h-16 rounded-10" />
        </div>
        <Skeleton className="h-14 rounded-10" />
        <Skeleton className="h-14 rounded-10" />
        <span className="flex-1" />
        <Skeleton className="h-12 rounded-14" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <p className="text-text-tertiary typo-caption1">
        Stand-in for the Paddle frame
      </p>
      <div className="grid grid-cols-2 gap-2">
        <span className="flex h-16 items-center gap-2 rounded-10 border border-accent-cabbage-default px-3 typo-footnote">
          <CreditCardIcon size={IconSize.Small} /> Card
        </span>
        <span className="flex h-16 items-center rounded-10 border border-border-subtlest-tertiary px-3 text-text-tertiary typo-footnote">
          PayPal
        </span>
      </div>
      {['Name on card', 'Card number'].map((field) => (
        <span
          key={field}
          className="flex h-14 items-center rounded-10 border border-border-subtlest-tertiary bg-surface-float px-3 text-text-tertiary typo-footnote"
        >
          {field}
        </span>
      ))}
      <div className="grid grid-cols-2 gap-2">
        {['MM / YY', 'CVC'].map((field) => (
          <span
            key={field}
            className="flex h-14 items-center rounded-10 border border-border-subtlest-tertiary bg-surface-float px-3 text-text-tertiary typo-footnote"
          >
            {field}
          </span>
        ))}
      </div>
      <span className="flex-1" />
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        className="w-full"
        onClick={onPay}
      >
        Subscribe now
      </Button>
      <p className="text-text-tertiary typo-caption1">
        Paddle handles the payment and appears on your statement.
      </p>
    </div>
  );
};

const PaymentPanel = ({
  company,
  plan,
  onChangePhone,
  onPay,
  paddleState,
  discount,
}: {
  discount?: boolean;
  paddleState?: PaddleState;
  company: string;
  plan: SquadPlan;
  onChangePhone: () => void;
  onPay?: () => void;
}): ReactElement => (
  <div className="startups-pay flex w-full flex-col gap-6">
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="font-bold typo-title2">Payment</h2>
        <p className="text-text-secondary typo-callout">{company}</p>
      </div>
      <Button
        className="laptop:hidden"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        onClick={onChangePhone}
      >
        Change
      </Button>
    </div>
    <dl className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-4 typo-callout">
      <div className="flex justify-between gap-3">
        <dt className="text-text-secondary">
          {`${squadPlanDetails[plan].title} plan`}
        </dt>
        <dd className="tabular-nums">{planPrices[plan]}</dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt className="text-text-secondary">Includes</dt>
        <dd className="text-text-tertiary">
          {`${SQUAD_PLAN_SEATS[plan]} ${SQUAD_PLAN_SEATS[plan] === 1 ? 'seat' : 'seats'}, ${SQUAD_PLAN_CASHBACK_PERCENTAGE[plan]}% cashback`}
        </dd>
      </div>
      {discount && (
        <div className="flex justify-between gap-3">
          <dt className="text-text-secondary">Discount</dt>
          <dd className="tabular-nums">{`-${planPrices[plan]}`}</dd>
        </div>
      )}
      <div className="flex justify-between gap-3">
        <dt className="text-text-secondary">Tax</dt>
        <dd className="text-text-tertiary">Added by Paddle for your country</dd>
      </div>
      <div className="flex justify-between gap-3 border-t border-border-subtlest-tertiary pt-2 font-bold">
        <dt>Due today</dt>
        <dd className="tabular-nums">{discount ? '$0' : planPrices[plan]}</dd>
      </div>
      <p className="text-text-tertiary typo-footnote">
        Renews every month. Cancel any time, your page and posts stay.
      </p>
    </dl>
    <div className="flex flex-1 flex-col">
      <PaddleStandIn onPay={onPay} state={paddleState} />
    </div>
  </div>
);

export const PlanScreen = ({
  company = 'Acme',
  initialPlan = SquadPlan.Starter,
  isPhonePaying = false,
  paddleState,
  discount,
  onPaid = () => undefined,
}: {
  discount?: boolean;
  paddleState?: PaddleState;
  company?: string;
  initialPlan?: SquadPlan;
  /** Phones split the step in two: choose, then pay. */
  isPhonePaying?: boolean;
  onPaid?: (plan: SquadPlan) => void;
}): ReactElement => {
  const [plan, setPlan] = useState(initialPlan);
  const [isPaying, setPaying] = useState(isPhonePaying);

  return (
    <Shell
      current={StepId.Plan}
      isTall
      asideClassName={classNames(!isPaying && 'hidden laptop:block')}
      isPlainOnPhone
      isFullBleed
      stageFill={StageFill.Surface}
      aside={
        <PaymentPanel
          company={company}
          plan={plan}
          onChangePhone={() => setPaying(false)}
          onPay={() => onPaid(plan)}
          paddleState={paddleState}
          discount={discount}
        />
      }
    >
      <div
        className={classNames(
          'flex flex-col gap-6',
          isPaying && 'hidden laptop:flex',
        )}
      >
        <Title
          title={`Choose a plan for ${company}`}
          description="Billed monthly. Cancel any time, your page and posts stay."
        />
        <div role="radiogroup" className="flex flex-col gap-3">
          {squadPlans.map((option) => (
            <PlanOption
              key={option}
              plan={option}
              isSelected={option === plan}
              onClick={() => setPlan(option)}
            />
          ))}
        </div>
        <PlanIncludes plan={plan} />
        <div className="laptop:hidden">
          <Cta>
            <Button
              variant={ButtonVariant.Primary}
              className="flex-1"
              onClick={() => setPaying(true)}
            >
              {`Continue with ${squadPlanDetails[plan].title}`}
            </Button>
          </Cta>
        </div>
        <Button
          tag="a"
          href="#enterprise"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          className="-ml-2 self-start"
          icon={<OpenLinkIcon />}
        >
          Need more? Talk to us about Enterprise
        </Button>
      </div>
    </Shell>
  );
};

/* ----- After paying ----- */

enum StatusState {
  Done = 'done',
  Working = 'working',
  Waiting = 'waiting',
}

const StatusLine = ({
  state,
  children,
}: {
  state: StatusState;
  children: ReactNode;
}): ReactElement => (
  <li className="flex items-center gap-3 typo-callout">
    <span className="flex size-6 shrink-0 items-center justify-center">
      {state === StatusState.Done && (
        <VIcon className="text-accent-avocado-default" secondary />
      )}
      {state === StatusState.Working && <Loader />}
      {state === StatusState.Waiting && (
        <span className="size-5 rounded-full border border-dashed border-border-subtlest-secondary" />
      )}
    </span>
    <span
      className={classNames(
        'min-w-0 flex-1',
        state === StatusState.Waiting
          ? 'text-text-tertiary'
          : 'text-text-primary',
      )}
    >
      {children}
    </span>
  </li>
);

/** The stepper's Plan chip says the plan this screen is on. */
const WithPlanChip = ({
  plan,
  children,
}: {
  plan: SquadPlan;
  children: ReactNode;
}): ReactElement => {
  const progress = useContext(ProgressContext);

  return (
    <ProgressContext.Provider
      value={{
        ...progress,
        answers: {
          ...progress.answers,
          [StepId.Plan]: squadPlanDetails[plan].title,
        },
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

const ACTIVATING_STEP_MS = 900;

/** All the steps from the start, ticking off, so there's always a next thing. */
export const ActivatingScreen = ({
  company = 'Acme',
  plan = SquadPlan.Starter,
  isSlow,
  initialDone = 1,
  isStill,
}: {
  company?: string;
  plan?: SquadPlan;
  isSlow?: boolean;
  initialDone?: number;
  /** Stay on one moment, for showing it on its own. */
  isStill?: boolean;
}): ReactElement => {
  const [doneCount, setDoneCount] = useState(initialDone);
  const lines = [
    'Payment received',
    `Switching on ${squadPlanDetails[plan].title}`,
    'Turning on your cashback',
    `Getting ${company}'s page ready`,
  ];

  useEffect(() => {
    if (isSlow || isStill || doneCount >= lines.length) {
      return undefined;
    }

    const timeout = setTimeout(
      () => setDoneCount(doneCount + 1),
      ACTIVATING_STEP_MS,
    );

    return () => clearTimeout(timeout);
  }, [doneCount, isSlow, isStill, lines.length]);

  const getState = (index: number): StatusState => {
    if (index < doneCount) {
      return StatusState.Done;
    }

    return index === doneCount ? StatusState.Working : StatusState.Waiting;
  };

  return (
    <WithPlanChip plan={plan}>
      <Shell
        current={StepId.Setup}
        asideClassName="hidden laptop:block"
        isFullBleed
        stageFill={StageFill.Surface}
        aside={<StuntVisual name={company} />}
      >
        <FormColumn>
          <Title
            title={isSlow ? 'Payment received' : `Setting up ${company}…`}
            description={
              isSlow
                ? `Your ${squadPlanDetails[plan].title} plan is taking longer than usual to switch on. You don't need to pay again or stay on this page. It will show on ${company} in a few minutes, and we'll email you the receipt.`
                : 'Your payment went through. This takes a few seconds.'
            }
          />
          <ul className="flex flex-col gap-3">
            {lines.map((line, index) => (
              <StatusLine key={line} state={getState(index)}>
                {line}
              </StatusLine>
            ))}
          </ul>
          {isSlow && (
            <Button variant={ButtonVariant.Secondary} className="self-start">
              Go to your page
            </Button>
          )}
        </FormColumn>
      </Shell>
    </WithPlanChip>
  );
};

export enum SetupPath {
  Agent = 'agent',
  Manual = 'manual',
}

/**
 * The code in its box, and what to do with it below the box. A fixed height keeps
 * every client the same size. Long text fades out at the cut, on its own, so the
 * fade can't show a different colour from the box behind it.
 */
const CopyRow = ({
  text,
  label,
  height,
  isFaded,
  secondary,
}: {
  text: string;
  label: string;
  height: number;
  isFaded?: boolean;
  secondary?: ReactNode;
}): ReactElement => {
  const [isCopied, setCopied] = useState(false);
  const fade = 'linear-gradient(180deg, #000 55%, transparent)';

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float">
        <pre
          className={classNames(
            'whitespace-pre-wrap break-words p-4 font-mono text-text-secondary typo-footnote',
            isFaded ? 'overflow-hidden' : 'overflow-y-auto',
          )}
          style={{
            height,
            maskImage: isFaded ? fade : undefined,
            WebkitMaskImage: isFaded ? fade : undefined,
          }}
        >
          {text}
        </pre>
      </div>
      <div className="flex gap-2">
        <Button
          variant={ButtonVariant.Primary}
          className="min-w-0 flex-1"
          icon={isCopied ? <VIcon /> : <CopyIcon />}
          onClick={() => setCopied(true)}
        >
          {isCopied ? 'Copied' : label}
        </Button>
        {secondary}
      </div>
    </div>
  );
};

/** What the page has so far. Today this comes from the squad's own data. */
export interface SetupProgress {
  details?: boolean;
  links?: boolean;
  product?: boolean;
  cta?: boolean;
  seats?: boolean;
}

export const everythingDone: SetupProgress = {
  details: true,
  links: true,
  product: true,
  cta: true,
  seats: true,
};

interface SetupRow {
  id: string;
  title: string;
  description: string;
  isDone?: boolean;
  /** Counts towards "2 of 5": the agent and intel rows don't. */
  isCounted?: boolean;
  cta?: string;
  badge?: string;
  isAgentLink?: boolean;
}

// Every row of today's StartupsSetup, with the same words and rules.
const getSetupRows = (plan: SquadPlan, done: SetupProgress): SetupRow[] => {
  const isTeam = plan === SquadPlan.Team;
  const rows: (SetupRow | false)[] = [
    {
      id: 'details',
      title: 'Logo and description',
      description: 'Say what you build and for which developers.',
      isDone: done.details,
      isCounted: true,
      cta: 'Edit page',
    },
    {
      id: 'links',
      title: 'Website and links',
      description: 'Your site, docs, GitHub and changelog on the page.',
      isDone: done.links,
      isCounted: true,
      cta: 'Add links',
    },
    {
      id: 'product',
      title: 'Your product',
      description: 'A card with its tagline, pricing and link.',
      isDone: done.product,
      isCounted: true,
      cta: 'Add product',
    },
    isTeam && {
      id: 'cta',
      title: 'A CTA on your page header',
      description: 'Send developers to sign up, your docs or a demo.',
      isDone: done.cta,
      isCounted: true,
      cta: 'Add CTA',
    },
    isTeam && {
      id: 'seats',
      title: 'Give your team seats',
      description: `${SQUAD_PLAN_SEATS[plan]} seats, each can post and boost through the API.`,
      isDone: done.seats,
      isCounted: true,
      cta: 'Give seats',
    },
    {
      id: 'agent',
      title: 'Connect your agent',
      description: 'Post and boost from Claude Code, Cursor or Codex.',
      cta: 'Show me',
      isAgentLink: true,
    },
    {
      id: 'intel',
      title: `Weekly intel on up to ${SQUAD_PLAN_INTEL_TOPICS[plan]} topics`,
      description: 'What developers read and discuss in your space.',
      cta: 'Pick topics',
    },
    {
      id: 'cashback',
      title: `${SQUAD_PLAN_CASHBACK_PERCENTAGE[plan]}% cashback`,
      description:
        'Lands in your page wallet every month, to boost your posts.',
      isDone: true,
    },
  ];

  return rows.filter((row): row is SetupRow => !!row);
};

const countDone = (rows: SetupRow[]): [number, number] => {
  const counted = rows.filter(({ isCounted }) => isCounted);

  return [counted.filter(({ isDone }) => isDone).length, counted.length];
};

const RowCheck = ({ isDone }: { isDone?: boolean }): ReactElement => (
  <span
    className={classNames(
      'flex size-6 shrink-0 items-center justify-center rounded-full',
    )}
    style={
      isDone
        ? { background: '#D8B4FE', color: '#111827' }
        : {
            boxShadow:
              'inset 0 0 0 1.5px var(--theme-border-subtlest-secondary)',
          }
    }
  >
    {isDone && <VIcon size={IconSize.Size16} secondary />}
  </span>
);

const ManualSetup = ({
  rows,
  onShowAgent,
  onAdd,
  isChecking,
}: {
  /** The words are known, but not yet which rows are done. */
  isChecking?: boolean;
  rows: SetupRow[];
  onShowAgent: () => void;
  onAdd?: (id: string) => void;
}): ReactElement => {
  const [done, total] = countDone(rows);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <p className="flex justify-between typo-footnote">
          <span className="font-bold">Your page</span>
          {isChecking ? (
            <Skeleton className="h-4 w-16 rounded-6" />
          ) : (
            <span className="tabular-nums text-text-tertiary">
              {`${done} of ${total} done`}
            </span>
          )}
        </p>
        <div className="h-1 w-full overflow-hidden rounded-50 bg-border-subtlest-tertiary">
          <div
            className="h-full rounded-50"
            style={{
              background: '#D8B4FE',
              width: `${(done / total) * 100}%`,
              transition: 'width .4s ease',
            }}
          />
        </div>
      </div>
      <ul className="flex flex-col">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center gap-3 border-t border-border-subtlest-tertiary py-3 first:border-t-0"
          >
            {isChecking ? (
              <Skeleton className="size-6 rounded-full" />
            ) : (
              <RowCheck isDone={row.isDone} />
            )}
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-bold typo-callout">{row.title}</span>
              <span className="text-pretty text-text-tertiary typo-footnote">
                {row.description}
              </span>
            </span>
            {row.badge && (
              <span className="shrink-0 rounded-8 bg-surface-float px-2 py-0.5 font-bold text-text-tertiary typo-caption1">
                {row.badge}
              </span>
            )}
            {row.cta && isChecking && (
              <Skeleton className="h-8 rounded-10" style={{ width: 104 }} />
            )}
            {row.cta && !isChecking && (
              <Button
                variant={
                  row.isDone ? ButtonVariant.Tertiary : ButtonVariant.Float
                }
                size={ButtonSize.Small}
                className="shrink-0"
                style={{ minWidth: 104 }}
                onClick={row.isAgentLink ? onShowAgent : () => onAdd?.(row.id)}
              >
                {row.isDone ? 'Edit' : row.cta}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <p className="text-text-tertiary typo-footnote">
        Your agent can do all of this through the daily.dev MCP server.
      </p>
    </div>
  );
};

const AgentSetup = ({
  company,
  plan,
  initialClient = AgentClient.ClaudeCode,
}: {
  company: string;
  plan: SquadPlan;
  initialClient?: AgentClient;
}): ReactElement => {
  const [client, setClient] = useState(initialClient);
  const prompt = getStartupsSetupPrompt({
    name: company,
    handle: toSquadHandle(company),
    plan,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="font-bold typo-callout">
          1. Connect daily.dev to your agent
        </p>
        <div
          role="tablist"
          aria-label="Your agent"
          className="flex flex-wrap gap-1.5"
        >
          {agentClients.map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={option === client}
              onClick={() => setClient(option)}
              className={classNames(
                'flex h-10 items-center gap-2 rounded-12 border px-3 font-bold typo-footnote',
                option === client
                  ? 'border-accent-cabbage-default bg-surface-float text-text-primary'
                  : 'border-border-subtlest-tertiary text-text-tertiary hover:text-text-primary',
              )}
            >
              <AgentMark client={option} />
              {agentClientSetup[option].label}
            </button>
          ))}
        </div>
        <Stacked options={agentClients} current={client}>
          {(option) => {
            const setup = agentClientSetup[option];

            return (
              <div className="flex flex-col gap-3">
                <CopyRow
                  text={setup.snippet}
                  label="Copy setup"
                  height={96}
                  secondary={
                    setup.installUrl && (
                      <Button
                        tag="a"
                        href={setup.installUrl}
                        target="_blank"
                        rel="noopener"
                        variant={ButtonVariant.Secondary}
                        className="min-w-0 flex-1 whitespace-nowrap"
                        icon={<OpenLinkIcon />}
                      >
                        {`Add to ${setup.label}`}
                      </Button>
                    )
                  }
                />
              </div>
            );
          }}
        </Stacked>
        <p
          className="text-pretty text-text-tertiary typo-footnote"
          style={{ minHeight: 36 }}
        >
          {agentClientSetup[client].note}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <p className="font-bold typo-callout">2. Paste this prompt</p>
        <p className="text-text-tertiary typo-footnote">
          Your agent sets up the page and your profile, picks your first post and boosts it, then schedules a daily report. It asks before it saves anything.
        </p>
        <CopyRow text={prompt} label="Copy prompt" height={136} isFaded />
      </div>
      <p className="text-text-tertiary typo-footnote">
        Prefer clicking? Everything here is in your page settings too.
      </p>
    </div>
  );
};

/** Both ways to set a page up, used after paying and in Manage › Subscription. */
export const SetupPanel = ({
  company,
  plan,
  initialPath = SetupPath.Agent,
  initialClient,
  done = {},
  onAdd,
  isChecking,
  onPathChange,
}: {
  /** Lets the screen remember the tab while a row's settings are open. */
  onPathChange?: (path: SetupPath) => void;
  isChecking?: boolean;
  company: string;
  plan: SquadPlan;
  initialPath?: SetupPath;
  initialClient?: AgentClient;
  done?: SetupProgress;
  onAdd?: (id: string) => void;
}): ReactElement => {
  const [path, setPathState] = useState(initialPath);
  const setPath = (next: SetupPath) => {
    setPathState(next);
    onPathChange?.(next);
  };
  const rows = getSetupRows(plan, done);

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tablist"
        aria-label="How to set it up"
        className="grid grid-cols-2 gap-1 rounded-14 bg-surface-float p-1"
      >
        {[
          [SetupPath.Agent, 'Use your agent'],
          [SetupPath.Manual, 'Do it yourself'],
        ].map(([option, label]) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={option === path}
            onClick={() => setPath(option as SetupPath)}
            className={classNames(
              'whitespace-nowrap rounded-10 px-3 py-2 font-bold typo-callout',
              option === path
                ? 'bg-background-default text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {path === SetupPath.Agent ? (
        <AgentSetup
          company={company}
          plan={plan}
          initialClient={initialClient}
        />
      ) : (
        <ManualSetup
          rows={rows}
          onShowAgent={() => setPath(SetupPath.Agent)}
          onAdd={onAdd}
          isChecking={isChecking}
        />
      )}
    </div>
  );
};

export const SetupScreen = ({
  company = 'Acme',
  plan = SquadPlan.Starter,
  initialPath = SetupPath.Agent,
  initialClient,
  done = {},
  isFinished,
  isLoading,
  isChecking,
  initialEditingId,
}: {
  /** A checklist row whose settings are open. */
  initialEditingId?: string;
  /** The checklist is still finding out which rows are done. */
  isChecking?: boolean;
  company?: string;
  plan?: SquadPlan;
  initialPath?: SetupPath;
  initialClient?: AgentClient;
  done?: SetupProgress;
  /** The agent has saved everything: the page is filled in. */
  isFinished?: boolean;
  /** The plan is on, and the page's details are still arriving. */
  isLoading?: boolean;
}): ReactElement => {
  const [added, setAdded] = useState<SetupProgress>(done);
  const shownDone = isFinished ? everythingDone : added;
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [editingId, setEditingId] = useState(initialEditingId);
  // On a phone the settings replace this screen, so coming back has to land on
  // the same tab, at the same place in the checklist.
  const [path, setPath] = useState(initialPath);
  const checklistScroll = useRef(0);
  const openRow = (id: string) => {
    checklistScroll.current = globalThis.scrollY;
    setEditingId(id);
  };

  useEffect(() => {
    if (!isLaptop) {
      globalThis.scrollTo({
        top: editingId ? 0 : checklistScroll.current,
        behavior: 'instant',
      });
    }
  }, [editingId, isLaptop]);
  const editing = editingId
    ? getSetupRows(plan, added).find(({ id }) => id === editingId)
    : undefined;
  const editor = editing && (
    <SetupEditor
      key={editing.id}
      rowId={editing.id}
      title={editing.title}
      company={company}
      isDone={editing.isDone}
      isPage={!isLaptop}
      onBack={() => setEditingId(undefined)}
      onSave={() => {
        setAdded((prev) => ({ ...prev, [editing.id]: true }));
        setEditingId(undefined);
      }}
    />
  );

  if (editor && !isLaptop) {
    return editor;
  }

  return (
    <WithPlanChip plan={plan}>
      <Shell
        current={StepId.Setup}
        isComplete={isFinished}
        isTall
        isFullBleed
        isPlainOnPhone
        stageFill={StageFill.Surface}
        aside={
          editor ?? (
            <FullPagePreview
              content={{
                name: company,
                plan,
                description: shownDone.details,
                links: shownDone.links,
                product: shownDone.product,
                cta: shownDone.cta,
                seats: shownDone.seats,
                post: isFinished,
              }}
            />
          )
        }
      >
        <Title
          title={
            isFinished
              ? `${company} is ready`
              : `You're in. ${company} is on ${squadPlanDetails[plan].title}.`
          }
          description={
            isFinished
              ? 'Your page is set up. Your agent can post and boost from here on.'
              : 'Your page is live. Set it up with your agent, or yourself.'
          }
        />
        {isFinished && (
          <img
            src="/startups-onboarding/crew-cheer.webp"
            alt=""
            className="h-24 self-start object-contain"
          />
        )}
        {isLoading && (
          <div className="flex flex-col gap-5" aria-busy>
            <Skeleton className="h-11 rounded-14" />
            <div className="flex flex-col gap-4">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="flex items-center gap-3">
                  <Skeleton className="size-6 rounded-full" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-1/2 rounded-6" />
                    <Skeleton className="h-3 w-5/6 rounded-6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isLoading && !isFinished && (
          <SetupPanel
            company={company}
            plan={plan}
            initialPath={path}
            onPathChange={setPath}
            initialClient={initialClient}
            done={added}
            isChecking={isChecking}
            onAdd={openRow}
          />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={isFinished ? ButtonVariant.Primary : ButtonVariant.Subtle}
            icon={<OpenLinkIcon size={IconSize.Size16} />}
            iconPosition={ButtonIconPosition.Right}
          >
            Open your page
          </Button>
        </div>
      </Shell>
    </WithPlanChip>
  );
};
