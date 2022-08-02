import classNames from 'classnames';
import React, {
  MutableRefObject,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useQuery } from 'react-query';
import AuthContext from '../../contexts/AuthContext';
import {
  initializeRegistration,
  RegistrationParameters,
  socialRegistration,
} from '../../lib/auth';
import { formInputs, formToJson } from '../../lib/form';
import { disabledRefetch } from '../../lib/func';
import { Button } from '../buttons/Button';
import ImageInput from '../fields/ImageInput';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import UserIcon from '../icons/User';
import VIcon from '../icons/V';
import { CloseModalFunc } from '../modals/common';
import AuthModalHeader from './AuthModalHeader';
import { AuthForm } from './common';
import EmailVerificationSent from './EmailVerificationSent';

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
}

export interface FormValues {
  image?: string;
  'traits.email'?: string;
  fullname?: string;
  password?: string;
  username?: string;
}

export const RegistrationForm = ({
  email,
  socialAccount,
  formRef,
  onClose,
  onBack,
  isV2,
}: RegistrationFormProps): ReactElement => {
  const [isNameValid, setIsNameValid] = useState<boolean>();
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>();
  const [isUsernameValid, setIsUsernameValid] = useState<boolean>();
  const [emailSent, setEmailSent] = useState(false);
  const { onPasswordRegistration } = useContext(AuthContext);
  const { data: registration } = useQuery(
    'registration',
    initializeRegistration,
    { ...disabledRefetch },
  );

  useEffect(() => {
    if (!socialAccount) {
      return;
    }

    setIsPasswordValid(true);
    const data = formInputs(formRef.current);
    Object.keys(data).forEach((key) => {
      if (!socialAccount?.[key]) {
        return;
      }

      const value = socialAccount?.[key];
      const el = data[key];
      el.value = value;
      el.dispatchEvent(new Event('input'));
    });
  }, [socialAccount]);

  if (emailSent) {
    return <EmailVerificationSent email={email} />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { password, ...form } = formToJson<FormValues>(formRef.current);
    const [first, ...rest] = form.fullname.split(' ');
    const csrfToken = registration.ui.nodes[0].attributes.value;

    if (socialAccount) {
      const socialData: RegistrationParameters = {
        csrf_token: socialAccount.csrf_token,
        method: 'oidc',
        provider: socialAccount?.provider,
        'traits.email': form['traits.email'],
        'traits.name.first': first,
        'traits.name.last': rest.length === 0 ? first : rest.join(' '),
        'traits.username': form.username,
      };

      const { redirect } = await socialRegistration(
        socialAccount?.action,
        socialData,
      );
      if (redirect) {
        window.open(redirect);
      }
      return null;
    }

    const postData: RegistrationParameters = {
      csrf_token: csrfToken,
      method: 'password',
      password,
      'traits.email': form['traits.email'],
      'traits.name.first': first,
      'traits.name.last': rest.length === 0 ? first : rest.join(' '),
    };
    const { success } = await onPasswordRegistration(
      registration.ui.action,
      postData,
    );

    if (success) {
      return setEmailSent(true);
    }

    // error management is missing
    return null;
  };

  return (
    <>
      <AuthModalHeader
        title={emailSent ? 'Verify your email address' : 'Sign up to daily.dev'}
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
          name="fullname"
          inputId="fullname"
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
          name="username"
          inputId="username"
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
