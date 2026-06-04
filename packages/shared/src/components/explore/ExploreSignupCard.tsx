import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import { BellIcon, HashtagIcon, MagicIcon } from '../icons';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, TargetType } from '../../lib/log';
import { largeNumberFormat } from '../../lib';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface ExploreSignupCardProps {
  // When set, the copy is scoped to the specific tag; omitted on the lobby.
  tag?: string;
  // The tag's post count — surfaced as a live activity signal when available.
  postsCount?: number;
  className?: string;
}

const ValueRow = ({
  icon: Icon,
  children,
}: {
  icon: (props: IconProps) => ReactElement;
  children: string;
}): ReactElement => (
  <li className="flex items-center gap-3">
    <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-background-default text-brand-default">
      <Icon size={IconSize.Size16} />
    </span>
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Callout}
      color={TypographyColor.Secondary}
    >
      {children}
    </Typography>
  </li>
);

// A contained, visual "join daily.dev" card for logged-out visitors. It makes
// the payoff explicit — follow this tag, get a personalized feed, get updates —
// with a single, prominent Sign up action. Renders nothing when logged in.
export function ExploreSignupCard({
  tag,
  postsCount,
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

  const heading = tag ? `Keep up with #${tag}` : 'Make daily.dev your feed';
  const subtitle = tag
    ? `Sign up free to follow #${tag} — the new posts will come to you.`
    : 'Sign up free to follow the tags you care about and never miss what’s new.';
  const feedCopy = 'A personalized feed built around the tags you follow';
  const updatesCopy = tag
    ? `New #${tag} posts the moment they drop`
    : 'New posts the moment they drop';
  const postsLabel =
    typeof postsCount === 'number' && postsCount > 0
      ? `${largeNumberFormat(postsCount)} posts`
      : null;

  return (
    <aside
      className={classNames(
        'mx-auto w-full max-w-[26rem] overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float',
        className,
      )}
    >
      <div
        aria-hidden
        className="h-1 w-full bg-gradient-to-r from-accent-cabbage-default to-accent-onion-default"
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-16 bg-background-default text-brand-default">
            <HashtagIcon size={IconSize.XLarge} />
          </span>
          <div className="flex flex-col gap-1">
            <Typography
              tag={TypographyTag.H3}
              type={TypographyType.Title3}
              color={TypographyColor.Primary}
              bold
            >
              {heading}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              {subtitle}
            </Typography>
          </div>
        </div>

        <ul className="flex flex-col gap-2.5">
          <ValueRow icon={MagicIcon}>{feedCopy}</ValueRow>
          <ValueRow icon={BellIcon}>{updatesCopy}</ValueRow>
        </ul>

        <div className="flex flex-col items-center gap-3">
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            className="w-full"
            onClick={onSignup}
          >
            Sign up — it&apos;s free
          </Button>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="flex flex-wrap items-center justify-center gap-x-1"
          >
            <span>Join millions of developers on daily.dev</span>
            {postsLabel && (
              <>
                <span aria-hidden>·</span>
                <span>{postsLabel}</span>
              </>
            )}
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Already on daily.dev?{' '}
            <ClickableText
              tag="button"
              type="button"
              onClick={onLogin}
              className="!inline"
            >
              Log in
            </ClickableText>
          </Typography>
        </div>
      </div>
    </aside>
  );
}
