import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import { HashtagIcon } from '../icons';
import { IconSize } from '../Icon';
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

interface ExploreSignupCtaProps {
  // When set, the copy is scoped to the specific tag; omitted on the lobby.
  tag?: string;
  className?: string;
}

// A compact, feed-native signup nudge for logged-out visitors. One short line
// of value + a single Sign up action — small enough to sit inside the content
// flow on both the tag page and the lobby. Renders nothing when logged in.
export function ExploreSignupCta({
  tag,
  className,
}: ExploreSignupCtaProps): ReactElement | null {
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

  const heading = tag
    ? `Follow #${tag} on daily.dev`
    : 'Build your developer feed';
  const subtitle = tag
    ? 'Sign up free to build a feed around the tags you follow.'
    : 'Follow the tags you love and keep up with what matters — free.';

  return (
    <aside
      className={classNames(
        'flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 mobileL:flex-row mobileL:items-center mobileL:gap-4',
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background-default text-brand-default"
      >
        <HashtagIcon size={IconSize.Medium} />
      </span>
      <div className="min-w-0 flex-1">
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
        >
          {heading}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
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
