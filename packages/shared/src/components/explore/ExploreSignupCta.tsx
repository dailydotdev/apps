import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import { BellIcon, HashtagIcon } from '../icons';
import { IconSize } from '../Icon';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, TargetType } from '../../lib/log';
import { largeNumberFormat } from '../../lib';
import { authGradientBg } from '../marketing/banners/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface ExploreSignupCtaProps {
  // When set, the copy is scoped to the specific tag; omitted on the lobby.
  tag?: string;
  // The tag's post count — surfaced as a live activity signal when available.
  postsCount?: number;
  className?: string;
}

// A branded, value-led signup nudge for logged-out visitors. It sells the
// concrete payoff (follow the tag → get updates → personalized feed) with a bit
// of social proof, and stands out from the plain feed cards via the auth
// gradient — while still living inside the content flow. Hidden when logged in.
export function ExploreSignupCta({
  tag,
  postsCount,
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

  const heading = tag ? `Stay on top of #${tag}` : 'Your feed, your tags';
  const subtitle = tag
    ? `Follow #${tag} to get new posts in a feed built around your stack — and a heads-up when something big drops.`
    : 'Follow the tags you care about and get a personalized feed of what matters to you.';
  const postsLabel =
    typeof postsCount === 'number' && postsCount > 0
      ? `${largeNumberFormat(postsCount)} posts`
      : null;

  return (
    <aside
      className={classNames(
        'relative overflow-hidden rounded-16 border border-border-subtlest-tertiary p-5',
        authGradientBg,
        className,
      )}
    >
      <div className="flex flex-col gap-4 laptop:flex-row laptop:items-center laptop:justify-between laptop:gap-6">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center rounded-14 bg-background-default text-brand-default"
          >
            <HashtagIcon size={IconSize.Large} />
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
              className="max-w-[34rem]"
            >
              {subtitle}
            </Typography>
            <div className="mt-1 flex items-center gap-2 text-text-tertiary typo-footnote">
              <BellIcon size={IconSize.Size16} className="text-brand-default" />
              <span>Join millions of developers on daily.dev</span>
              {postsLabel && (
                <>
                  <span aria-hidden>·</span>
                  <span>{postsLabel}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            onClick={onSignup}
          >
            Sign up — it&apos;s free
          </Button>
          <ClickableText tag="button" type="button" onClick={onLogin}>
            Log in
          </ClickableText>
        </div>
      </div>
    </aside>
  );
}
