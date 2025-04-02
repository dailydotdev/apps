'use client';

import type { FC } from 'react';
import React from 'react';
import {
  useAppAuth,
  AppAuthActionsKeys,
} from '@dailydotdev/shared/src/features/common/hooks/useAppAuth';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { FormInputCheckboxGroup } from '@dailydotdev/shared/src/features/common/components/FormInputCheckboxGroup';

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
      <hr className="my-10" />
      <FormInputCheckboxGroup
        name="languages"
        cols={2}
        defaultValue={['js']}
        options={[
          { label: 'JavaScript', value: 'js' },
          { label: 'Python', value: 'py' },
          { label: 'Go', value: 'go' },
        ]}
      />
      <FormInputCheckboxGroup
        name="languages"
        cols={2}
        defaultValue={['js']}
        options={[
          {
            label: 'JavaScript',
            value: 'js',
            image: {
              src: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png',
              alt: 'JavaScript',
            },
          },
          {
            label: 'Python',
            value: 'py',
            image: {
              src: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg',
              alt: 'Python',
            },
          },
          {
            label: 'Go',
            value: 'go',
            image: {
              src: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Go_Logo_Blue.svg',
              alt: 'Go',
            },
          },
        ]}
      />
    </div>
  );
};
