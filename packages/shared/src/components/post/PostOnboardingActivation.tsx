import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { PostOnboardingActivationView } from './PostOnboardingActivationView';
import { useAuthContext } from '../../contexts/AuthContext';
import { useOnboardingActions } from '../../hooks/auth/useOnboardingActions';
import { useLogContext } from '../../contexts/LogContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featurePostSignupActivation } from '../../lib/featureManagement';
import { TargetType } from '../../lib/log';
import { AFTER_AUTH_PARAM } from '../auth/common';

// Force the bar on for local review without GrowthBook via `?<query>=1`.
const PREVIEW_QUERY = 'postOnboardingPreview';
const isPreviewEnabled = (value?: string | string[]): boolean =>
  value === '1' ||
  value === 'true' ||
  (Array.isArray(value) && (value.includes('1') || value.includes('true')));

export const PostOnboardingActivation = (): ReactElement | null => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { isOnboardingActionsReady, isOnboardingComplete } =
    useOnboardingActions();
  const hasLoggedImpression = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Never show on the onboarding flow itself — that's where the CTA leads.
  const isOnboardingRoute = router.pathname?.startsWith('/onboarding');
  const isPreviewMode = isPreviewEnabled(router.query?.[PREVIEW_QUERY]);

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

  const shouldShow =
    !isOnboardingRoute && (isPreviewMode || (isEligible && isFeatureEnabled));

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

  // The bar is pinned above all fixed chrome. Reserve its height at the top of
  // the app by feeding it into `--safe-area-top` (which shifts the rail, header
  // and body content down) while preserving the real device notch inset.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!shouldShow || !el || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const root = document.documentElement;
    const apply = (): void => {
      const height = Math.round(el.getBoundingClientRect().height);
      root.style.setProperty(
        '--safe-area-top',
        `calc(env(safe-area-inset-top, 0px) + ${height}px)`,
      );
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);

    return () => {
      observer.disconnect();
      root.style.removeProperty('--safe-area-top');
    };
  }, [shouldShow]);

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
    // Pinned above everything. `top` is set inline (not the `top-0` class) so
    // the global safe-area rule doesn't push the bar itself down; z sits above
    // the notch-fill (`max`) so it stays visible.
    <div
      ref={wrapperRef}
      className="fixed inset-x-0 z-[1001]"
      style={{ top: 0 }}
    >
      <PostOnboardingActivationView onCtaClick={onBuildFeed} />
    </div>
  );
};
