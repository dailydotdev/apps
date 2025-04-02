'use client';

import type { FC } from 'react';
import React from 'react';
import {
  useAppAuth,
  AppAuthActionsKeys,
} from '@dailydotdev/shared/src/features/common/hooks/useAppAuth';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  FormInputCheckboxGroup,
  CheckboxGroupVariant,
} from '@dailydotdev/shared/src/features/common/components/FormInputCheckboxGroup';

const options = [
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
];

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
      <div className="flex flex-col gap-10">
        <FormInputCheckboxGroup
          name="languages"
          cols={1}
          options={options.map(({ label, value }) => ({ label, value }))}
        />
        <FormInputCheckboxGroup
          name="languages"
          cols={2}
          defaultValue={['js']}
          options={options.map(({ label, value }) => ({ label, value }))}
        />
        <FormInputCheckboxGroup
          name="languages"
          cols={2}
          defaultValue={['js']}
          options={options}
        />
        <FormInputCheckboxGroup
          name="languages"
          cols={2}
          defaultValue={['js']}
          variant={CheckboxGroupVariant.Vertical}
          options={options}
        />
      </div>
    </div>
  );
};
