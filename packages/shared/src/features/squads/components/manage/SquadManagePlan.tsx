import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiErrorResult } from '../../../../graphql/common';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { CoreIcon, OpenLinkIcon, VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../../components/ProfilePicture';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useSquadInvitation } from '../../../../hooks/useSquadInvitation';
import { SourceMemberRole } from '../../../../graphql/sources';
import type {
  SquadSeatMember,
  SquadSubscription,
} from '../../../../graphql/squadSubscription';
import {
  setSquadSeat,
  squadSeatMembersQueryOptions,
  squadSubscriptionBalanceQueryOptions,
  squadSubscriptionQueryOptions,
} from '../../../../graphql/squadSubscription';
import { managePlusUrl } from '../../../../lib/constants';
import { largeNumberFormat } from '../../../../lib/numberFormat';
import { LogEvent, Origin } from '../../../../lib/log';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId } from '../../lib/features';
import { getStartupsCheckoutUrl, SquadManageSection } from '../../lib/routes';
import {
  SQUAD_PLAN_CASHBACK_PERCENTAGE,
  SquadPlan,
  getSquadPlanTitle,
  isSquadPlan,
  squadPlanDetails,
  squadPlans,
  startupsEnterpriseUrl,
} from '../../lib/plans';
import { useSquadPlanPrices } from '../../hooks/useSquadPlanPrices';
import {
  SquadLaunchOfferBanner,
  SquadPlanCashback,
} from '../SquadPlanCashback';
import { getPlusMemberDateFormat } from '../../../../lib/dateFormat';
import { useLogStartups } from '../../hooks/useLogStartups';
import { useStartupsSetupRefresh } from '../../hooks/useStartupsSetupRefresh';
import { SquadManageSectionPanel } from './SquadManageLayout';
import {
  StartupsSetup,
  StartupsSetupPath,
  useStartupsSetupProgress,
} from '../setup/StartupsSetup';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../../../../components/charm/CharmEmptyState';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';
import { cloudinaryCharmSomethingWentWrong } from '../../../../lib/image';

const roleLabel: Partial<Record<SourceMemberRole, string>> = {
  [SourceMemberRole.Admin]: 'Admin',
  [SourceMemberRole.Moderator]: 'Moderator',
};

const PREMIUM_WASH =
  'linear-gradient(180deg, color-mix(in srgb, var(--theme-accent-cabbage-default) 9%, transparent), transparent 120px)';

const SectionTitle = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <h2 className="font-bold typo-title3">{title}</h2>
    {description && (
      <p className="text-pretty text-text-tertiary typo-footnote">
        {description}
      </p>
    )}
  </div>
);

const SectionSkeleton = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <ElementPlaceholder
    aria-hidden
    className={classNames('shrink-0 animate-pulse', className)}
  />
);

const PlanChoice = ({
  plan,
  price,
  action,
}: {
  plan: SquadPlan;
  price: string;
  action?: ReactNode;
}): ReactElement => {
  const { title, tagline, featuresTitle, features } = squadPlanDetails[plan];
  const isRecommended = plan === SquadPlan.Starter;

  return (
    <div
      className="flex flex-col gap-3 rounded-16 border p-4"
      style={{
        borderColor: isRecommended
          ? 'var(--theme-accent-cabbage-default)'
          : 'var(--theme-border-subtlest-tertiary)',
        background: isRecommended ? PREMIUM_WASH : undefined,
      }}
    >
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-bold typo-title3">{title}</span>
        {isRecommended && (
          <span className="rounded-8 bg-accent-cabbage-flat px-2 py-0.5 font-bold text-accent-cabbage-default typo-caption1">
            Recommended
          </span>
        )}
      </span>
      <span>
        <span className="font-bold tabular-nums typo-title2">{price}</span>
        <span className="text-text-tertiary typo-footnote"> / month</span>
      </span>
      <SquadPlanCashback plan={plan} />
      <span className="text-text-tertiary typo-footnote">{tagline}</span>
      <ul className="flex flex-col gap-1.5 border-t border-border-subtlest-tertiary pt-3">
        <li className="font-bold text-text-tertiary typo-footnote">
          {featuresTitle}
        </li>
        {features.map((feature) => (
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
      {action}
    </div>
  );
};

const ChoosePlan = ({ isAdmin }: { isAdmin: boolean }): ReactElement => {
  const { squad } = useSquadPageContext();
  const prices = useSquadPlanPrices();
  const logStartups = useLogStartups();
  const sourceId = getSquadId(squad);
  const logUpgrade = (targetId: string) =>
    logStartups(LogEvent.UpgradeSubscription, targetId, {
      origin: Origin.SquadManagePlan,
      source_id: sourceId,
    });

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle
        title="Make it your company page"
        description="In the feed and search, cited by AI answers, and your agent posts and boosts through the API."
      />
      <SquadLaunchOfferBanner />
      <div className="grid gap-3 tablet:grid-cols-2">
        {squadPlans.map((plan) => (
          <PlanChoice
            key={plan}
            plan={plan}
            price={prices[plan]}
            action={
              isAdmin && (
                <Button
                  tag="a"
                  href={getStartupsCheckoutUrl({ plan, sourceId })}
                  onClick={() => logUpgrade(plan)}
                  variant={
                    plan === SquadPlan.Starter
                      ? ButtonVariant.Primary
                      : ButtonVariant.Secondary
                  }
                  className="mt-auto w-full"
                >
                  {`Choose ${squadPlanDetails[plan].title}`}
                </Button>
              )
            }
          />
        ))}
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
          tag="a"
          href={startupsEnterpriseUrl}
          target="_blank"
          rel="noopener"
          onClick={() => logUpgrade('enterprise')}
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<OpenLinkIcon />}
        >
          Talk to our team
        </Button>
      </div>
    </div>
  );
};

const SeatRow = ({
  member,
  subscription,
  canManage,
}: {
  member: SquadSeatMember;
  subscription: SquadSubscription;
  canManage: boolean;
}): ReactElement => {
  const { squad } = useSquadPageContext();
  const { user } = useAuthContext();
  const client = useQueryClient();
  const sourceId = getSquadId(squad);
  const isOwner = member.user.id === subscription.ownerId;
  const isFull = subscription.seatsUsed >= subscription.seatLimit;
  const logStartups = useLogStartups();
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: () =>
      setSquadSeat({ sourceId, userId: member.user.id, seat: !member.seat }),
    onSuccess: () => {
      logStartups(
        member.seat ? LogEvent.RemoveSquadSeat : LogEvent.GiveSquadSeat,
        sourceId,
        { user_id: member.user.id, role: member.role },
      );
      client.invalidateQueries({
        queryKey: squadSubscriptionQueryOptions({ user, sourceId }).queryKey,
      });
      client.invalidateQueries({
        queryKey: squadSeatMembersQueryOptions({ user, sourceId }).queryKey,
      });
    },
  });
  const role = roleLabel[member.role];

  const renderAction = (): ReactElement | null => {
    if (isOwner) {
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
        onClick={() => mutate()}
      >
        {member.seat ? 'Remove seat' : 'Give seat'}
      </Button>
    );
  };

  return (
    <li className="flex items-center gap-3 border-t border-border-subtlest-tertiary py-3 first:border-t-0">
      <ProfilePicture user={member.user} size={ProfileImageSize.Large} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold typo-callout">{member.user.name}</span>
        <span className="text-text-tertiary typo-footnote">
          {role
            ? `${role} · ${member.seat ? 'Seat' : 'No seat'}`
            : 'No longer on the team, still holds a seat'}
        </span>
        {isError && (
          <span role="alert" className="text-status-error typo-footnote">
            {(error as unknown as ApiErrorResult)?.response?.errors?.[0]
              ?.message ?? "That didn't save. Try again."}
          </span>
        )}
      </span>
      {renderAction()}
    </li>
  );
};

const SeatRowsLoading = (): ReactElement => (
  <ul className="flex flex-col gap-4" aria-busy>
    {[0, 1, 2].map((row) => (
      <li key={row} className="flex items-center gap-3">
        <SectionSkeleton className="size-10 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <SectionSkeleton className="h-4 w-1/3 rounded-6" />
          <SectionSkeleton className="h-3 w-1/4 rounded-6" />
        </div>
        <SectionSkeleton className="h-8 w-24 rounded-10" />
      </li>
    ))}
  </ul>
);

const getSeatsCopy = (left: number, isEnterprise: boolean): string => {
  if (left <= 0) {
    return 'Seats can post and boost through the API. Every seat is taken, so remove one to give it to someone else.';
  }

  const who = isEnterprise
    ? 'Every admin and moderator gets one by default.'
    : 'Give them to the admins and moderators who run the page.';

  return `Seats can post and boost through the API. ${who} ${
    left === 1 ? '1 seat left.' : `${left} seats left.`
  }`;
};

/** Who holds a seat. Also opened on its own from the onboarding's checklist. */
export const SquadManageSeats = ({
  subscription,
  isAdmin,
}: {
  subscription: SquadSubscription;
  isAdmin: boolean;
}): ReactElement => {
  const { squad } = useSquadPageContext();
  const { user } = useAuthContext();
  const { data: members, isPending } = useQuery(
    squadSeatMembersQueryOptions({ user, sourceId: getSquadId(squad) }),
  );
  const { copying, logAndCopyLink } = useSquadInvitation({
    squad,
    origin: Origin.SquadManagePlan,
  });
  const { seatLimit, seatsUsed } = subscription;
  // Only an admin who holds a seat can bring a teammate in to seat
  const viewerHasSeat =
    user?.id === subscription.ownerId ||
    (members?.find((member) => member.user.id === user?.id)?.seat ??
      !!squad.currentMember?.seat);
  const canInvite = isAdmin && viewerHasSeat;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <SectionTitle title="Seats" />
        {isPending ? (
          <SectionSkeleton className="h-4 w-24 rounded-6" />
        ) : (
          <span className="tabular-nums text-text-tertiary typo-footnote">
            {`${seatsUsed} of ${seatLimit} seats used`}
          </span>
        )}
      </div>
      <p className="text-pretty text-text-tertiary typo-footnote">
        {getSeatsCopy(
          seatLimit - seatsUsed,
          !!subscription.plan && !isSquadPlan(subscription.plan),
        )}
      </p>
      {isPending ? (
        <SeatRowsLoading />
      ) : (
        <ul className="flex flex-col">
          {members?.map((member) => (
            <SeatRow
              key={member.user.id}
              member={member}
              subscription={subscription}
              canManage={isAdmin}
            />
          ))}
        </ul>
      )}
      {!isPending &&
        (members?.length ?? 0) <= 1 &&
        canInvite &&
        seatLimit > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-16 bg-surface-float p-4">
            <p className="min-w-0 flex-1 text-pretty text-text-secondary typo-footnote">
              Only admins and moderators can hold a seat. Invite a teammate to
              the page, then make them a moderator.
            </p>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              onClick={() => logAndCopyLink()}
            >
              {copying ? 'Copied' : 'Copy invite link'}
            </Button>
          </div>
        )}
    </section>
  );
};

const SetupSection = ({ plan }: { plan: SquadPlan }): ReactElement => {
  const { squad } = useSquadPageContext();
  const { isComplete } = useStartupsSetupProgress(squad, plan);
  const [isReviewing, setReviewing] = useState(false);
  // Ticks the rows as the founder's agent sets the page up over MCP
  useStartupsSetupRefresh({ squad, enabled: !isComplete || isReviewing });

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle
          title={isComplete ? 'Your page is set up' : 'Set up your plan'}
          description={isComplete ? undefined : 'With your agent, or yourself.'}
        />
        {isComplete && (
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={() => setReviewing(!isReviewing)}
          >
            {isReviewing ? 'Hide' : 'Review'}
          </Button>
        )}
      </div>
      {(!isComplete || isReviewing) && (
        <StartupsSetup
          squad={squad}
          plan={plan}
          origin={Origin.SquadManagePlan}
          initialPath={StartupsSetupPath.Manual}
        />
      )}
    </section>
  );
};

const getActiveCashbackDescription = (
  plan: SquadPlan,
  { cashbackPercentage, cashbackPromoEndsAt }: SquadSubscription,
): string => {
  const until = cashbackPromoEndsAt
    ? ` until ${getPlusMemberDateFormat(cashbackPromoEndsAt)}, then ${
        SQUAD_PLAN_CASHBACK_PERCENTAGE[plan]
      }%`
    : '';

  return `${cashbackPercentage}% of each payment lands here every month${until}. Seats spend it to boost this page's posts.`;
};

const ActivePlan = ({
  subscription,
  isAdmin,
}: {
  subscription: SquadSubscription;
  isAdmin: boolean;
}): ReactElement => {
  const { squad } = useSquadPageContext();
  const { user } = useAuthContext();
  const prices = useSquadPlanPrices();
  const sourceId = getSquadId(squad);
  const plan = subscription.plan as SquadPlan;
  const isSelfServe = isSquadPlan(plan);
  const isOwner = !!user && user.id === subscription.ownerId;
  const { data: balance } = useQuery(
    squadSubscriptionBalanceQueryOptions({ user, sourceId }),
  );
  const { data: members } = useQuery(
    squadSeatMembersQueryOptions({ user, sourceId }),
  );
  const owner = members?.find(
    ({ user: { id } }) => id === subscription.ownerId,
  );
  const logStartups = useLogStartups();

  return (
    <>
      <div
        className="relative flex flex-col gap-5 rounded-16 border border-border-subtlest-tertiary"
        style={{ padding: 20, background: PREMIUM_WASH }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-2">
              <span className="font-bold typo-title2">
                {getSquadPlanTitle(plan)}
              </span>
              <span className="rounded-8 bg-accent-avocado-flat px-2 py-0.5 font-bold text-accent-avocado-default typo-caption1">
                Active
              </span>
            </span>
            {isSelfServe ? (
              <span className="text-text-secondary typo-callout">
                <span className="font-bold tabular-nums text-text-primary">
                  {prices[plan]}
                </span>{' '}
                a month
              </span>
            ) : (
              <span className="text-text-secondary typo-callout">
                Billed through your daily.dev contract.
              </span>
            )}
          </div>
          {isSelfServe && isOwner && (
            <Button
              tag="a"
              href={managePlusUrl}
              target="_blank"
              rel="noopener"
              onClick={() =>
                logStartups(LogEvent.ManageSubscription, plan, {
                  source_id: sourceId,
                })
              }
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              icon={<OpenLinkIcon />}
            >
              Manage billing
            </Button>
          )}
          {isSelfServe && !isOwner && owner && (
            <p className="text-text-tertiary typo-footnote">
              {`${owner.user.name} pays for this plan and manages its billing.`}
            </p>
          )}
        </div>
        {isSelfServe && (
          <div className="flex items-center gap-3 border-t border-border-subtlest-tertiary pt-4">
            <CoreIcon size={IconSize.Medium} className="shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-bold tabular-nums typo-callout">
                {`${largeNumberFormat(balance ?? 0)} in cashback`}
              </span>
              <span className="text-text-tertiary typo-footnote">
                {getActiveCashbackDescription(plan, subscription)}
              </span>
            </div>
          </div>
        )}
      </div>
      {isSelfServe && <SetupSection plan={plan} />}
      <SquadManageSeats subscription={subscription} isAdmin={isAdmin} />
    </>
  );
};

export const SquadManagePlan = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { user } = useAuthContext();
  const {
    data: subscription,
    isPending,
    isError,
    refetch,
  } = useQuery(
    squadSubscriptionQueryOptions({ user, sourceId: getSquadId(squad) }),
  );
  const isAdmin = squad.currentMember?.role === SourceMemberRole.Admin;

  // A failed refresh of a plan we already have isn't worth losing the page over.
  if (isError && !subscription) {
    return (
      <SquadManageSectionPanel section={SquadManageSection.Plan}>
        <CharmEmptyState
          placement={CharmEmptyStatePlacement.Page}
          image={cloudinaryCharmSomethingWentWrong}
          imageAlt="daily.dev charm with something gone wrong"
          title="We couldn't load your subscription"
          description="Nothing has changed with your plan or billing. This is only a problem showing it."
          action={{ label: 'Try again', onClick: () => refetch() }}
        />
      </SquadManageSectionPanel>
    );
  }

  return (
    <SquadManageSectionPanel section={SquadManageSection.Plan}>
      <div className="flex flex-col gap-6 p-6">
        {isPending && (
          <div className="flex flex-col gap-6" aria-busy>
            <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-1 flex-col gap-2">
                  <SectionSkeleton className="h-5 w-1/3 rounded-6" />
                  <SectionSkeleton className="h-4 w-1/2 rounded-6" />
                </div>
                <SectionSkeleton className="h-8 w-32 rounded-10" />
              </div>
            </div>
            <SectionSkeleton className="h-24 rounded-16" />
            <SeatRowsLoading />
          </div>
        )}
        {!isPending &&
          (subscription?.plan ? (
            <ActivePlan subscription={subscription} isAdmin={isAdmin} />
          ) : (
            <ChoosePlan isAdmin={isAdmin} />
          ))}
      </div>
    </SquadManageSectionPanel>
  );
};
