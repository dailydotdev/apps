import type { FormEvent, ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { TextField } from '../../../../components/fields/TextField';
import Textarea from '../../../../components/fields/Textarea';
import { Dropdown } from '../../../../components/fields/Dropdown';
import {
  ArrowIcon,
  AtIcon,
  OpenLinkIcon,
  PlusIcon,
  SquadIcon,
  VIcon,
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { HorizontalSeparator } from '../../../../components/utilities/common';
import { SquadImage } from '../../../../components/squads/SquadImage';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useSquadCategories } from '../../../../hooks/squads/useSquadCategories';
import { useSquadCreate } from '../../../../hooks/squads/useSquadCreate';
import { useSquad } from '../../../../hooks/squads/useSquad';
import { usePaddlePayment } from '../../../../hooks/usePaddlePayment';
import type { Squad } from '../../../../graphql/sources';
import { SourceMemberRole } from '../../../../graphql/sources';
import { PrivacyOption } from '../../../../graphql/squads';
import { PurchaseType } from '../../../../graphql/paddle';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { cloudinarySquadsImageFallback } from '../../../../lib/image';
import { webappUrl } from '../../../../lib/constants';
import { formToJson } from '../../../../lib/form';
import { RequestKey } from '../../../../lib/query';
import { LogEvent, Origin } from '../../../../lib/log';
import { getSquadManageUrl, SquadManageSection } from '../../lib/routes';
import { getSquadId } from '../../lib/features';
import {
  getSquadPlanPriceId,
  isSquadPlan,
  SQUAD_PLAN_SEATS,
  SquadPlan,
  squadPlanDetails,
  squadPlans,
  startupsEnterpriseUrl,
} from '../../lib/plans';
import { useSquadPlanPrices } from '../../hooks/useSquadPlanPrices';
import { useLogStartups } from '../../hooks/useLogStartups';
import { SquadUploadButton } from '../manage/SquadUploadButton';
import { StartupsSetup } from '../setup/StartupsSetup';
import {
  SquadPlanCard,
  SquadPlanCashback,
  SquadPlanPrice,
} from './SquadPlanCard';

export enum StartupsCheckoutStep {
  Company = 'company',
  Plan = 'plan',
  Checkout = 'checkout',
  Done = 'done',
}

const steps = [
  { id: StartupsCheckoutStep.Company, label: 'Company page' },
  { id: StartupsCheckoutStep.Plan, label: 'Plan' },
  { id: StartupsCheckoutStep.Checkout, label: 'Payment' },
];

// How long the done step waits for the payment webhook before it asks the
// buyer to check back
const ACTIVATION_POLL_MS = 2000;
const ACTIVATION_TIMEOUT_MS = 60000;

type CompanyChoice = Partial<Squad> &
  Pick<Squad, 'name' | 'handle'> & {
    id: string;
  };

const StepHeader = ({
  current,
}: {
  current: StartupsCheckoutStep;
}): ReactElement => {
  const currentIndex = steps.findIndex(({ id }) => id === current);

  return (
    <ol className="flex flex-wrap items-center gap-2">
      {steps.map((step, index) => {
        const isDone =
          current === StartupsCheckoutStep.Done || index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step.id} className="flex items-center gap-2">
            {index > 0 && (
              <span className="h-px w-6 bg-border-subtlest-tertiary" />
            )}
            <span
              className={classNames(
                'flex size-6 items-center justify-center rounded-full font-bold typo-caption1',
                isDone && 'bg-accent-avocado-default text-white',
                isCurrent && 'bg-text-primary text-surface-invert',
                !isDone && !isCurrent && 'bg-surface-float text-text-tertiary',
              )}
            >
              {isDone ? <VIcon size={IconSize.Size16} /> : index + 1}
            </span>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              bold={isCurrent}
              color={
                isCurrent ? TypographyColor.Primary : TypographyColor.Tertiary
              }
            >
              {step.label}
            </Typography>
          </li>
        );
      })}
    </ol>
  );
};

const StepTitle = ({
  title,
  description,
}: {
  title: string;
  description?: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-2">
    <Typography tag={TypographyTag.H1} type={TypographyType.Title2} bold>
      {title}
    </Typography>
    {description && (
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    )}
  </div>
);

const companyFormId = 'startups-company';

type CompanyFields = {
  name: string;
  handle: string;
  description: string;
};

const CompanyForm = ({
  onCreated,
}: {
  onCreated: (squad: Squad) => void;
}): ReactElement => {
  const [image, setImage] = useState<{ preview: string; file: File }>();
  const [handle, setHandle] = useState('');
  const [isHandleTouched, setHandleTouched] = useState(false);
  const [category, setCategory] = useState(-1);
  const [categoryHint, setCategoryHint] = useState<string>();
  const { data: categoryPages } = useSquadCategories();
  const categories = useMemo(
    () =>
      categoryPages?.pages
        .flatMap((page) => page.categories.edges)
        .map(({ node }) => node) ?? [],
    [categoryPages],
  );
  const { onCreateSquad, isLoading } = useSquadCreate({ onSuccess: onCreated });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = formToJson<CompanyFields>(event.currentTarget);

    if (!fields.name?.trim() || !fields.handle?.trim()) {
      return;
    }

    if (category === -1) {
      setCategoryHint('Pick the category developers would look under');
      return;
    }

    // A company page is public, and only its team posts to it
    onCreateSquad({
      name: fields.name.trim(),
      handle: fields.handle.trim(),
      description: fields.description?.trim(),
      file: image?.file,
      status: PrivacyOption.Public,
      categoryId: categories[category].id,
      memberPostingRole: SourceMemberRole.Moderator,
      memberInviteRole: SourceMemberRole.Member,
      moderationRequired: false,
    });
  };

  return (
    <form
      id={companyFormId}
      onSubmit={onSubmit}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0">
          <img
            src={image?.preview ?? cloudinarySquadsImageFallback}
            alt="Company logo"
            className="size-full rounded-full bg-background-default object-cover"
          />
          <SquadUploadButton
            label="logo"
            onFile={(preview, file) => setImage({ preview, file })}
            className="absolute inset-0 items-center justify-center"
          />
        </div>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Your logo, square, up to 2 MB. It shows on your page, your posts and
          in search.
        </Typography>
      </div>
      <TextField
        inputId="startups-company-name"
        name="name"
        label="Company name"
        leftIcon={<SquadIcon />}
        className={{ container: 'w-full' }}
        valueChanged={(value) => {
          if (!isHandleTouched) {
            setHandle(value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
          }
        }}
      />
      <TextField
        inputId="startups-company-handle"
        name="handle"
        label="Page handle"
        leftIcon={<AtIcon />}
        value={handle}
        valueChanged={(value) => {
          setHandle(value);
          setHandleTouched(true);
        }}
        hint={handle ? `daily.dev/squads/${handle}` : undefined}
        className={{ container: 'w-full' }}
      />
      <Textarea
        inputId="startups-company-description"
        name="description"
        label="What does your product do?"
        rows={3}
        maxLength={250}
      />
      <div className="flex flex-col gap-2">
        <Typography type={TypographyType.Callout} bold>
          Category
        </Typography>
        <Dropdown
          placeholder="Select category"
          className={{
            container: 'w-full tablet:w-64',
            button: categoryHint && 'border border-status-error',
          }}
          options={categories.map(({ title }) => title)}
          selectedIndex={category}
          onChange={(_, index) => {
            setCategory(index);
            setCategoryHint(undefined);
          }}
        />
        {categoryHint && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.StatusError}
          >
            {categoryHint}
          </Typography>
        )}
      </div>
      <Button
        type="submit"
        variant={ButtonVariant.Primary}
        loading={isLoading}
        disabled={isLoading}
        className="self-start"
      >
        Create and continue
      </Button>
    </form>
  );
};

const CompanyRow = ({
  company,
  isSelected,
  onClick,
  children,
}: {
  company?: CompanyChoice;
  isSelected: boolean;
  onClick: () => void;
  children?: ReactNode;
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
    {company ? (
      <SquadImage {...(company as Squad)} className="size-10 shrink-0" />
    ) : (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-float">
        <PlusIcon />
      </span>
    )}
    <span className="flex min-w-0 flex-1 flex-col">{children}</span>
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
  const isNew = !selected;
  const { data: subscription, isFetching } = useQuery(
    squadSubscriptionQueryOptions({ user, sourceId: selected?.id }),
  );
  const activePlan = selected && subscription?.plan;

  return (
    <div className="flex flex-col gap-6">
      <StepTitle
        title="Set up your company page"
        description="Your page on daily.dev is where your posts live. Developers find it in the feed and search, AI answers cite it, and your agent posts to it through the API."
      />
      {adminSquads.length > 0 && (
        <div role="radiogroup" className="flex flex-col gap-2">
          {adminSquads.map((squad) => (
            <CompanyRow
              key={squad.id}
              company={squad}
              isSelected={squad.id === selectedId}
              onClick={() => onSelect(squad.id)}
            >
              <Typography type={TypographyType.Callout} bold truncate>
                {squad.name}
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                truncate
              >
                {`Use @${squad.handle}`}
              </Typography>
            </CompanyRow>
          ))}
          <CompanyRow isSelected={isNew} onClick={() => onSelect(null)}>
            <Typography type={TypographyType.Callout} bold>
              Create a new company page
            </Typography>
          </CompanyRow>
        </div>
      )}
      {isNew ? (
        <CompanyForm
          onCreated={(squad) =>
            onContinue({ ...squad, id: getSquadId(squad) }, true)
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {activePlan && (
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              {`@${selected.handle} is already on ${squadPlanDetails[activePlan].title}. Manage it from the page's settings.`}
            </Typography>
          )}
          {activePlan ? (
            <Button
              tag="a"
              href={getSquadManageUrl(selected.handle, SquadManageSection.Plan)}
              variant={ButtonVariant.Secondary}
              className="self-start"
            >
              Manage plan
            </Button>
          ) : (
            <Button
              variant={ButtonVariant.Primary}
              className="self-start"
              loading={isFetching}
              disabled={isFetching}
              onClick={() => onContinue(selected, false)}
            >
              Continue
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const PlanStep = ({
  company,
  plan,
  onSelect,
  onContinue,
}: {
  company: CompanyChoice;
  plan: SquadPlan;
  onSelect: (plan: SquadPlan) => void;
  onContinue: () => void;
}): ReactElement => {
  const prices = useSquadPlanPrices();
  const logStartups = useLogStartups();

  return (
    <div className="flex flex-col gap-6">
      <StepTitle
        title={`Choose a plan for ${company.name}`}
        description="Billed monthly. Cancel any time, your page and posts stay."
      />
      <div role="radiogroup" className="grid gap-4 tablet:grid-cols-2">
        {squadPlans.map((option) => (
          <SquadPlanCard
            key={option}
            plan={option}
            price={prices[option]}
            badge={option === SquadPlan.Starter ? 'Recommended' : undefined}
            isSelected={option === plan}
            onClick={() => onSelect(option)}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
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
          icon={<OpenLinkIcon />}
          iconPosition={ButtonIconPosition.Right}
        >
          Need more? Talk to our team about Enterprise
        </Button>
        <Button variant={ButtonVariant.Primary} onClick={onContinue}>
          {`Continue with ${squadPlanDetails[plan].title}`}
        </Button>
      </div>
    </div>
  );
};

const OrderSummary = ({
  company,
  plan,
  onChangePlan,
}: {
  company: CompanyChoice;
  plan: SquadPlan;
  onChangePlan: () => void;
}): ReactElement => {
  const prices = useSquadPlanPrices();

  return (
    <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-5">
      <div className="flex items-center gap-3">
        <SquadImage {...(company as Squad)} className="size-10 shrink-0" />
        <span className="flex min-w-0 flex-col">
          <Typography type={TypographyType.Callout} bold truncate>
            {company.name}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            truncate
          >
            {`@${company.handle}`}
          </Typography>
        </span>
      </div>
      <HorizontalSeparator />
      <div className="flex items-start justify-between gap-2">
        <span className="flex flex-col gap-1">
          <Typography type={TypographyType.Body} bold>
            {`${squadPlanDetails[plan].title} plan`}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {SQUAD_PLAN_SEATS[plan] === 1
              ? '1 seat'
              : `${SQUAD_PLAN_SEATS[plan]} seats`}
          </Typography>
        </span>
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          onClick={onChangePlan}
        >
          Change
        </Button>
      </div>
      <SquadPlanPrice price={prices[plan]} />
      <SquadPlanCashback plan={plan} />
    </div>
  );
};

const CheckoutStep = ({
  company,
  plan,
  onChangePlan,
  onPaid,
}: {
  company: CompanyChoice;
  plan: SquadPlan;
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

  useEffect(() => {
    const priceId = getSquadPlanPriceId(plan);

    if (!isPaddleReady || openedRef.current === priceId) {
      return;
    }

    // A second call while the frame is open swaps the item in place
    openedRef.current = priceId;
    openCheckout({ priceId, customData: { source_id: company.id } });
  }, [company.id, isPaddleReady, openCheckout, plan]);

  return (
    <div className="flex flex-col gap-6">
      <StepTitle title="Payment" />
      <div className="flex flex-col gap-6 laptop:flex-row-reverse laptop:items-start">
        <div className="laptop:w-80 laptop:shrink-0">
          <OrderSummary
            company={company}
            plan={plan}
            onChangePlan={onChangePlan}
          />
        </div>
        <div className="checkout-container min-h-[31.25rem] min-w-0 flex-1" />
      </div>
    </div>
  );
};

const DoneStep = ({
  company,
  plan,
}: {
  company: CompanyChoice;
  plan: SquadPlan;
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

  if (!isActive) {
    return (
      <div className="flex flex-col gap-6">
        <StepTitle
          title={isTimedOut ? 'Payment received' : 'Setting up your page…'}
          description={
            isTimedOut
              ? `Your ${squadPlanDetails[plan].title} plan is taking longer than usual to switch on. It will show on ${company.name} in a few minutes, and we will email you the receipt.`
              : 'Your payment went through. This takes a few seconds.'
          }
        />
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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <StepTitle
        title={`${company.name} is on ${squadPlanDetails[plan].title}`}
        description="Your company page is live. Here is what you just got: hand the setup to your agent, or do it yourself."
      />
      {squad && (
        <StartupsSetup
          squad={squad}
          plan={plan}
          origin={Origin.StartupsCheckout}
        />
      )}
      <Button
        tag="a"
        href={pageUrl}
        variant={ButtonVariant.Primary}
        className="self-start"
        icon={<ArrowIcon className="rotate-90" />}
        iconPosition={ButtonIconPosition.Right}
      >
        Open your page
      </Button>
    </div>
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

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 tablet:px-6 laptop:py-10">
      <div className="flex flex-col gap-4">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          bold
        >
          daily.dev for Startups
        </Typography>
        {step !== StartupsCheckoutStep.Done && <StepHeader current={step} />}
      </div>
      {step === StartupsCheckoutStep.Company && (
        <div className="max-w-xl">
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
        </div>
      )}
      {step === StartupsCheckoutStep.Plan && company && (
        <PlanStep
          company={company}
          plan={plan}
          onSelect={(next) => {
            if (next !== plan) {
              setPlan(next);
              logStartups(LogEvent.SelectSquadPlan, next, {
                origin: Origin.StartupsCheckout,
                source_id: company.id,
              });
            }
          }}
          onContinue={() => setStep(StartupsCheckoutStep.Checkout)}
        />
      )}
      {step === StartupsCheckoutStep.Checkout && company && (
        <CheckoutStep
          company={company}
          plan={plan}
          onChangePlan={() => setStep(StartupsCheckoutStep.Plan)}
          onPaid={() => setStep(StartupsCheckoutStep.Done)}
        />
      )}
      {step === StartupsCheckoutStep.Done && company && (
        <DoneStep company={company} plan={plan} />
      )}
    </div>
  );
};
