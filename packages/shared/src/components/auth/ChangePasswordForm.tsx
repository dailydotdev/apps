import type { FormEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { formToJson } from '../../lib/form';
import { Button, ButtonVariant } from '../buttons/Button';
import AuthHeader from './AuthHeader';
import type { AuthFormProps } from './common';
import { AuthModalText } from './common';
import {
  AuthFlow,
  initializeKratosFlow,
  submitKratosFlow,
} from '../../lib/kratos';
import type {
  RegistrationParameters,
  ValidateRegistrationParams,
} from '../../lib/auth';
import { errorsToJson, getNodeValue } from '../../lib/auth';
import AuthForm from './AuthForm';
import { PasswordField } from '../fields/PasswordField';
import { useToastNotification } from '../../hooks/useToastNotification';
import { betterAuthResetPassword } from '../../lib/betterAuth';

interface ChangePasswordFormProps extends AuthFormProps {
  onSubmit: () => void;
  token?: string;
}

function ChangePasswordForm({
  onSubmit,
  simplified,
  token,
}: ChangePasswordFormProps): ReactElement {
  const [hint, setHint] = useState('');
  const [isBaLoading, setIsBaLoading] = useState(false);
  const { displayToast } = useToastNotification();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => initializeKratosFlow(AuthFlow.Settings),
    enabled: !token,
  });

  const { mutateAsync: reset, isPending: isLoading } = useMutation({
    mutationFn: (params: ValidateRegistrationParams) =>
      submitKratosFlow(params),

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
  });

  const onChangePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { password } = formToJson<{ password: string }>(e.currentTarget);

    if (token) {
      setIsBaLoading(true);
      setHint('');
      const res = await betterAuthResetPassword(password, token);
      setIsBaLoading(false);

      if (res.error) {
        setHint(res.error);
        return;
      }

      displayToast('Password changed successfully!');
      onSubmit();
      return;
    }

    if ('code' in settings) {
      return;
    }

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
          disabled={token ? isBaLoading : isLoading}
        >
          Change password
        </Button>
      </AuthForm>
    </>
  );
}

export default ChangePasswordForm;
