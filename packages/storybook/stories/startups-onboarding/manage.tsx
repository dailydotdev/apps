import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  CoreIcon,
  OpenLinkIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { SquadSeatMember } from '@dailydotdev/shared/src/graphql/squadSubscription';
import { SourceMemberRole } from '@dailydotdev/shared/src/graphql/sources';
import {
  SQUAD_PLAN_CASHBACK_PERCENTAGE,
  SQUAD_PLAN_SEATS,
  SquadPlan,
  squadPlanDetails,
  squadPlans,
} from '@dailydotdev/shared/src/features/squads/lib/plans';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '@dailydotdev/shared/src/components/charm/CharmEmptyState';
import { cloudinaryCharmSomethingWentWrong } from '@dailydotdev/shared/src/lib/image';
import type { SetupProgress } from './screens';
import { everythingDone, planPrices, SetupPanel, SetupPath } from './screens';
import { Skeleton } from './shell';

// The proposed Manage › Subscription and squad page upsell, in the same look as the
// checkout: the landing page's stage for the plan, flat rows for what you act
// on. The checklist is compact, so it stops pushing Seats off the screen.

export enum Viewer {
  Owner = 'owner',
  Admin = 'admin',
  Moderator = 'moderator',
}

export enum PlanStatus {
  Active = 'active',
  PastDue = 'past-due',
  Ending = 'ending',
  Cancelled = 'cancelled',
}

const ACTIVE_ROW =
  'flex items-center gap-3 border-t border-border-subtlest-tertiary py-3 first:border-t-0';

/**
 * The sweet spot for settings: a normal platform card (one hairline border,
 * no motion), with a faint brand wash from the top as the premium touch. The
 * double border and drifting glows stay in the focused checkout.
 */
const PremiumCard = ({
  children,
  padding = 20,
}: {
  children: ReactNode;
  padding?: number;
}): ReactElement => (
  <div
    className="relative flex flex-col gap-5 rounded-16 border border-border-subtlest-tertiary"
    style={{
      padding,
      background:
        'linear-gradient(180deg, color-mix(in srgb, var(--theme-accent-cabbage-default) 9%, transparent), transparent 120px)',
    }}
  >
    {children}
  </div>
);

const Heading = ({
  title,
  note,
}: {
  title: string;
  note?: string;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <h2 className="font-bold typo-title3">{title}</h2>
    {note && (
      <p className="text-pretty text-text-tertiary typo-footnote">{note}</p>
    )}
  </div>
);

const Notice = ({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: string;
}): ReactElement => (
  <div
    role="status"
    className="flex flex-wrap items-center gap-3 rounded-16 border border-border-subtlest-secondary bg-surface-float p-4"
  >
    <div
      className="flex min-w-0 flex-1 flex-col gap-1"
      style={{ minWidth: 220 }}
    >
      <p className="font-bold typo-callout">{title}</p>
      <p className="text-pretty text-text-secondary typo-footnote">
        {children}
      </p>
    </div>
    {action && (
      <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
        {action}
      </Button>
    )}
  </div>
);

const PlanHero = ({
  plan,
  viewer,
  ownerName,
  balance,
  status,
}: {
  plan: SquadPlan;
  viewer: Viewer;
  ownerName: string;
  balance: string;
  status: PlanStatus;
}): ReactElement => (
  <PremiumCard>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-2">
          <span className="font-bold typo-title2">
            {squadPlanDetails[plan].title}
          </span>
          <span
            className={classNames(
              'rounded-8 px-2 py-0.5 font-bold typo-caption1',
              status === PlanStatus.Active
                ? 'bg-accent-avocado-flat text-accent-avocado-default'
                : 'bg-surface-float text-text-secondary',
            )}
          >
            {
              {
                [PlanStatus.Active]: 'Active',
                [PlanStatus.PastDue]: 'Payment failed',
                [PlanStatus.Ending]: 'Ending soon',
                [PlanStatus.Cancelled]: 'Cancelled',
              }[status]
            }
          </span>
        </span>
        <span className="text-text-secondary typo-callout">
          <span className="font-bold tabular-nums text-text-primary">
            {planPrices[plan]}
          </span>{' '}
          a month
        </span>
      </div>
      {viewer === Viewer.Owner ? (
        <Button
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          icon={<OpenLinkIcon />}
        >
          Manage billing
        </Button>
      ) : (
        <p className="text-text-tertiary typo-footnote">
          {`${ownerName} pays for this plan and manages its billing.`}
        </p>
      )}
    </div>
    <div className="flex items-center gap-3 border-t border-border-subtlest-tertiary pt-4">
      <CoreIcon size={IconSize.Medium} className="shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold tabular-nums typo-callout">
          {`${balance} in cashback`}
        </span>
        <span className="text-text-tertiary typo-footnote">
          Your cashback lands here every month. Seats spend it to boost this
          page&apos;s posts.
        </span>
      </div>
    </div>
  </PremiumCard>
);

const SetupSection = ({
  plan,
  done,
  isComplete,
}: {
  plan: SquadPlan;
  done: SetupProgress;
  isComplete?: boolean;
}): ReactElement => {
  const [isOpen, setOpen] = useState(!isComplete);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Heading
          title={isComplete ? 'Your page is set up' : 'Set up your plan'}
          note={isComplete ? undefined : 'With your agent, or yourself.'}
        />
        {isComplete && (
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={() => setOpen(!isOpen)}
          >
            {isOpen ? 'Hide' : 'Review'}
          </Button>
        )}
      </div>
      {isOpen && (
        <SetupPanel
          company="Acme"
          plan={plan}
          initialPath={SetupPath.Manual}
          done={done}
        />
      )}
    </section>
  );
};

const roleName: Partial<Record<SourceMemberRole, string>> = {
  [SourceMemberRole.Admin]: 'Admin',
  [SourceMemberRole.Moderator]: 'Moderator',
};

const SeatRow = ({
  member,
  isPayer,
  canManage,
  isFull,
  isPending,
  error,
  isFormer,
}: {
  member: SquadSeatMember;
  isPayer: boolean;
  canManage: boolean;
  isFull: boolean;
  isPending?: boolean;
  error?: string;
  isFormer?: boolean;
}): ReactElement => {
  const action = (): ReactElement | null => {
    if (isPayer) {
      return (
        <span className="text-text-tertiary typo-footnote">
          Pays for the plan
        </span>
      );
    }

    if (!canManage) {
      return null;
    }

    return (
      <Button
        variant={member.seat ? ButtonVariant.Float : ButtonVariant.Secondary}
        size={ButtonSize.Small}
        loading={isPending}
        disabled={isPending || (!member.seat && isFull)}
      >
        {member.seat ? 'Remove seat' : 'Give seat'}
      </Button>
    );
  };

  return (
    <li className={ACTIVE_ROW}>
      <ProfilePicture user={member.user} size={ProfileImageSize.Large} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold typo-callout">{member.user.name}</span>
        <span className="text-text-tertiary typo-footnote">
          {isFormer
            ? 'No longer on the team, still holds a seat'
            : `${roleName[member.role] ?? 'Member'} · ${member.seat ? 'Seat' : 'No seat'}`}
        </span>
        {error && (
          <span role="alert" className="text-status-error typo-footnote">
            {error}
          </span>
        )}
      </span>
      {action()}
    </li>
  );
};

const SeatRowsLoading = (): ReactElement => (
  <ul className="flex flex-col gap-4" aria-busy>
    {[0, 1, 2].map((row) => (
      <li key={row} className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-1/3 rounded-6" />
          <Skeleton className="h-3 w-1/4 rounded-6" />
        </div>
        <Skeleton className="h-8 w-24 rounded-10" />
      </li>
    ))}
  </ul>
);

const Seats = ({
  plan,
  members,
  isLoading,
  ownerId,
  canManage,
  pendingId,
  errorId,
  formerId,
}: {
  /** The plan is known, and the people aren't yet. */
  isLoading?: boolean;
  plan: SquadPlan;
  members: SquadSeatMember[];
  ownerId: string;
  canManage: boolean;
  pendingId?: string;
  errorId?: string;
  formerId?: string;
}): ReactElement => {
  const limit = SQUAD_PLAN_SEATS[plan];
  const used = members.filter(({ seat }) => seat).length;
  const isFull = used >= limit;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Heading title="Seats" />
        {isLoading ? (
          <Skeleton className="h-4 w-24 rounded-6" />
        ) : (
          <span className="tabular-nums text-text-tertiary typo-footnote">
            {`${used} of ${limit} seats used`}
          </span>
        )}
      </div>
      <p className="text-pretty text-text-tertiary typo-footnote">
        {isFull
          ? 'Seats can post and boost through the API. Every seat is taken, so remove one to give it to someone else.'
          : `Seats can post and boost through the API. Give them to the admins and moderators who run the page. ${limit - used === 1 ? '1 seat left.' : `${limit - used} seats left.`}`}
      </p>
      {isLoading && <SeatRowsLoading />}
      <ul className="flex flex-col">
        {!isLoading &&
          members.map((member) => (
            <SeatRow
              key={member.user.id}
              member={member}
              isPayer={member.user.id === ownerId}
              canManage={canManage}
              isFull={isFull}
              isPending={member.user.id === pendingId}
              isFormer={member.user.id === formerId}
              error={
                member.user.id === errorId
                  ? "That didn't save. Try again."
                  : undefined
              }
            />
          ))}
      </ul>
      {members.length <= 1 && canManage && limit > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-16 bg-surface-float p-4">
          <p className="min-w-0 flex-1 text-pretty text-text-secondary typo-footnote">
            Only admins and moderators can hold a seat. Invite a teammate to the
            page, then make them a moderator.
          </p>
          <Button variant={ButtonVariant.Secondary} size={ButtonSize.Small}>
            Copy invite link
          </Button>
        </div>
      )}
    </section>
  );
};

const Choose = ({
  isAdmin,
  onChoose,
  title = 'Make it your company page',
  note = 'In the feed and search, cited by AI answers, and your agent posts and boosts through the API.',
}: {
  isAdmin: boolean;
  onChoose?: (plan: SquadPlan) => void;
  title?: string;
  note?: string;
}): ReactElement => (
  <div className="flex flex-col gap-5">
    <Heading title={title} note={note} />
    <div className="grid gap-3 tablet:grid-cols-2">
      {squadPlans.map((plan) => {
        const details = squadPlanDetails[plan];

        return (
          <div
            key={plan}
            className="flex flex-col gap-3 rounded-16 border p-4"
            style={{
              borderColor:
                plan === SquadPlan.Starter
                  ? 'var(--theme-accent-cabbage-default)'
                  : 'var(--theme-border-subtlest-tertiary)',
              background:
                plan === SquadPlan.Starter
                  ? 'linear-gradient(180deg, color-mix(in srgb, var(--theme-accent-cabbage-default) 9%, transparent), transparent 120px)'
                  : undefined,
            }}
          >
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-bold typo-title3">{details.title}</span>
              {plan === SquadPlan.Starter && (
                <span className="rounded-8 bg-accent-cabbage-flat px-2 py-0.5 font-bold text-accent-cabbage-default typo-caption1">
                  Recommended
                </span>
              )}
            </span>
            <span>
              <span className="font-bold tabular-nums typo-title2">
                {planPrices[plan]}
              </span>
              <span className="text-text-tertiary typo-footnote"> / month</span>
            </span>
            <span className="flex items-center gap-1.5 text-text-secondary typo-footnote">
              <CoreIcon size={IconSize.Size16} className="shrink-0" />
              {`${SQUAD_PLAN_CASHBACK_PERCENTAGE[plan]}% cashback to boost your posts`}
            </span>
            <span className="text-text-tertiary typo-footnote">
              {details.tagline}
            </span>
            <ul className="flex flex-col gap-1.5 border-t border-border-subtlest-tertiary pt-3">
              <li className="font-bold text-text-tertiary typo-footnote">
                {details.featuresTitle}
              </li>
              {details.features.map((feature) => (
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
            {isAdmin && (
              <Button
                variant={
                  plan === SquadPlan.Starter
                    ? ButtonVariant.Primary
                    : ButtonVariant.Secondary
                }
                className="mt-auto w-full"
                onClick={() => onChoose?.(plan)}
              >
                {`Choose ${details.title}`}
              </Button>
            )}
          </div>
        );
      })}
    </div>
    {!isAdmin && (
      <p className="text-text-secondary typo-footnote">
        Only an admin of this Squad can choose a plan.
      </p>
    )}
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-bold typo-callout">Enterprise</p>
        <p className="text-text-tertiary typo-footnote">
          Verified badge, homepage placement, campaigns and an account team.
        </p>
      </div>
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<OpenLinkIcon />}
      >
        Talk to our team
      </Button>
    </div>
  </div>
);

export const ManageProposed = ({
  plan,
  viewer = Viewer.Owner,
  members = [],
  ownerId = '',
  ownerName = 'Maya Levi',
  status = PlanStatus.Active,
  isLoading,
  areSeatsLoading,
  isFailed,
  pendingId,
  errorId,
  formerId,
  onChoose,
  balance = '9.8K',
  done = {},
  isSetupComplete,
}: {
  balance?: string;
  done?: SetupProgress;
  isSetupComplete?: boolean;
  plan?: SquadPlan;
  viewer?: Viewer;
  members?: SquadSeatMember[];
  ownerId?: string;
  ownerName?: string;
  status?: PlanStatus;
  isLoading?: boolean;
  areSeatsLoading?: boolean;
  isFailed?: boolean;
  pendingId?: string;
  errorId?: string;
  formerId?: string;
  onChoose?: (plan: SquadPlan) => void;
}): ReactElement => {
  const isAdmin = viewer !== Viewer.Moderator;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6" aria-busy>
        <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-1/3 rounded-6" />
              <Skeleton className="h-4 w-1/2 rounded-6" />
            </div>
            <Skeleton className="h-8 w-32 rounded-10" />
          </div>
        </div>
        <Skeleton className="h-24 rounded-16" />
        <SeatRowsLoading />
      </div>
    );
  }

  if (isFailed) {
    return (
      <CharmEmptyState
        placement={CharmEmptyStatePlacement.Page}
        image={cloudinaryCharmSomethingWentWrong}
        imageAlt="daily.dev charm with something gone wrong"
        title="We couldn't load your plan"
        description="Nothing has changed with your plan or billing. This is only a problem showing it."
        action={{ label: 'Try again', onClick: () => undefined }}
      />
    );
  }

  if (status === PlanStatus.Cancelled || !plan) {
    return (
      <div className="flex flex-col gap-6 p-6">
        {status === PlanStatus.Cancelled && (
          <Notice title="Your 9.8K in cashback is waiting">
            Your plan was cancelled. The balance stays frozen until you pick a
            plan again, and your page and posts are all still here.
          </Notice>
        )}
        <Choose
          isAdmin={isAdmin}
          onChoose={onChoose}
          title={
            status === PlanStatus.Cancelled
              ? 'Pick up where you left off'
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {status === PlanStatus.PastDue && (
        <Notice
          title="Your last payment failed"
          action={viewer === Viewer.Owner ? 'Update payment method' : undefined}
        >
          {viewer === Viewer.Owner
            ? 'Plan features are paused until it goes through. Your page and posts stay.'
            : `Plan features are paused. ${ownerName} needs to update the payment method.`}
        </Notice>
      )}
      {status === PlanStatus.Ending && (
        <Notice
          title="Your plan ends on 4 December"
          action={viewer === Viewer.Owner ? 'Keep my plan' : undefined}
        >
          It stays active until then. After that, features switch off and your
          cashback is frozen. Your page and posts stay.
        </Notice>
      )}
      <PlanHero
        plan={plan}
        viewer={viewer}
        ownerName={ownerName}
        balance={balance}
        status={status}
      />
      <SetupSection
        plan={plan}
        done={isSetupComplete ? everythingDone : done}
        isComplete={isSetupComplete}
      />
      <Seats
        isLoading={areSeatsLoading}
        plan={plan}
        members={members}
        ownerId={ownerId}
        canManage={isAdmin}
        pendingId={pendingId}
        errorId={errorId}
        formerId={formerId}
      />
    </div>
  );
};

/** The squad page's upsell, in the landing page's bezel. */
export const UpsellProposed = ({
  company = 'Acme',
  onSeePlans,
  onDismiss,
}: {
  company?: string;
  onSeePlans?: () => void;
  onDismiss?: () => void;
}): ReactElement => (
  <section className="relative w-full">
    <PremiumCard padding={16}>
      <CloseButton
        size={ButtonSize.XSmall}
        className="absolute right-2 top-2"
        aria-label="Dismiss"
        onClick={onDismiss}
      />
      <div className="flex flex-col gap-1 pr-6">
        <h2 className="text-balance font-bold typo-callout">
          {`Make ${company} your company page`}
        </h2>
        <p className="text-text-secondary typo-footnote">
          From $49 a month, with up to 200% back to boost your posts.
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {[
          'In the feed and search, cited by AI answers',
          'Weekly brief on up to 5 topics',
          'API, so your agent posts and boosts',
        ].map((benefit) => (
          <li
            key={benefit}
            className="flex items-start gap-2 text-text-secondary typo-footnote"
          >
            <VIcon
              size={IconSize.Size16}
              className="shrink-0 text-accent-cabbage-default"
            />
            <span className="min-w-0 flex-1">{benefit}</span>
          </li>
        ))}
      </ul>
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        className="w-full"
        onClick={onSeePlans}
      >
        See plans
      </Button>
    </PremiumCard>
  </section>
);
