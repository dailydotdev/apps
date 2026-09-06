import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import type { HijackingCoverCopy } from './HijackingCoverStrip';
import {
  HijackingCoverStrip,
  hijackingCoverStripMinHeight,
} from './HijackingCoverStrip';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, TargetType } from '../../lib/log';

const targetId = 'explore strip';

// The new tab's copy, with the headline pointed at the feed rather than the tab.
const copy: HijackingCoverCopy = {
  heading: 'Own your feed. Make it your dev briefing.',
  body: 'Sign in and daily.dev remembers the topics, saves, and discussions that matter to you.',
  signup: 'Sign up',
  login: 'Log in',
};

// The new tab's cover strip on the Explore hub, for anonymous visitors only.
export function ExploreSignupStrip({
  className,
}: {
  className?: string;
}): ReactElement | null {
  const { isAuthReady, user, showLogin } = useAuthContext();
  const { logEvent } = useLogContext();
  const isTablet = useViewSize(ViewSize.Tablet);
  const isAnonymous = isAuthReady && !user;
  const hasLoggedImpression = useRef(false);

  useEffect(() => {
    if (!isAnonymous || !isTablet || hasLoggedImpression.current) {
      return;
    }

    hasLoggedImpression.current = true;
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.SignupButton,
      target_id: targetId,
    });
  }, [isAnonymous, isTablet, logEvent]);

  // Phones already carry the header's Log in / Sign up pair. The gate is CSS so
  // the slot is already in the SSR HTML and hydration doesn't reflow the H1;
  // the impression above takes the matching JS gate instead, so a phone that
  // never paints the strip doesn't report seeing it.
  const visibility = 'hidden tablet:block';

  // The server cannot know the visitor, so it paints the page without the
  // strip; holding its slot until boot answers keeps the H1 from jumping.
  if (!isAuthReady) {
    return (
      <div
        aria-hidden
        className={classNames(
          visibility,
          hijackingCoverStripMinHeight,
          className,
        )}
      />
    );
  }

  if (user) {
    return null;
  }

  const onAuthClick = (isLogin: boolean) => (): void => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: isLogin ? TargetType.LoginButton : TargetType.SignupButton,
      target_id: targetId,
    });

    showLogin({ trigger: AuthTriggers.Onboarding, options: { isLogin } });
  };

  return (
    <HijackingCoverStrip
      copy={copy}
      className={classNames(visibility, className)}
      onSignupClick={onAuthClick(false)}
      onLoginClick={onAuthClick(true)}
    />
  );
}
