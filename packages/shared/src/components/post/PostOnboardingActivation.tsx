import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import styles from './PostOnboardingActivation.module.css';
import { PostOnboardingActivationView } from './PostOnboardingActivationView';
import { useAuthContext } from '../../contexts/AuthContext';
import { useOnboardingActions } from '../../hooks/auth/useOnboardingActions';
import { useLogContext } from '../../contexts/LogContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featurePostSignupActivation } from '../../lib/featureManagement';
import { LogEvent, TargetType } from '../../lib/log';
import { AFTER_AUTH_PARAM } from '../auth/common';

export const PostOnboardingActivation = (): ReactElement | null => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { isOnboardingActionsReady, isOnboardingComplete } =
    useOnboardingActions();

  // Never show on the onboarding flow itself — that's where the CTA leads.
  const isOnboardingRoute = router.pathname?.startsWith('/onboarding');

  // Signed-in user who registered but hasn't set up their feed (no tag/content
  // customization). This is the audience for the required activation step.
  const isEligible =
    !isOnboardingRoute &&
    !!user?.id &&
    isOnboardingActionsReady &&
    !isOnboardingComplete;

  const { value: isFeatureEnabled } = useConditionalFeature({
    feature: featurePostSignupActivation,
    shouldEvaluate: isEligible,
  });

  const shouldShow = isEligible && isFeatureEnabled;

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.PostSignupActivation,
    }),
    { condition: shouldShow },
  );

  if (!shouldShow) {
    return null;
  }

  const onBuildFeed = (): void => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.PostSignupActivation,
    });

    router.push({
      pathname: '/onboarding',
      query: { [AFTER_AUTH_PARAM]: router.asPath },
    });
  };

  return (
    // Pinned above everything: `top` and the reserved height live in the module
    // (not the `top-0` class) so the global safe-area rule doesn't push the bar
    // itself down; z sits above the notch-fill (`1000`) so it stays visible.
    <div className={classNames('fixed inset-x-0 z-[1001]', styles.pinned)}>
      <PostOnboardingActivationView
        className="flex h-full items-center"
        onCtaClick={onBuildFeed}
      />
    </div>
  );
};
