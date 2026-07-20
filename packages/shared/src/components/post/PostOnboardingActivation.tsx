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
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import CloseButton from '../CloseButton';
import { VIcon } from '../icons/V';
import { IconSize } from '../Icon';
import {
  Typography,
  TypographyColor,
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
      className="relative mb-4 w-full overflow-hidden border-y border-border-subtlest-secondary bg-surface-float shadow-2 laptop:mx-auto laptop:max-w-[69.25rem] laptop:rounded-16 laptop:border"
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-accent-cabbage-default" />
      <div className="relative flex w-full flex-col gap-5 px-5 py-5 pr-14 tablet:flex-row tablet:items-center tablet:gap-8 tablet:px-6 tablet:pr-14 laptop:px-8">
        <div className="min-w-0 flex-1">
          <div
            aria-label="Account ready. Final setup step."
            className="mb-2.5 flex items-center gap-2 font-bold uppercase tracking-wide typo-caption1"
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-accent-cabbage-default text-white">
              <VIcon secondary size={IconSize.Size16} />
            </span>
            <span className="text-text-secondary">Account ready</span>
            <span className="h-px w-6 bg-border-subtlest-secondary" />
            <span className="font-mono text-accent-cabbage-default">
              Final setup
            </span>
          </div>
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
            bold
            className="[text-wrap:balance] tablet:!typo-title2"
          >
            You&apos;re in. Now make daily.dev yours.
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="mt-1.5 max-w-[42rem] [text-wrap:pretty]"
          >
            Choose a few topics. We&apos;ll cut the noise and build a feed worth
            coming back to.
          </Typography>
        </div>

        <div className="flex w-full shrink-0 flex-col items-center gap-1.5 tablet:w-auto tablet:border-l tablet:border-border-subtlest-secondary tablet:pl-8">
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            size={ButtonSize.Large}
            className="w-full transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-2-cabbage active:translate-y-0 motion-reduce:transform-none tablet:min-w-52"
            onClick={onBuildFeed}
          >
            Personalize my feed
          </Button>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Secondary}
          >
            About 1 minute · change it anytime
          </Typography>
        </div>

        <CloseButton
          type="button"
          aria-label="Dismiss feed personalization"
          className="absolute right-3 top-3"
          size={ButtonSize.Small}
          onClick={onDismiss}
        />
      </div>
    </aside>
  );
};
