import type { ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { SignupWidget } from '@dailydotdev/shared/src/components/auth/SignupWidget';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

interface WorldSignupCtaProps {
  /** The phone bar, where a card with two social buttons will not fit. */
  compact?: boolean;
}

/**
 * The pitch, made to a reader who is already looking at the best version of it.
 * Somebody else's world is the most legible argument this product has, so the
 * rail signs them up where they stand rather than sending them to a modal.
 */
export function WorldSignupCta({
  compact,
}: WorldSignupCtaProps): ReactElement | null {
  const { user, isAuthReady, showLogin } = useAuthContext();

  if (!isAuthReady || user) {
    return null;
  }

  if (compact) {
    return (
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        className="w-full"
        onClick={() =>
          showLogin({
            trigger: AuthTriggers.World,
            options: { isLogin: false },
          })
        }
      >
        Build your world
      </Button>
    );
  }

  return (
    <SignupWidget
      dense
      title="Build your own world"
      description="Every article you read grows the world. Start building yours now."
      trigger={AuthTriggers.World}
      className="border-t border-border-subtlest-tertiary pt-4"
    />
  );
}
