import classNames from 'classnames';
import React, { MutableRefObject, ReactElement, useState } from 'react';
import { RegistrationParameters } from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { Button } from '../buttons/Button';
import ImageInput from '../fields/ImageInput';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import UserIcon from '../icons/User';
import VIcon from '../icons/V';
import { CloseModalFunc } from '../modals/common';
import AuthModalHeader from './AuthModalHeader';
import { AuthForm } from './common';

export interface SocialProviderAccount {
  provider: string;
  action: string;
  csrf_token: string;
  email: string;
  name: string;
  username?: string;
  image?: string;
}

interface RegistrationFormProps {
  email: string;
  socialAccount?: SocialProviderAccount;
  formRef?: MutableRefObject<HTMLFormElement>;
  onClose?: CloseModalFunc;
  onBack?: CloseModalFunc;
  isV2?: boolean;
  onSignup?: (params: RegistrationFormValues) => void;
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
}: RegistrationFormProps): ReactElement => {
  const [isNameValid, setIsNameValid] = useState<boolean>();
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>();
  const [isUsernameValid, setIsUsernameValid] = useState<boolean>();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const values = formToJson<RegistrationFormValues>(formRef?.current ?? form);
    onSignup(values);
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
          'gap-4 self-center place-items-center mt-6 w-full',
          isV2 ? 'max-w-[20rem]' : 'px-[3.75rem]',
        )}
        ref={formRef}
        onSubmit={onSubmit}
      >
        {socialAccount && <ImageInput initialValue={socialAccount.image} />}
        <TextField
          className="w-full"
          leftIcon={<MailIcon />}
          name="traits.email"
          inputId="email"
          label="Email"
          type="email"
          value={email || socialAccount?.email}
          readOnly
          rightIcon={<VIcon className="text-theme-color-avocado" />}
        />
        <TextField
          className="w-full"
          validityChanged={setIsNameValid}
          valid={isNameValid}
          leftIcon={<UserIcon />}
          name="traits.fullname"
          inputId="traits.fullname"
          label="Full name"
          value={socialAccount?.name}
          rightIcon={
            isNameValid && <VIcon className="text-theme-color-avocado" />
          }
          minLength={3}
          required
        />
        {!socialAccount && (
          <TextField
            className="w-full"
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
          />
        )}
        <TextField
          className="w-full"
          validityChanged={setIsUsernameValid}
          valid={isUsernameValid}
          leftIcon={<UserIcon />}
          name="traits.username"
          inputId="traits.username"
          label="Enter a username"
          value={socialAccount?.username}
          minLength={1}
          rightIcon={
            isUsernameValid && <VIcon className="text-theme-color-avocado" />
          }
        />
        {isNameValid && isPasswordValid && (
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
