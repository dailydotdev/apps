'use client';

import type { FC } from 'react';
import React from 'react';
import {
  useAppAuth,
  AppAuthActionsKeys,
} from '@dailydotdev/shared/src/features/common/hooks/useAppAuth';
import { FormInputRating } from '@dailydotdev/shared/src/features/common/components/FormInputRating';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';

export const ClientTest: FC = () => {
  const { user, dispatch } = useAppAuth();

  return (
    <div>
      <strong>Client</strong> says user is {user?.id ?? 'not logged'}
      <Button
        type="button"
        onClick={() => dispatch({ type: AppAuthActionsKeys.REFRESH })}
      >
        Refetch user
      </Button>
      <Button
        type="button"
        onClick={() => dispatch({ type: AppAuthActionsKeys.LOGOUT })}
      >
        Logout
      </Button>
      <hr />
      <div>
        <FormInputRating
          max={5}
          min={1}
          name="rating"
          onValueChange={console.log}
        >
          <div>Not at all</div>
          <div>very much</div>
        </FormInputRating>
      </div>
    </div>
  );
};
