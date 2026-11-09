import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { Picks } from '../../graphql/picks';
import { getPicksPath } from '../../graphql/picks';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { onboardingUrl } from '../../lib/constants';
import { AFTER_AUTH_PARAM } from '../auth/common';
import {
  AuthenticationBanner,
  authBannerHeadlineClassName,
} from '../auth/AuthenticationBanner';
import { OnboardingHeadline } from '../auth/OnboardingHeadline';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

interface PicksSignupBannerGate {
  /** Auth has settled and the viewer is not a member */
  shouldShow: boolean;
  /**
   * On laptop the banner pins to the window's bottom edge, so the page has
   * to leave that edge free; below laptop it sits inline under the header.
   */
  isPinned: boolean;
}

// The one gate for the banner and for the page's bottom padding, so the two
// can never drift apart.
export const usePicksSignupBannerGate = (): PicksSignupBannerGate => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const shouldShow = isAuthReady && !isLoggedIn;

  return { shouldShow, isPinned: shouldShow && isLaptop };
};

export const PICKS_SIGNUP_TITLE = 'thought you may want to read these';

export const getPicksSignupDescription = (picks: Picks): string => {
  const count = picks.items.length;

  return `${count} ${count === 1 ? 'post' : 'posts'} picked this week. Join daily.dev to save them and share your own picks.`;
};

interface PicksSignupBannerProps {
  picks: Picks;
}

/**
 * The signup prompt a non-member sees on someone's picks page, in the
 * author's voice: their picture and name, then the invitation. On laptop it
 * is the public pages' pinned banner with inline signup; below that a card
 * under the header that goes through onboarding and comes back to this list.
 */
export function PicksSignupBanner({
  picks,
}: PicksSignupBannerProps): ReactElement | null {
  const router = useRouter();
  const { logEvent } = useLogContext();
  const { shouldShow, isPinned } = usePicksSignupBannerGate();
  const { author } = picks;

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.SignupButton,
      target_id: TargetId.PicksSignupBanner,
      extra: JSON.stringify({ picks_id: picks.id }),
    }),
    { condition: shouldShow },
  );

  if (!shouldShow) {
    return null;
  }

  if (isPinned) {
    return (
      <AuthenticationBanner targetId={TargetId.PicksSignupBanner}>
        <OnboardingHeadline
          className={authBannerHeadlineClassName}
          avatar={
            <ProfilePicture
              user={author}
              size={ProfileImageSize.Large}
              nativeLazyLoading
            />
          }
          pretitle={author.name}
          title={PICKS_SIGNUP_TITLE}
          description={getPicksSignupDescription(picks)}
        />
      </AuthenticationBanner>
    );
  }

  const onJoin = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.SignupButton,
      target_id: TargetId.PicksSignupBanner,
      extra: JSON.stringify({ picks_id: picks.id }),
    });
    // Same hand-off as the page's CTA, back to this list once signed up.
    router.push(
      `${onboardingUrl}?${new URLSearchParams({
        [AFTER_AUTH_PARAM]: getPicksPath(picks.id),
      }).toString()}`,
    );
  };

  return (
    <section
      aria-label="Join daily.dev"
      className="flex items-start gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4"
    >
      <ProfilePicture
        user={author}
        size={ProfileImageSize.Large}
        nativeLazyLoading
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography
          type={TypographyType.Callout}
          bold
          color={TypographyColor.Primary}
          className="break-words"
        >
          {author.name} {PICKS_SIGNUP_TITLE}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="break-words"
        >
          {getPicksSignupDescription(picks)}
        </Typography>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          className="mt-2 self-start"
          onClick={onJoin}
        >
          Join daily.dev
        </Button>
      </div>
    </section>
  );
}
