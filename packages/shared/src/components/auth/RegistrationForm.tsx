import classNames from 'classnames';
import React, {
  MutableRefObject,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useMutation, useQuery } from 'react-query';
import AuthContext from '../../contexts/AuthContext';
import {
  errorsToJson,
  initializeRegistration,
  RegistrationParameters,
  validateRegistration,
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

interface MutationParams {
  action: string;
  params: RegistrationParameters;
}

export const RegistrationForm = ({
  email,
  socialAccount,
  formRef,
  onClose,
  onBack,
  isV2,
}: RegistrationFormProps): ReactElement => {
  const [hints, setHints] =
    useState<Record<keyof RegistrationParameters, string>>();
  const [emailSent, setEmailSent] = useState(false);
  const { onUpdateSession } = useContext(AuthContext);
  const { data: registration } = useQuery(
    'registration',
    initializeRegistration,
    { ...disabledRefetch },
  );
  const { mutateAsync: validate, status } = useMutation(
    ({ action, params }: MutationParams) =>
      validateRegistration(action, params),
    {
      onSuccess: ({ data, error }) => {
        if (data) {
          return onUpdateSession(data);
        }

        // probably csrf token issue and definitely not related to forms data
        if (!error.ui) {
          return null;
        }

        const json = errorsToJson<keyof RegistrationParameters>(error);

        return setHints(json);
      },
    },
  );

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = formToJson<RegistrationParameters>(formRef.current);
    const { nodes, action } = registration.ui;
    const csrfToken = nodes[0].attributes.value;
    const postData: RegistrationParameters = {
      ...values,
      csrf_token: csrfToken,
      method: 'password',
    };

    const { data: success } = await validate({ action, params: postData });

    if (success) {
      return setEmailSent(true);
    }

    // error management is missing
    return null;
  };

  const isIdle = status === 'idle';
  const isPasswordValid = !hints?.password;
  const isNameValid = !hints?.['traits.fullname'];
  const isUsernameValid = !hints?.['traits.username'];

  return (
    <>
      <AuthModalHeader
        title={emailSent ? 'Verify your email address' : 'Sign up to daily.dev'}
        onBack={!socialAccount && onBack}
        onClose={onClose}
      />
      <AuthForm
        className={classNames(
          'gap-1 self-center place-items-center mt-6 w-full',
          isV2 ? 'max-w-[20rem]' : 'px-[3.75rem]',
        )}
        ref={formRef}
        onSubmit={onSubmit}
      >
        {socialAccount && <ImageInput initialValue={socialAccount.image} />}
        <TextField
          saveHintSpace
          className="w-full"
          leftIcon={<MailIcon />}
          name="traits.email"
          inputId="email"
          label="Email"
          type="email"
          value={email}
          readOnly
          rightIcon={<VIcon className="text-theme-color-avocado" />}
        />
        <TextField
          saveHintSpace
          className="w-full"
          valid={isNameValid}
          leftIcon={<UserIcon />}
          name="traits.fullname"
          inputId="fullname"
          label="Full name"
          hint={hints?.['traits.fullname']}
          onChange={() =>
            hints?.['traits.fullname'] &&
            setHints({ ...hints, 'traits.fullname': '' })
          }
          rightIcon={
            !isIdle &&
            isNameValid && <VIcon className="text-theme-color-avocado" />
          }
        />
        {!socialAccount && (
          <TextField
            saveHintSpace
            className="w-full"
            valid={!hints?.password?.length}
            leftIcon={<MailIcon />}
            type="password"
            name="password"
            inputId="password"
            label="Create a password"
            hint={hints?.password}
            onChange={() =>
              hints?.password && setHints({ ...hints, password: '' })
            }
            rightIcon={
              !isIdle &&
              isPasswordValid && <VIcon className="text-theme-color-avocado" />
            }
          />
        )}
        <TextField
          saveHintSpace
          className="w-full"
          valid={isUsernameValid}
          leftIcon={<UserIcon />}
          name="username"
          inputId="username"
          label="Enter a username"
          hint={hints?.['traits.username']}
          onChange={() =>
            hints?.['traits.username'] &&
            setHints({ ...hints, 'traits.username': '' })
          }
          rightIcon={
            !isIdle &&
            isUsernameValid && <VIcon className="text-theme-color-avocado" />
          }
        />
        {((isNameValid && isPasswordValid) || !isIdle) && (
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
