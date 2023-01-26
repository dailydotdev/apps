import classNames from 'classnames';
import React, { FormEvent, ReactElement, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { formToJson } from '../../lib/form';
import { Button } from '../buttons/Button';
import AuthModalHeader from './AuthModalHeader';
import { AuthModalText } from './common';
import {
  AuthFlow,
  initializeKratosFlow,
  submitKratosFlow,
} from '../../lib/kratos';
import {
  errorsToJson,
  getNodeValue,
  RegistrationParameters,
  ValidateRegistrationParams,
} from '../../lib/auth';
import AuthForm from './AuthForm';
import { PasswordField } from '../fields/PasswordField';
import { useToastNotification } from '../../hooks/useToastNotification';

interface ChangePasswordFormProps {
  onSubmit: () => void;
}

function ChangePasswordForm({
  onSubmit,
}: ChangePasswordFormProps): ReactElement {
  const [hint, setHint] = useState('');
  const { displayToast } = useToastNotification();

  const { data: settings } = useQuery(['settings'], () =>
    initializeKratosFlow(AuthFlow.Settings),
  );

  const { mutateAsync: reset, isLoading } = useMutation(
    (params: ValidateRegistrationParams) => submitKratosFlow(params),
    {
      onSuccess: ({ error, data: success }) => {
        if (success) {
          displayToast('Password changed successfully!');
          return onSubmit();
        }

        if (!error?.ui) {
          return setHint('Session might have expired!');
        }

        const json = errorsToJson<keyof RegistrationParameters>(error);
        return setHint(json?.password);
      },
    },
  );

  const onChangePasswordSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ('code' in settings) {
      return;
    }

    const { password } = formToJson<{ password: string }>(e.currentTarget);
    const params: RegistrationParameters = {
      method: 'password',
      csrf_token: getNodeValue('csrf_token', settings.ui.nodes),
      'traits.email': getNodeValue('traits.email', settings.ui.nodes),
      'traits.name': getNodeValue('traits.name', settings.ui.nodes),
      'traits.username': getNodeValue('traits.username', settings.ui.nodes),
      'traits.image': getNodeValue('traits.image', settings.ui.nodes),
      password,
    };
    reset({ params, action: settings.ui.action });
  };

  return (
    <>
      <AuthModalHeader title="Create new password" />
      <AuthForm
        className="flex flex-col items-end py-8 px-14"
        onSubmit={onChangePasswordSubmit}
        data-testid="recovery_form"
      >
        <AuthModalText className="mb-6 text-center">
          Please enter your new password. A password strength meter will guide
          you if your password is strong enough.
        </AuthModalText>
        <PasswordField
          required
          minLength={6}
          hint={hint}
          showStrength={!hint}
          onChange={() => hint && setHint('')}
          label="Create new password"
          inputId="password"
          type="password"
          name="password"
        />
        <Button
          className={classNames('mt-6 bg-theme-color-cabbage')}
          type="submit"
          disabled={isLoading}
        >
          Change password
        </Button>
      </AuthForm>
    </>
  );
}

export default ChangePasswordForm;
