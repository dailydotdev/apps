import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';

interface ExtensionSignInContentProps {
  className?: string;
}

// The sign-in title and Log in / Sign up CTAs for logged-out users. Renders
// nothing until auth resolves, or once the user is logged in.
export const ExtensionSignInContent = ({
  className,
}: ExtensionSignInContentProps): ReactElement | null => {
  const { isAuthReady, isLoggedIn, showLogin } = useAuthContext();

  if (!isAuthReady || isLoggedIn) {
    return null;
  }

  const onLogIn = () =>
    showLogin({
      trigger: AuthTriggers.MainButton,
      options: { isLogin: true },
    });
  const onSignUp = () =>
    showLogin({
      trigger: AuthTriggers.MainButton,
      options: { isLogin: false },
    });

  return (
    <div
      className={classNames(
        'flex w-full items-center justify-between gap-4',
        className,
      )}
    >
      <Typography
        type={TypographyType.Body}
        bold
        className="min-w-0 flex-1 text-text-primary"
      >
        Sign in to personalize your feed and save what matters.
      </Typography>
      <div className="flex shrink-0 items-center gap-2">
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
  );
};

// Sticky strip pinned to the top of the new tab for logged-out users so
// the auth CTAs stay reachable while scrolling. Shares the feed's
// primary background so it reads as part of the same surface.
export const ExtensionSignInStrip = (): ReactElement | null => {
  const { isAuthReady, isLoggedIn } = useAuthContext();

  if (!isAuthReady || isLoggedIn) {
    return null;
  }

  return (
    <section
      aria-label="Sign in to daily.dev"
      className="sticky top-0 z-3 mx-4 mb-3 laptop:mx-0"
    >
      <ExtensionSignInContent className="rounded-12 border border-border-subtlest-quaternary bg-background-default px-6 py-4" />
    </section>
  );
};
