import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { formInputs } from '../../lib/form';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import UserIcon from '../icons/User';
import VIcon from '../icons/V';
import { AuthForm } from './common';
import EmailVerificationSent from './EmailVerificationSent';

interface SocialProviderUser {
  name?: string;
  image?: string;
}

interface RegistrationFormProps {
  email: string;
  user?: SocialProviderUser;
}

export const RegistrationForm = ({
  email,
  user,
}: RegistrationFormProps): ReactElement => {
  const formRef = useRef<HTMLFormElement>();
  const [isNameValid, setIsNameValid] = useState<boolean>();
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>();
  const [isUsernameValid, setIsUsernameValid] = useState<boolean>();
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const data = formInputs(formRef.current);
    Object.keys(data).forEach((key) => {
      if (!user?.[key]) {
        return;
      }

      const value = user?.[key];
      const el = data[key];
      el.value = value;
      el.dispatchEvent(new Event('input'));
    });
  }, [user]);

  if (emailSent) {
    return <EmailVerificationSent email={email} />;
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSent(true);
  };

  return (
    <AuthForm
      className="gap-4 self-center mt-6 w-full px-[3.75rem]"
      ref={formRef}
      onSubmit={onSubmit}
    >
      <TextField
        leftIcon={<MailIcon />}
        name="email"
        inputId="email"
        label="Email"
        type="email"
        value={email}
        readOnly
        rightIcon={<VIcon className="text-theme-color-avocado" />}
      />
      <TextField
        validityChanged={setIsNameValid}
        valid={isNameValid}
        leftIcon={<UserIcon />}
        name="fullname"
        inputId="fullname"
        label="Full name"
        rightIcon={
          isNameValid && <VIcon className="text-theme-color-avocado" />
        }
        minLength={3}
        required
      />
      {isNameValid !== undefined && (
        <TextField
          validityChanged={setIsPasswordValid}
          valid={isPasswordValid}
          leftIcon={<MailIcon />}
          type="password"
          name="password"
          inputId="password"
          label="Create a password"
          rightIcon={
            isPasswordValid && <VIcon className="text-theme-color-avocado" />
          }
          required
        />
      )}
      {isPasswordValid !== undefined && (
        <TextField
          validityChanged={setIsUsernameValid}
          valid={isUsernameValid}
          leftIcon={<UserIcon />}
          name="username"
          inputId="username"
          label="Enter a username"
          rightIcon={
            isUsernameValid && <VIcon className="text-theme-color-avocado" />
          }
        />
      )}
      {isNameValid && isPasswordValid && (
        <div className="flex flex-row gap-4 mt-6 ml-auto">
          {isPasswordValid && !isUsernameValid && (
            <Button className="btn-tertiary">Skip</Button>
          )}
          <Button className="btn-primary">Signup</Button>
        </div>
      )}
    </AuthForm>
  );
};
