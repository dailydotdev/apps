import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { BellIcon, BookmarkIcon, HashtagIcon, UpvoteIcon } from '../icons';
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

interface TagSignupBannerProps {
  tag: string;
  className?: string;
}

const TARGET_ID = 'tag_page';

const benefits = [
  { icon: HashtagIcon, copy: 'A feed tuned to your stack' },
  { icon: BookmarkIcon, copy: 'Save posts to read later' },
  { icon: UpvoteIcon, copy: 'Upvote & discuss with devs' },
  { icon: BellIcon, copy: 'Never miss what matters' },
];

// Signup-first conversion banner for the high-traffic, logged-out SEO/AEO
// landings on a topic page (mirrors the new-tab hijacking strip from #6127).
// Renders nothing for logged-in users.
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
        'flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6',
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          color={TypographyColor.Primary}
          bold
        >
          Get the best of {tag} — personalized
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
          className="max-w-[40rem]"
        >
          Join millions of developers on daily.dev. Follow {tag}, build a feed
          tuned to your stack, and keep up with everything you care about — in
          one place.
        </Typography>
      </div>

      <ul className="grid grid-cols-1 gap-2 mobileL:grid-cols-2">
        {benefits.map(({ icon: Icon, copy }) => (
          <li key={copy} className="flex items-center gap-2">
            <Icon
              size={IconSize.Size16}
              className="shrink-0 text-text-secondary"
            />
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              {copy}
            </Typography>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 mobileL:flex-row mobileL:items-center">
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          onClick={onSignup}
        >
          Sign up — it&apos;s free
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Large}
          onClick={onLogin}
        >
          Log in
        </Button>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="mobileL:ml-2"
        >
          Free forever · No credit card
        </Typography>
      </div>
    </aside>
  );
}
