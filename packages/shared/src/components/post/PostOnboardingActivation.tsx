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
      <div className="relative flex w-full flex-col gap-5 px-5 py-5 pr-14 tablet:flex-row tablet:items-center tablet:gap-8 tablet:px-6 tablet:py-6 tablet:pr-14 laptop:px-8">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2 font-bold uppercase tracking-wide typo-caption1">
            <span className="flex size-5 items-center justify-center rounded-full bg-accent-cabbage-default text-white">
              <VIcon secondary size={IconSize.Size16} />
            </span>
            <span className="text-text-tertiary">Account created</span>
            <span className="h-px w-6 bg-border-subtlest-secondary" />
            <span className="text-accent-cabbage-default">One step left</span>
          </div>
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Title2}
            bold
            className="[text-wrap:balance]"
          >
            Your account is ready. Your feed isn&apos;t.
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="mt-1 max-w-[42rem] [text-wrap:pretty]"
          >
            Choose what you care about once. We&apos;ll filter the noise and
            make daily.dev worth opening every day.
          </Typography>
        </div>

        <div className="flex w-full shrink-0 flex-col items-center gap-1.5 tablet:w-auto">
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            size={ButtonSize.Large}
            className="w-full tablet:w-auto"
            onClick={onBuildFeed}
          >
            Choose my topics
          </Button>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Secondary}
          >
            Takes about 1 minute
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
