import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Typography, TypographyType } from '../typography/Typography';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, TargetType } from '../../lib/log';
import { GetAppButton } from '../../features/getApp/components/GetAppButton';

// Sticky strip pinned to the top of the floating card for anonymous laptop
// sessions, so the auth CTAs stay reachable while the page scrolls: the one
// thing the fixed global header did that the rail cannot. Shares the feed's
// primary background so it reads as part of the same surface. Webapp only:
// the extension's new tab shows visitors the hijacking cover strip and puts
// its sign-in CTAs in the feed's page header instead (#7035).
export const SignInStrip = (): ReactElement | null => {
  const { isAuthReady, isLoggedIn, showLogin } = useAuthContext();
  const { logEvent } = useLogContext();

  if (!isAuthReady || isLoggedIn) {
    return null;
  }

  // `target_id: 'header'` on purpose: the strip replaces the global header's
  // Log in / Sign up pair, and the login funnel dashboards key on that id.
  const onLogIn = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.LoginButton,
      target_id: 'header',
    });
    showLogin({
      trigger: AuthTriggers.MainButton,
      options: { isLogin: true },
    });
  };
  const onSignUp = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.SignupButton,
      target_id: 'header',
    });
    showLogin({
      trigger: AuthTriggers.MainButton,
      options: { isLogin: false },
    });
  };

  return (
    // Pins under whatever fixed chrome the layout has: MainLayout publishes
    // `--sticky-header-offset` (2rem under the promotional banner when the
    // rail owns the header, 0 otherwise), so the strip never scrolls up
    // behind the banner.
    <section
      aria-label="Sign in to daily.dev"
      className="sticky top-[var(--sticky-header-offset,0px)] z-3 mx-4 mb-3 laptop:mx-0"
    >
      <div className="flex items-center justify-between gap-4 rounded-12 border border-border-subtlest-quaternary bg-background-default px-6 py-4">
        <Typography
          type={TypographyType.Body}
          bold
          className="min-w-0 flex-1 text-text-primary"
        >
          Sign in to personalize your feed
        </Typography>
        <div className="flex shrink-0 items-center gap-2">
          {/* Same shape as Log in beside it: the three read as one row. */}
          <GetAppButton
            showLabel
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
          />
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            onClick={onLogIn}
          >
            Log in
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={onSignUp}
          >
            Sign up
          </Button>
        </div>
      </div>
    </section>
  );
};
