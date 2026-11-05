import type { ReactElement } from 'react';
import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { CoreIcon, OpenLinkIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { HorizontalSeparator } from '../../../../components/utilities/common';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../../components/ProfilePicture';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { SourceMemberRole } from '../../../../graphql/sources';
import type { ApiErrorResult } from '../../../../graphql/common';
import { DEFAULT_ERROR } from '../../../../graphql/common';
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
  SquadPlan,
  squadPlanDetails,
  squadPlans,
  startupsEnterpriseUrl,
} from '../../lib/plans';
import { useSquadPlanPrices } from '../../hooks/useSquadPlanPrices';
import { useLogStartups } from '../../hooks/useLogStartups';
import { SquadPlanCard, SquadPlanPrice } from '../checkout/SquadPlanCard';
import { SquadManageSectionPanel } from './SquadManageLayout';
import { StartupsSetup } from '../setup/StartupsSetup';
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

const SectionTitle = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <Typography tag={TypographyTag.H2} type={TypographyType.Body} bold>
      {title}
    </Typography>
    {description && (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    )}
  </div>
);

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
    <>
      <SectionTitle
        title="Make it your company page"
        description={`A plan turns ${squad.name} into a company page in the feed and search, cited by AI answers, that lets your agent post and boost through the API.`}
      />
      <div className="grid gap-4 tablet:grid-cols-2">
        {squadPlans.map((plan) => (
          <SquadPlanCard
            key={plan}
            plan={plan}
            price={prices[plan]}
            badge={plan === SquadPlan.Starter ? 'Recommended' : undefined}
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
                  className="w-full"
                >
                  {`Choose ${squadPlanDetails[plan].title}`}
                </Button>
              )
            }
          />
        ))}
      </div>
      {!isAdmin && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Only an admin of this Squad can choose a plan.
        </Typography>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
        <div className="flex min-w-0 flex-col gap-1">
          <Typography type={TypographyType.Callout} bold>
            Enterprise
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Verified badge, homepage placement, campaigns and an account team.
          </Typography>
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
          iconPosition={ButtonIconPosition.Right}
        >
          Talk to our team
        </Button>
      </div>
    </>
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
  const { displayToast } = useToastNotification();
  const sourceId = getSquadId(squad);
  const isOwner = member.user.id === subscription.ownerId;
  const isFull = subscription.seatsUsed >= subscription.seatLimit;
  const logStartups = useLogStartups();
  const { mutate, isPending } = useMutation({
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
    onError: (error: ApiErrorResult) =>
      displayToast(error?.response?.errors?.[0]?.message ?? DEFAULT_ERROR),
  });

  const renderAction = (): ReactElement | null => {
    if (isOwner) {
      return (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Pays for the plan
        </Typography>
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
    <li className="flex items-center gap-3 py-2">
      <ProfilePicture user={member.user} size={ProfileImageSize.Large} />
      <span className="flex min-w-0 flex-1 flex-col">
        <Typography type={TypographyType.Callout} bold truncate>
          {member.user.name}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          truncate
        >
          {[roleLabel[member.role], member.seat ? 'Seat' : 'No seat']
            .filter(Boolean)
            .join(' · ')}
        </Typography>
      </span>
      {renderAction()}
    </li>
  );
};

const seatsLeftCopy = (left: number): string => {
  if (left <= 0) {
    return 'Every seat is taken.';
  }

  return left === 1 ? '1 seat left.' : `${left} seats left.`;
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
  const { data: members } = useQuery(
    squadSeatMembersQueryOptions({ user, sourceId: getSquadId(squad) }),
  );

  return (
    <div className="flex flex-col gap-2">
      <SectionTitle
        title="Seats"
        description={`Seats can post and boost through the API. Give them to the admins and moderators who run the page. ${seatsLeftCopy(
          subscription.seatLimit - subscription.seatsUsed,
        )}`}
      />
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
    </div>
  );
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
      <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-2">
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Title3}
                bold
              >
                {squadPlanDetails[plan].title}
              </Typography>
              <span className="rounded-8 bg-accent-avocado-flat px-2 py-0.5 font-bold text-accent-avocado-default typo-caption1">
                Active
              </span>
            </span>
            <SquadPlanPrice price={prices[plan]} />
          </div>
          {isOwner && (
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
              iconPosition={ButtonIconPosition.Right}
            >
              Manage billing
            </Button>
          )}
        </div>
        {!isOwner && owner && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {`${owner.user.name} pays for this plan and manages its billing.`}
          </Typography>
        )}
        <HorizontalSeparator />
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float">
            <CoreIcon size={IconSize.Medium} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <Typography type={TypographyType.Callout} bold>
              {`${largeNumberFormat(balance ?? 0)} Cores in the wallet`}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Your cashback lands here every month. Seats spend it to boost this
              page&apos;s posts.
            </Typography>
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <SectionTitle
          title="Set up your plan"
          description="With your agent, or yourself."
        />
        <StartupsSetup
          squad={squad}
          plan={plan}
          origin={Origin.SquadManagePlan}
        />
      </div>
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

  if (isError) {
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
      <div className="flex flex-col gap-6 px-4 py-6 tablet:px-6">
        {isPending && (
          <div className="flex flex-col gap-6" aria-busy>
            <ElementPlaceholder className="h-40 rounded-16" />
            <ElementPlaceholder className="h-24 rounded-16" />
            <ElementPlaceholder className="h-40 rounded-16" />
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
