import React, { FormEvent, ReactElement, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { formToJson } from '../../lib/form';
import { Button, ButtonVariant } from '../buttons/Button';
import AuthHeader from './AuthHeader';
import { AuthFormProps, AuthModalText } from './common';
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

interface ChangePasswordFormProps extends AuthFormProps {
  onSubmit: () => void;
}

function ChangePasswordForm({
  onSubmit,
  simplified,
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
      <AuthHeader simplified={simplified} title="Create a new password" />
      <AuthForm
        className="flex flex-col items-end px-14 py-8"
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
          className={{ container: 'w-full' }}
        />
        <Button
          className="mt-6"
          variant={ButtonVariant.Primary}
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
