import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { PlusIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
import { InviteLinkInput } from '@dailydotdev/shared/src/components/referral';
import { SocialShareList } from '@dailydotdev/shared/src/components/widgets/SocialShareList';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FunnelStepCtaWrapper } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepCtaWrapper';
import { FunnelProgressContext } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepDots';
import { StepHeadline } from '@dailydotdev/shared/src/features/onboarding/shared/StepHeadline';
import {
  ReferralCampaignKey,
  useReferralCampaign,
} from '@dailydotdev/shared/src/hooks';
import { useShareOrCopyLink } from '@dailydotdev/shared/src/hooks/useShareOrCopyLink';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { labels } from '@dailydotdev/shared/src/lib';
import { link as links } from '@dailydotdev/shared/src/lib/links';
import {
  LogEvent,
  TargetId,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import type { ShareProvider } from '@dailydotdev/shared/src/lib/share';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';

/**
 * /onboarding/invite-preview — internal review surface for the invite step
 * proposed in #6366: the same controls that ship on /settings/invite, moved
 * to the moment in onboarding when the reward still means something.
 *
 * Drawn on the production funnel chrome and wired to the real referral link,
 * so it renders as the step would in the funnel rather than as a mockup of
 * it. `?state=progress` shows the one-of-three state. It sits outside
 * `/dev/*` because that tree short-circuits the app shell, and these controls
 * need auth and log context. Carries `noindex`/`nofollow`; reachable on
 * preview + local but blocked on the canonical production hosts.
 */

const NO_PROFILE =
  'https://res.cloudinary.com/daily-now/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile';

type Spot = 'step' | 'progress';

const useReviewAllowed = (): boolean => {
  const [allowed, setAllowed] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const { hostname } = window.location;
    setAllowed(hostname !== 'app.daily.dev' && hostname !== 'www.daily.dev');
  }, []);
  return allowed;
};

const Slot = ({ filled, image }: { filled?: boolean; image?: string }) => {
  if (!filled) {
    return (
      <span className="flex size-14 items-center justify-center rounded-full border border-dashed border-border-subtlest-tertiary text-text-quaternary">
        <PlusIcon />
      </span>
    );
  }

  return (
    <div className="relative">
      <img
        alt=""
        className="size-14 rounded-full object-cover"
        src={image || NO_PROFILE}
      />
      <span className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-accent-avocado-default">
        <VIcon className="size-3 text-white" />
      </span>
    </div>
  );
};

const InviteStep = ({ spot }: { spot: Spot }): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { url } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
  });
  const inviteLink = url || links.referral.defaultUrl;
  const [, onShareOrCopyLink] = useShareOrCopyLink({
    text: labels.referral.generic.inviteText,
    link: inviteLink,
    logObject: () => ({
      event_name: LogEvent.CopyReferralLink,
      target_id: TargetId.InviteFriendsPage,
    }),
  });

  const onLogShare = (provider: ShareProvider) =>
    logEvent({
      event_name: LogEvent.InviteReferral,
      target_id: provider,
      target_type: TargetType.InviteFriendsPage,
    });

  return (
    <FunnelStepCtaWrapper
      cta={{ label: 'Continue' }}
      isGlass
      skip={{ cta: 'Skip' }}
    >
      <div className="mx-auto flex w-full max-w-[32rem] flex-col gap-4 px-6 py-8">
        <StepHeadline
          description="They get daily.dev, you both get Plus. It counts as soon as they sign up with your link."
          heading="Invite 3 friends, get a month of Plus"
        />

        <div className="my-2 flex items-center justify-center gap-4">
          <Slot filled={spot === 'progress'} image={user?.image} />
          <Slot />
          <Slot />
        </div>

        {spot === 'progress' && (
          <Typography
            className="text-center"
            color={TypographyColor.Tertiary}
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
          >
            1 of 3 joined
          </Typography>
        )}

        <InviteLinkInput
          link={inviteLink}
          logProps={{
            event_name: LogEvent.CopyReferralLink,
            target_id: TargetId.InviteFriendsPage,
          }}
        />

        <div className="flex flex-row flex-wrap justify-center gap-2 gap-y-4">
          <SocialShareList
            description={labels.referral.generic.inviteText}
            link={inviteLink}
            onClickSocial={onLogShare}
            onNativeShare={onShareOrCopyLink}
            shortenUrl={false}
          />
        </div>
      </div>
    </FunnelStepCtaWrapper>
  );
};

// Five steps with the invite fourth, matching the position #6366 proposes.
const PROGRESS = {
  chapters: [{ steps: 5 }],
  position: { chapter: 0, step: 3 },
  isOnboarding: true,
};

const InviteOnboardingPreviewPage = (): ReactElement => {
  const router = useRouter();
  const allowed = useReviewAllowed();

  if (!allowed) {
    return <NextSeo nofollow noindex />;
  }

  return (
    <>
      <NextSeo nofollow noindex title="Invite onboarding step" />
      <div className="flex min-h-dvh min-w-full flex-col">
        <FunnelProgressContext.Provider value={PROGRESS}>
          <InviteStep
            spot={router.query.state === 'progress' ? 'progress' : 'step'}
          />
        </FunnelProgressContext.Provider>
      </div>
    </>
  );
};

InviteOnboardingPreviewPage.getLayout = (page: ReactNode): ReactNode => page;

export default InviteOnboardingPreviewPage;
