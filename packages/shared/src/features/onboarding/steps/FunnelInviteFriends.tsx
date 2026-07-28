import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import type { FunnelStepInviteFriends } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { FunnelTargetId } from '../types/funnelEvents';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { withShouldSkipStepGuard } from '../shared/withShouldSkipStepGuard';
import { StepHeadline } from '../shared/StepHeadline';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureOnboardingInviteReward } from '../../../lib/featureManagement';
import {
  ReferralCampaignKey,
  useReferralCampaign,
} from '../../../hooks/referral/useReferralCampaign';
import { useShareOrCopyLink } from '../../../hooks/useShareOrCopyLink';
import { InviteLinkInput } from '../../../components/referral/InviteLinkInput';
import { SocialShareList } from '../../../components/widgets/SocialShareList';
import { GivebackConfettiBurst } from '../../giveback/components/GivebackConfettiBurst';
import { labels } from '../../../lib/labels';
import { link } from '../../../lib/links';
import { LogEvent, TargetId } from '../../../lib/log';
import type { ShareProvider } from '../../../lib/share';
import { shouldUseNativeShare } from '../../../lib/func';
import { UserIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

// Copy defaults live here (not in the funnel JSON) so the step renders a
// complete experience even before Freyja overrides land. `{count}` and
// `{reward}` placeholders keep the reward framing A/B-able from the JSON.
const INVITE_FRIENDS_DEFAULTS = {
  headline: 'Invite {count} friends, get {reward} of Plus on us',
  explainer:
    'You help daily.dev grow, we return the favor. When {count} developers join with your personal link, you unlock daily.dev Plus free for {reward}.',
  celebrationHeadline: '{count} friends joined. Plus is on us',
  celebrationExplainer:
    'Your invites made it. Your free {reward} of daily.dev Plus will be applied to your account.',
  celebrationCta: 'Continue',
  continueCta: 'Continue',
  skipCta: "I'll do this later",
  reward: '1 month',
  targetCount: 3,
};

const applyCopyPlaceholders = (
  copy: string,
  targetCount: number,
  reward: string,
): string =>
  copy
    .replace(/\{count\}/g, String(targetCount))
    .replace(/\{reward\}/g, reward);

// Exported unguarded for Storybook, which can't provide the GrowthBook
// context the flag guard needs; production always goes through the guarded
// `FunnelInviteFriends` below.
export const InviteFriendsStep = ({
  parameters,
  transitions,
  onTransition,
}: FunnelStepInviteFriends): ReactElement => {
  const {
    headline = INVITE_FRIENDS_DEFAULTS.headline,
    explainer = INVITE_FRIENDS_DEFAULTS.explainer,
    cta,
    celebrationHeadline = INVITE_FRIENDS_DEFAULTS.celebrationHeadline,
    celebrationExplainer = INVITE_FRIENDS_DEFAULTS.celebrationExplainer,
    celebrationCta = INVITE_FRIENDS_DEFAULTS.celebrationCta,
    reward = INVITE_FRIENDS_DEFAULTS.reward,
    targetCount = INVITE_FRIENDS_DEFAULTS.targetCount,
  } = parameters;
  const { logEvent } = useLogContext();
  const { url, referredUsersCount } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
  });
  const inviteLink = url || link.referral.defaultUrl;
  const joinedCount = Math.min(referredUsersCount, targetCount);
  const isTargetReached = joinedCount >= targetCount;
  // Whether the user took any invite action this session; flips the primary
  // CTA to "Continue" so inviting never dead-ends the funnel.
  const [hasInvited, setHasInvited] = useState(false);
  const [celebrationBurst, setCelebrationBurst] = useState(0);
  const skipTransition = useMemo(
    () => transitions.find((t) => t.on === FunnelStepTransitionType.Skip),
    [transitions],
  );
  const [, onShareOrCopyLink] = useShareOrCopyLink({
    text: labels.referral.generic.inviteText,
    link: inviteLink,
    logObject: () => ({
      event_name: LogEvent.CopyReferralLink,
      target_id: TargetId.Onboarding,
    }),
  });

  useEffect(() => {
    if (isTargetReached) {
      setCelebrationBurst((count) => count + 1);
    }
  }, [isTargetReached]);

  const transitionDetails = {
    referredUsersCount,
    targetReached: isTargetReached,
    invited: hasInvited,
  };

  const onInvite = () => {
    setHasInvited(true);
    onShareOrCopyLink();
  };

  const onSocialShare = (provider: ShareProvider) => {
    setHasInvited(true);
    logEvent({
      event_name: LogEvent.InviteReferral,
      target_id: provider,
      target_type: TargetId.Onboarding,
    });
  };

  const isContinueMode = isTargetReached || hasInvited;
  const primaryCtaLabel = (() => {
    if (isTargetReached) {
      return celebrationCta;
    }
    if (hasInvited) {
      return INVITE_FRIENDS_DEFAULTS.continueCta;
    }
    return (
      cta ?? (shouldUseNativeShare() ? 'Invite friends' : 'Copy invite link')
    );
  })();

  const progressIndicator = (
    <div className="flex flex-col items-center gap-3">
      <div
        aria-label={`${joinedCount} of ${targetCount} friends joined`}
        aria-valuemax={targetCount}
        aria-valuemin={0}
        aria-valuenow={joinedCount}
        className="flex items-center justify-center gap-3"
        role="progressbar"
      >
        {Array.from({ length: targetCount }, (_, index) => {
          const isJoined = index < joinedCount;
          return (
            <span
              aria-hidden
              // eslint-disable-next-line react/no-array-index-key -- slots are positional and never reorder
              key={index}
              className={classNames(
                'flex size-12 items-center justify-center rounded-full border',
                isJoined
                  ? 'border-accent-avocado-default text-accent-avocado-default'
                  : 'border-border-subtlest-tertiary text-text-disabled',
              )}
            >
              {isJoined ? (
                <VIcon secondary size={IconSize.Medium} />
              ) : (
                <UserIcon size={IconSize.Medium} />
              )}
            </span>
          );
        })}
      </div>
      <Typography
        color={TypographyColor.Tertiary}
        tag={TypographyTag.P}
        type={TypographyType.Callout}
      >
        {joinedCount}/{targetCount} friends joined
      </Typography>
    </div>
  );

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-96 flex-1 flex-col items-center gap-6 p-6 pt-10">
        {isTargetReached ? (
          <div className="relative flex animate-composer-in flex-col items-center gap-6 motion-reduce:animate-none">
            <GivebackConfettiBurst
              pieceCount={24}
              spread={120}
              trigger={celebrationBurst}
            />
            <StepHeadline
              heading={applyCopyPlaceholders(
                celebrationHeadline,
                targetCount,
                reward,
              )}
              description={applyCopyPlaceholders(
                celebrationExplainer,
                targetCount,
                reward,
              )}
            />
            {progressIndicator}
          </div>
        ) : (
          <>
            <StepHeadline
              heading={applyCopyPlaceholders(headline, targetCount, reward)}
              description={applyCopyPlaceholders(
                explainer,
                targetCount,
                reward,
              )}
            />
            {progressIndicator}
            <div
              aria-label="Copy your invite link"
              className="w-full"
              data-funnel-track={FunnelTargetId.InviteFriendsCopy}
              role="group"
            >
              <InviteLinkInput
                link={inviteLink}
                logProps={{
                  event_name: LogEvent.CopyReferralLink,
                  target_id: TargetId.Onboarding,
                }}
                onCopy={() => setHasInvited(true)}
              />
            </div>
            <Typography
              bold
              color={TypographyColor.Tertiary}
              tag={TypographyTag.P}
              type={TypographyType.Callout}
            >
              or invite via
            </Typography>
            <div
              aria-label="Invite via social platforms"
              className="flex flex-row flex-wrap justify-center gap-2 gap-y-4"
              data-funnel-track={FunnelTargetId.InviteFriendsShare}
              role="group"
            >
              <SocialShareList
                description={labels.referral.generic.inviteText}
                link={inviteLink}
                onClickSocial={onSocialShare}
                onNativeShare={onInvite}
                shortenUrl={false}
              />
            </div>
          </>
        )}
      </div>
      <div className="sticky mx-auto my-4 flex w-full max-w-md flex-col gap-4 px-4 bottom-safe-or-2">
        <Button
          className="w-full"
          data-funnel-track={
            isContinueMode
              ? FunnelTargetId.StepCta
              : FunnelTargetId.InviteFriends
          }
          onClick={() => {
            if (isContinueMode) {
              onTransition({
                type: FunnelStepTransitionType.Complete,
                details: transitionDetails,
              });
              return;
            }
            onInvite();
          }}
          size={ButtonSize.XLarge}
          type="button"
          variant={ButtonVariant.Primary}
        >
          {primaryCtaLabel}
        </Button>
        {!!skipTransition && !isTargetReached && (
          <Button
            data-funnel-track={FunnelTargetId.InviteFriendsSkip}
            onClick={() =>
              onTransition({
                type: FunnelStepTransitionType.Skip,
                details: transitionDetails,
              })
            }
            type="button"
            variant={ButtonVariant.Tertiary}
          >
            {skipTransition.cta ?? INVITE_FRIENDS_DEFAULTS.skipCta}
          </Button>
        )}
      </div>
    </div>
  );
};

export const FunnelInviteFriends = withShouldSkipStepGuard(
  withIsActiveGuard(InviteFriendsStep),
  () => {
    const { user } = useAuthContext();
    // Referral links are per-user: an anonymous visitor can't attribute
    // invites, so the step only makes sense after registration.
    const hasUser = !!user?.id;
    const { value: isFlagEnabled } = useConditionalFeature({
      feature: featureOnboardingInviteReward,
      // This hook only mounts when the funnel JSON contains the step, so
      // evaluating here enrolls exactly the cohort that could see it.
      shouldEvaluate: hasUser,
    });

    return { shouldSkip: !hasUser || !isFlagEnabled };
  },
);

export default FunnelInviteFriends;
