import classNames from 'classnames';
import React, {
  MutableRefObject,
  ReactElement,
  useEffect,
  useState,
} from 'react';
import { useQueryClient } from 'react-query';
import { RegistrationInitializationData } from '../../lib/auth';
import { formInputs } from '../../lib/form';
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
  name: string;
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

export interface RegistrationFormValues {
  image?: string;
  email?: string;
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
  const client = useQueryClient();
  const session =
    client.getQueryData<RegistrationInitializationData>('registration');
  const [isNameValid, setIsNameValid] = useState<boolean>();
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>();
  const [isUsernameValid, setIsUsernameValid] = useState<boolean>();
  const [emailSent, setEmailSent] = useState(false);

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
    try {
      const res = await fetch(session.ui.action, {
        method: session.ui.method,
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csrf_token: session.ui.nodes[0].attributes.value,
          method: 'password',
          'traits.email': 'sample@email.com',
          'traits.name.first': 'lee',
          'traits.name.last': 'solevilla',
          password: '1q2w3e',
        }),
      });
      const json = await res.json();
      setEmailSent(true);
      console.log(json);
    } catch (err) {
      console.log(err);
    }
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
          name="email"
          inputId="email"
          label="Email"
          type="email"
          value={email}
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
