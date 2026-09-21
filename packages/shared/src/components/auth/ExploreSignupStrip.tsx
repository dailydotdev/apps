import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { HijackingCoverCopy } from './HijackingCoverStrip';
import {
  HijackingCoverAuthActions,
  HijackingCoverStrip,
  HijackingCoverStripPlaceholder,
} from './HijackingCoverStrip';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, TargetId, TargetType } from '../../lib/log';

// The new tab control strip's signed-out copy.
const copy: HijackingCoverCopy = {
  heading: 'Unlock the full daily.dev experience',
  body: 'Log in to pick up where you left off.',
};

// The new tab's cover strip for anonymous visitors, tablet and up.
export function ExploreSignupStrip({
  className,
}: {
  className?: string;
}): ReactElement | null {
  const { isAuthReady, user, showLogin } = useAuthContext();
  const { logEvent } = useLogContext();
  const isTablet = useViewSize(ViewSize.Tablet);
  const isAnonymous = isAuthReady && !user;

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.SignupButton,
      target_id: TargetId.ExploreStrip,
    }),
    { condition: isAnonymous && isTablet },
  );

  if (user) {
    return null;
  }

  // Holds the strip's slot in the server HTML until boot answers.
  if (!isAuthReady) {
    return (
      <HijackingCoverStripPlaceholder
        className={classNames('hidden tablet:block', className)}
      />
    );
  }

  if (!isTablet) {
    return null;
  }

  const onAuthClick = (isLogin: boolean) => (): void => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: isLogin ? TargetType.LoginButton : TargetType.SignupButton,
      target_id: TargetId.ExploreStrip,
    });

    showLogin({ trigger: AuthTriggers.Onboarding, options: { isLogin } });
  };

  return (
    <HijackingCoverStrip
      copy={copy}
      className={className}
      actions={
        <HijackingCoverAuthActions
          signup="Sign up"
          login="Log in"
          onSignupClick={onAuthClick(false)}
          onLoginClick={onAuthClick(true)}
        />
      }
    />
  );
}
