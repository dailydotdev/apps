import React, {
  MutableRefObject,
  ReactElement,
  useEffect,
  useState,
} from 'react';
import { formInputs } from '../../lib/form';
import { Button } from '../buttons/Button';
import ImageInput from '../fields/ImageInput';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import UserIcon from '../icons/User';
import VIcon from '../icons/V';
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
}: RegistrationFormProps): ReactElement => {
  const [isNameValid, setIsNameValid] = useState<boolean>();
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>();
  const [isUsernameValid, setIsUsernameValid] = useState<boolean>();
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!socialAccount) {
      return;
    }

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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSent(true);
  };

  return (
    <AuthForm
      className="gap-4 self-center place-items-center mt-6 w-full px-[3.75rem]"
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
        rightIcon={<VIcon />}
      />
      <TextField
        className="w-full"
        validityChanged={setIsNameValid}
        valid={isNameValid}
        leftIcon={<UserIcon />}
        name="fullname"
        inputId="fullname"
        label="Full name"
        rightIcon={isNameValid && <VIcon />}
        minLength={3}
        required
      />
      {!socialAccount && isNameValid !== undefined && (
        <TextField
          className="w-full"
          validityChanged={setIsPasswordValid}
          valid={isPasswordValid}
          leftIcon={<MailIcon />}
          type="password"
          name="password"
          inputId="password"
          label="Create a password"
          rightIcon={isPasswordValid && <VIcon />}
          required
        />
      )}
      {(isPasswordValid !== undefined ||
        (isNameValid !== undefined && socialAccount)) && (
        <TextField
          className="w-full"
          validityChanged={setIsUsernameValid}
          valid={isUsernameValid}
          leftIcon={<UserIcon />}
          name="username"
          inputId="username"
          label="Enter a username"
          rightIcon={isUsernameValid && <VIcon />}
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
