import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, TargetType } from '../../lib/log';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface TagSignupBannerProps {
  tag: string;
  className?: string;
}

const TARGET_ID = 'tag_page';

// A simple, sharp signup prompt for logged-out visitors landing on a tag page:
// one clear message + a single primary action. Renders nothing when logged in.
export function TagSignupBanner({
  tag,
  className,
}: TagSignupBannerProps): ReactElement | null {
  const { isAuthReady, isLoggedIn, showLogin } = useAuthContext();
  const { logEvent } = useLogContext();
  const impressionLogged = useRef(false);

  const show = isAuthReady && !isLoggedIn;

  useEffect(() => {
    if (show && !impressionLogged.current) {
      impressionLogged.current = true;
      logEvent({
        event_name: LogEvent.Impression,
        target_type: TargetType.SignupButton,
        target_id: TARGET_ID,
      });
    }
  }, [show, logEvent]);

  if (!show) {
    return null;
  }

  const onSignup = (): void => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.SignupButton,
      target_id: TARGET_ID,
    });
    showLogin({
      trigger: AuthTriggers.Onboarding,
      options: { isLogin: false },
    });
  };

  const onLogin = (): void => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.LoginButton,
      target_id: TARGET_ID,
    });
    showLogin({ trigger: AuthTriggers.Onboarding, options: { isLogin: true } });
  };

  return (
    <aside
      className={classNames(
        'flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5 mobileL:flex-row mobileL:items-center mobileL:justify-between mobileL:gap-6',
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title3}
          color={TypographyColor.Primary}
          bold
        >
          Follow {tag} on daily.dev
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Create a free account to follow the tags you care about and get a feed
          built around your stack.
        </Typography>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          onClick={onSignup}
        >
          Sign up
        </Button>
        <ClickableText tag="button" type="button" onClick={onLogin}>
          Log in
        </ClickableText>
      </div>
    </aside>
  );
}
