import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import { useOnboardingActions } from '../../hooks/auth/useOnboardingActions';
import { useLogContext } from '../../contexts/LogContext';
import { TargetType } from '../../lib/log';
import { isDevelopment } from '../../lib/constants';
import {
  clearPostSignupActivation,
  hasPostSignupActivation,
  isPostOnboardingPreviewEnabled,
  POST_ONBOARDING_PREVIEW_QUERY,
} from '../../lib/postSignupActivation';
import { AFTER_AUTH_PARAM } from '../auth/common';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import CloseButton from '../CloseButton';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

export const PostOnboardingActivation = (): ReactElement | null => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { isOnboardingActionsReady, isOnboardingComplete } =
    useOnboardingActions();
  const [isVisible, setIsVisible] = useState(false);
  const [isLocalPreviewDismissed, setIsLocalPreviewDismissed] = useState(false);
  const hasLoggedImpression = useRef(false);
  const isPreviewMode =
    isDevelopment ||
    isPostOnboardingPreviewEnabled(
      router.query?.[POST_ONBOARDING_PREVIEW_QUERY],
    );

  useEffect(() => {
    if (!user?.id || !isOnboardingActionsReady) {
      return;
    }

    if (isOnboardingComplete) {
      clearPostSignupActivation();
      return;
    }

    setIsVisible(hasPostSignupActivation(user.id));
  }, [isOnboardingActionsReady, isOnboardingComplete, user?.id]);

  const shouldShow =
    (isPreviewMode && !isLocalPreviewDismissed) ||
    (!!user?.id &&
      isOnboardingActionsReady &&
      !isOnboardingComplete &&
      isVisible);

  useEffect(() => {
    if (!shouldShow || hasLoggedImpression.current) {
      return;
    }

    hasLoggedImpression.current = true;
    logEvent({
      event_name: 'impression',
      target_type: TargetType.PostSignupActivation,
      target_id: 'post signup activation',
    });
  }, [logEvent, shouldShow]);

  if (!shouldShow) {
    return null;
  }

  const onDismiss = (): void => {
    if (isPreviewMode) {
      setIsLocalPreviewDismissed(true);
    } else {
      clearPostSignupActivation();
    }
    setIsVisible(false);
    logEvent({
      event_name: 'click',
      target_type: TargetType.PostSignupActivation,
      target_id: 'dismiss post signup activation',
    });
  };

  const onBuildFeed = (): void => {
    logEvent({
      event_name: 'click',
      target_type: TargetType.PostSignupActivation,
      target_id: 'build feed from post signup activation',
    });

    router.push({
      pathname: '/onboarding',
      query: { [AFTER_AUTH_PARAM]: router.asPath },
    });
  };

  return (
    <aside
      aria-label="Personalize your feed"
      className="relative mb-4 w-full overflow-hidden border-y border-white/[0.08] bg-raw-pepper-90 shadow-2 laptop:mx-auto laptop:max-w-[69.25rem] laptop:rounded-16 laptop:border"
    >
      {/* Soft brand glow bleeding in from the right, echoing the strip banner. */}
      <div className="bg-accent-cabbage-default/25 pointer-events-none absolute -right-16 top-1/2 h-48 w-72 -translate-y-1/2 rounded-full blur-3xl" />
      <div className="bg-accent-onion-default/20 pointer-events-none absolute right-24 top-1/2 h-40 w-56 -translate-y-1/2 rounded-full blur-3xl" />
      {/* Hairline sheen along the top edge for the glossy panel feel. */}
      <div className="via-white/20 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

      <div className="relative flex flex-col gap-4 px-5 py-4 pr-12 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-6 tablet:pr-14 laptop:px-6">
        <div className="flex min-w-0 items-center gap-3.5">
          {/* Progress ring: setup started, not finished (step 1 of 2). */}
          <span
            className="relative flex size-11 shrink-0 items-center justify-center"
            aria-hidden
          >
            <svg viewBox="0 0 36 36" className="size-11 -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                strokeWidth="3"
                stroke="currentColor"
                className="text-white/15"
              />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                strokeDasharray="94.25"
                strokeDashoffset="47.13"
                className="text-accent-cabbage-default"
              />
            </svg>
            <span className="absolute font-bold text-white typo-caption1">
              1/2
            </span>
          </span>
          <div className="min-w-0">
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Callout}
              bold
              className="text-white [text-wrap:balance]"
            >
              Your feed isn&apos;t set up yet
            </Typography>
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Footnote}
              className="text-white/60 mt-0.5 [text-wrap:pretty]"
            >
              Finish setup to discover what&apos;s next.
            </Typography>
          </div>
        </div>

        <Button
          type="button"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Medium}
          // Panel is always dark, so pin the subtle button to its dark-theme
          // look instead of letting it flip to dark text in the light theme.
          className="!border-white/20 !bg-white/5 hover:!bg-white/15 w-full shrink-0 !text-white tablet:w-auto tablet:min-w-40"
          onClick={onBuildFeed}
        >
          Continue setup
        </Button>
      </div>

      <CloseButton
        type="button"
        aria-label="Dismiss feed personalization"
        className="!text-white/60 absolute right-3 top-3 hover:!text-white tablet:top-1/2 tablet:-translate-y-1/2"
        size={ButtonSize.Small}
        onClick={onDismiss}
      />
    </aside>
  );
};
