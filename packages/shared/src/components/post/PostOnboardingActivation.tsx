import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { PostOnboardingActivationView } from './PostOnboardingActivationView';
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
    <PostOnboardingActivationView
      className="mb-4"
      onCtaClick={onBuildFeed}
      onDismiss={onDismiss}
    />
  );
};
