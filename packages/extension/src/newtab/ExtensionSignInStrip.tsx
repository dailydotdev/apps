import type { ReactElement } from 'react';
import React from 'react';
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
import { useExtensionMockup } from './useExtensionMockup';

// Sticky banner pinned to the top of the new tab for logged-out users.
// Sits above shortcuts and any other top-page modules so the auth CTAs
// are the first thing the user sees and remain reachable while
// scrolling. Shares the feed's primary background so it reads as part
// of the same surface (no glass / blur / shadow).
export const ExtensionSignInStrip = (): ReactElement | null => {
  const { isAuthReady, isLoggedIn, showLogin } = useAuthContext();
  const { signInStrip: forceSignInStrip } = useExtensionMockup();

  if (!isAuthReady) {
    return null;
  }
  if (isLoggedIn && !forceSignInStrip) {
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
    <section
      aria-label="Sign in to daily.dev"
      className="sticky top-0 z-3 mx-4 mb-3 laptop:mx-0"
    >
      <div className="flex items-center justify-between gap-4 rounded-12 border border-border-subtlest-quaternary bg-background-default px-6 py-4">
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
    </section>
  );
};
