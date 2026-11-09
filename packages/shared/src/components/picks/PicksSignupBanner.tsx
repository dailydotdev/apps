import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { Picks } from '../../graphql/picks';
import { getPicksPath } from '../../graphql/picks';
import { getCurrentWeekStart } from '../../lib/picks';
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
import { usePublicPageSignupBannerGate } from '../auth/PublicPageSignupBanner';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

export const PICKS_SIGNUP_TITLE = 'thought you may want to read these';

/**
 * Shared links outlive the week, so the time phrase is only there while the
 * list is the current week's. An emptied list gets no prompt at all.
 */
export const getPicksSignupDescription = (picks: Picks): string => {
  const count = picks.items.length;
  const posts = `${count} ${count === 1 ? 'post' : 'posts'}`;
  const when = picks.weekStart === getCurrentWeekStart() ? ' this week' : '';

  return `${posts} picked${when}. Join daily.dev to save them and share your own picks.`;
};

type Placement = 'pinned' | 'inline';

const getLogExtra = (picks: Picks, placement: Placement): string =>
  JSON.stringify({ picks_id: picks.id, placement });

const useSignupImpression = (
  picks: Picks,
  placement: Placement,
  shouldShow: boolean,
): void => {
  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.SignupButton,
      target_id: TargetId.PicksSignupBanner,
      extra: getLogExtra(picks, placement),
    }),
    { condition: shouldShow },
  );
};

interface PicksSignupProps {
  picks: Picks;
}

/**
 * The public pages' pinned bottom banner, in the author's voice: their
 * picture and name, then the invitation, with inline signup. Laptop only,
 * through the same gate as every other public page, and placed at the end
 * of the page so its spacer keeps the last of the content reachable.
 */
export function PicksSignupBanner({
  picks,
}: PicksSignupProps): ReactElement | null {
  const { shouldShow: isGateOpen } = usePublicPageSignupBannerGate();
  const shouldShow = isGateOpen && picks.items.length > 0;
  const { author } = picks;

  useSignupImpression(picks, 'pinned', shouldShow);

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      <div aria-hidden className="h-72" />
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
    </>
  );
}

/**
 * Below laptop, where the pinned banner never shows: a card under the
 * header that goes through onboarding and comes back to this list once
 * signed up.
 */
export function PicksSignupCard({
  picks,
}: PicksSignupProps): ReactElement | null {
  const router = useRouter();
  const { logEvent } = useLogContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const shouldShow =
    !isLaptop && isAuthReady && !isLoggedIn && picks.items.length > 0;
  const { author } = picks;

  useSignupImpression(picks, 'inline', shouldShow);

  if (!shouldShow) {
    return null;
  }

  const onJoin = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.SignupButton,
      target_id: TargetId.PicksSignupBanner,
      extra: getLogExtra(picks, 'inline'),
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
