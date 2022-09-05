import classNames from 'classnames';
import React, { MutableRefObject, ReactElement, useContext } from 'react';
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
import AuthContext from '../../contexts/AuthContext';

export interface SocialRegistrationFormProps {
  provider: string;
  formRef?: MutableRefObject<HTMLFormElement>;
  onClose?: CloseModalFunc;
  hints?: RegistrationError;
  onUpdateHints?: (errors: RegistrationError) => void;
  isV2?: boolean;
  onSignup?: (params: RegistrationFormValues) => void;
}

export type RegistrationFormValues = Omit<
  RegistrationParameters,
  'method' | 'provider'
>;

export const SocialRegistrationForm = ({
  provider,
  formRef,
  onClose,
  onSignup,
  isV2,
  hints,
  onUpdateHints,
}: SocialRegistrationFormProps): ReactElement => {
  const { user } = useContext(AuthContext);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const values = formToJson<RegistrationFormValues>(formRef?.current ?? form);
    const { file, ...rest } = values;
    onSignup(rest);
  };

  const isNameValid = !hints?.['traits.name'];
  const isUsernameValid = !hints?.['traits.username'];
  const emailFieldIcon = (providerI: string) => {
    if (providerMap[providerI]) {
      return React.cloneElement(providerMap[providerI].icon, {
        secondary: false,
      });
    }

    return <MailIcon />;
  };

  if (!user?.email) {
    return <></>;
  }

  return (
    <>
      <AuthModalHeader title="Sign up to daily.dev" onClose={onClose} />
      <AuthForm
        className={classNames(
          'gap-2 self-center place-items-center mt-6 w-full',
          isV2 ? 'max-w-[20rem]' : 'px-[3.75rem]',
        )}
        ref={formRef}
        onSubmit={onSubmit}
        data-testid="registration_form"
      >
        <ImageInput initialValue={user?.image} size="large" viewOnly />
        <TextField
          saveHintSpace
          className="w-full"
          leftIcon={emailFieldIcon(provider)}
          name="email"
          inputId="email"
          label="Email"
          type="email"
          value={user?.email}
          readOnly
          rightIcon={<LockIcon />}
        />
        <TextField
          saveHintSpace
          className="w-full"
          valid={isNameValid}
          leftIcon={<UserIcon />}
          name="name"
          inputId="name"
          label="Full name"
          value={user?.name}
          rightIcon={
            isNameValid && <VIcon className="text-theme-color-avocado" />
          }
        />
        <TextField
          saveHintSpace
          className="w-full"
          valid={isUsernameValid}
          leftIcon={<AtIcon secondary />}
          name="username"
          inputId="username"
          label="Enter a username"
          value={user?.username}
          minLength={1}
          rightIcon={
            isUsernameValid && <VIcon className="text-theme-color-avocado" />
          }
        />
        {isNameValid && user && (
          <div className="flex flex-row gap-4 mt-6 ml-auto">
            <Button className="bg-theme-color-cabbage">Signup</Button>
          </div>
        )}
      </AuthForm>
    </>
  );
};
