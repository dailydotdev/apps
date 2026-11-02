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
import { loginHref, onboardingHref } from './onboardingHref';

interface ExtensionSignInContentProps {
  className?: string;
}

// The sign-in title and Log in / Sign up CTAs for logged-out users. Renders
// nothing until auth resolves, or once the user is logged in.
export const ExtensionSignInContent = ({
  className,
}: ExtensionSignInContentProps): ReactElement | null => {
  const { isAuthReady, isLoggedIn } = useAuthContext();

  if (!isAuthReady || isLoggedIn) {
    return null;
  }

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
        Sign in to personalize your feed
      </Typography>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          tag="a"
          href={loginHref}
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
        >
          Log in
        </Button>
        <Button
          tag="a"
          href={onboardingHref}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
        >
          Sign up
        </Button>
      </div>
    </div>
  );
};
