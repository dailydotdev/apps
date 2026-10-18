import type { ReactElement } from 'react';
import React from 'react';
import Unauthorized from '../../../components/errors/Unauthorized';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { useAuthContext } from '../../../contexts/AuthContext';
import { AuthTriggers } from '../../../lib/auth';

// A private squad has no request to join: the invitation link is the only
// door, so the wall only offers a way back, and logging in when logged out.
export const SquadPrivateWall = (): ReactElement => {
  const { isLoggedIn, showLogin } = useAuthContext();

  return (
    <Unauthorized>
      {!isLoggedIn && (
        <Button
          className="w-fit"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Large}
          onClick={() => showLogin({ trigger: AuthTriggers.JoinSquad })}
        >
          Log in
        </Button>
      )}
    </Unauthorized>
  );
};
