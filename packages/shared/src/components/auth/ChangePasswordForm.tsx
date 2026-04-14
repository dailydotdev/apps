import type { FormEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import { formToJson } from '../../lib/form';
import { Button, ButtonVariant } from '../buttons/Button';
import AuthHeader from './AuthHeader';
import type { AuthFormProps } from './common';
import { AuthModalText } from './common';
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
  const [isLoading, setIsLoading] = useState(false);
  const { displayToast } = useToastNotification();

  const onChangePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { password } = formToJson<{ password: string }>(e.currentTarget);

    if (!token) {
      return;
    }

    setIsLoading(true);
    setHint('');
    const res = await betterAuthResetPassword(password, token);
    setIsLoading(false);

    if (res.error) {
      setHint(res.error);
      return;
    }

    displayToast('Password changed successfully!');
    onSubmit();
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
