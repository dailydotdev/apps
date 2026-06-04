import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, TargetType } from '../../lib/log';
import { authGradientBg } from '../marketing/banners/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface ExploreSignupCardProps {
  // When set, the copy is scoped to the specific tag; omitted on the lobby.
  tag?: string;
  className?: string;
}

// A compact, branded signup strip for logged-out visitors — one explicit line
// of value + a single Sign up action, kept deliberately small so it reads at a
// glance without taking over the layout. Renders nothing when logged in.
export function ExploreSignupCard({
  tag,
  className,
}: ExploreSignupCardProps): ReactElement | null {
  const { isAuthReady, isLoggedIn, showLogin } = useAuthContext();
  const { logEvent } = useLogContext();
  const impressionLogged = useRef(false);

  const show = isAuthReady && !isLoggedIn;
  const targetId = tag ? 'tag_page' : 'tags_lobby';

  useEffect(() => {
    if (show && !impressionLogged.current) {
      impressionLogged.current = true;
      logEvent({
        event_name: LogEvent.Impression,
        target_type: TargetType.SignupButton,
        target_id: targetId,
      });
    }
  }, [show, logEvent, targetId]);

  if (!show) {
    return null;
  }

  const onSignup = (): void => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.SignupButton,
      target_id: targetId,
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
      target_id: targetId,
    });
    showLogin({ trigger: AuthTriggers.Onboarding, options: { isLogin: true } });
  };

  const title = tag
    ? `Get every new #${tag} post in your feed`
    : 'Your personalized developer feed';
  const subtitle = tag
    ? `Sign up free to follow #${tag} on daily.dev.`
    : 'Sign up free to follow the tags you care about.';

  return (
    <aside
      className={classNames(
        'mx-auto flex w-full max-w-[44rem] flex-col gap-3 rounded-16 border border-border-subtlest-tertiary px-4 py-3 mobileL:flex-row mobileL:items-center mobileL:justify-between mobileL:gap-6',
        authGradientBg,
        className,
      )}
    >
      <div className="min-w-0">
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
        >
          {title}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
        >
          {subtitle}
        </Typography>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onSignup}
        >
          Sign up — it&apos;s free
        </Button>
        <ClickableText tag="button" type="button" onClick={onLogin}>
          Log in
        </ClickableText>
      </div>
    </aside>
  );
}
