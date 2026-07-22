import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { PostOnboardingActivationView } from './PostOnboardingActivationView';
import { useAuthContext } from '../../contexts/AuthContext';
import { useOnboardingActions } from '../../hooks/auth/useOnboardingActions';
import { useLogContext } from '../../contexts/LogContext';
import { TargetType } from '../../lib/log';
import { isDevelopment } from '../../lib/constants';
import {
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
  const hasLoggedImpression = useRef(false);
  const isPreviewMode =
    isDevelopment ||
    isPostOnboardingPreviewEnabled(
      router.query?.[POST_ONBOARDING_PREVIEW_QUERY],
    );

  // Required step: show on every page for a signed-in user until they finish
  // setting up their feed. No dismissal.
  const shouldShow =
    isPreviewMode ||
    (!!user?.id && isOnboardingActionsReady && !isOnboardingComplete);

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
    <PostOnboardingActivationView className="mb-4" onCtaClick={onBuildFeed} />
  );
};
