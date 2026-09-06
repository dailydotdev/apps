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
  const isAnonymous = isAuthReady && !user;
  const hasLoggedImpression = useRef(false);

  useEffect(() => {
    if (!isAnonymous || hasLoggedImpression.current) {
      return;
    }

    hasLoggedImpression.current = true;
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.SignupButton,
      target_id: targetId,
    });
  }, [isAnonymous, logEvent]);

  // The server cannot know the visitor, so it paints the page without the
  // strip; holding its slot until boot answers keeps the H1 from jumping.
  if (!isAuthReady) {
    return (
      <div
        aria-hidden
        className={classNames(hijackingCoverStripMinHeight, className)}
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
      className={className}
      onSignupClick={onAuthClick(false)}
      onLoginClick={onAuthClick(true)}
    />
  );
}
