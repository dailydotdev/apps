import classNames from 'classnames';
import React, { MutableRefObject, ReactElement } from 'react';
import { RegistrationError, RegistrationParameters } from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { Button } from '../buttons/Button';
import ImageInput from '../fields/ImageInput';
import { PasswordField } from '../fields/PasswordField';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import UserIcon from '../icons/User';
import VIcon from '../icons/V';
import { CloseModalFunc } from '../modals/common';
import AuthModalHeader from './AuthModalHeader';
import TokenInput from './TokenField';
import { AuthForm, providerMap } from './common';
import LockIcon from '../icons/Lock';
import AtIcon from '../icons/At';

export interface SocialProviderAccount {
  provider: string;
  action: string;
  csrf_token: string;
  email: string;
  name: string;
  username?: string;
  image?: string;
}

export interface RegistrationFormProps {
  email: string;
  socialAccount?: SocialProviderAccount;
  formRef?: MutableRefObject<HTMLFormElement>;
  onClose?: CloseModalFunc;
  onBack?: CloseModalFunc;
  hints?: RegistrationError;
  onUpdateHints?: (errors: RegistrationError) => void;
  isV2?: boolean;
  onSignup?: (params: RegistrationFormValues) => void;
  token: string;
}

export type RegistrationFormValues = Omit<
  RegistrationParameters,
  'method' | 'provider'
>;

export const RegistrationForm = ({
  email,
  socialAccount,
  formRef,
  onClose,
  onBack,
  onSignup,
  isV2,
  token,
  hints,
  onUpdateHints,
}: RegistrationFormProps): ReactElement => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const values = formToJson<RegistrationFormValues>(formRef?.current ?? form);
    onSignup(values);
  };

  const isPasswordValid = !hints?.password;
  const isNameValid = !hints?.['traits.name'];
  const isUsernameValid = !hints?.['traits.username'];
  const emailFieldIcon = (provider: string) => {
    if (providerMap[provider]) {
      return React.cloneElement(providerMap[provider].icon, {
        secondary: false,
      });
    }

    return <MailIcon />;
  };

  return (
    <>
      <AuthModalHeader
        title="Sign up to daily.dev"
        onBack={!socialAccount && onBack}
        onClose={onClose}
      />
      <AuthForm
        className={classNames(
          'gap-2 self-center place-items-center mt-6 w-full',
          isV2 ? 'max-w-[20rem]' : 'px-[3.75rem]',
        )}
        ref={formRef}
        onSubmit={onSubmit}
        data-testid="registration_form"
      >
        <TokenInput token={token} />
        {socialAccount && (
          <ImageInput
            initialValue={socialAccount.image}
            size="large"
            viewOnly
            className="mb-2"
          />
        )}
        <TextField
          saveHintSpace
          className="w-full"
          leftIcon={emailFieldIcon(socialAccount?.provider)}
          name="traits.email"
          inputId="email"
          label="Email"
          type="email"
          value={email || socialAccount?.email}
          readOnly
          rightIcon={
            socialAccount ? (
              <LockIcon />
            ) : (
              <VIcon className="text-theme-color-avocado" />
            )
          }
        />
        <TextField
          saveHintSpace
          className="w-full"
          valid={isNameValid}
          leftIcon={<UserIcon />}
          name="traits.name"
          inputId="traits.name"
          label="Full name"
          hint={hints?.['traits.name']}
          onChange={() =>
            hints?.['traits.name'] &&
            onUpdateHints({ ...hints, 'traits.name': '' })
          }
          value={socialAccount?.name}
          rightIcon={
            isNameValid && <VIcon className="text-theme-color-avocado" />
          }
        />
        {!socialAccount && (
          <PasswordField
            className="w-full"
            leftIcon={<LockIcon />}
            name="password"
            inputId="password"
            label="Create a password"
          />
        )}
        <TextField
          saveHintSpace
          className="w-full"
          valid={isUsernameValid}
          leftIcon={<AtIcon secondary />}
          name="traits.username"
          inputId="traits.username"
          label="Enter a username"
          hint={hints?.['traits.username']}
          onChange={() =>
            hints?.['traits.username'] &&
            onUpdateHints({ ...hints, 'traits.username': '' })
          }
          value={socialAccount?.username}
          minLength={1}
          rightIcon={
            isUsernameValid && <VIcon className="text-theme-color-avocado" />
          }
        />
        {isNameValid && (socialAccount || isPasswordValid) && (
          <div className="flex flex-row gap-4 mt-6 ml-auto">
            {isPasswordValid && !isUsernameValid && (
              <Button className="btn-tertiary">Skip</Button>
            )}
            <Button className="bg-theme-color-cabbage">Signup</Button>
          </div>
        )}
      </AuthForm>
    </>
  );
};
