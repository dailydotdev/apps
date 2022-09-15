import classNames from 'classnames';
import React, {
  MutableRefObject,
  ReactElement,
  useContext,
  useState,
} from 'react';
import { SocialRegistrationParameters } from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { Button } from '../buttons/Button';
import ImageInput from '../fields/ImageInput';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import UserIcon from '../icons/User';
import { CloseModalFunc } from '../modals/common';
import AuthModalHeader from './AuthModalHeader';
import { AuthForm, providerMap } from './common';
import LockIcon from '../icons/Lock';
import AtIcon from '../icons/At';
import AuthContext from '../../contexts/AuthContext';
import { ProfileFormHint } from '../../hooks/useProfileForm';

export interface SocialRegistrationFormProps {
  className?: string;
  provider?: string;
  formRef?: MutableRefObject<HTMLFormElement>;
  title?: string;
  onClose?: CloseModalFunc;
  hints?: ProfileFormHint;
  onUpdateHints?: (errors: ProfileFormHint) => void;
  isV2?: boolean;
  onSignup?: (params: SocialRegistrationParameters) => void;
}

export type SocialRegistrationFormValues = Omit<
  SocialRegistrationParameters,
  'method' | 'provider'
>;

export const SocialRegistrationForm = ({
  className,
  provider,
  formRef,
  title = 'Sign up to daily.dev',
  hints,
  onUpdateHints,
  onClose,
  onSignup,
  isV2,
}: SocialRegistrationFormProps): ReactElement => {
  const { user } = useContext(AuthContext);
  const [nameHint, setNameHint] = useState<string>(null);
  const [usernameHint, setUsernameHint] = useState<string>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const values = formToJson<SocialRegistrationFormValues>(
      formRef?.current ?? form,
    );

    if (!values.name) {
      setNameHint('Please prove your name');
      return;
    }

    if (!values.username) {
      setUsernameHint('Please choose a username');
      return;
    }

    const { file, ...rest } = values;
    onSignup(rest);
  };

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
      <AuthModalHeader title={title} onClose={onClose} />
      <AuthForm
        className={classNames(
          'gap-2 self-center place-items-center mt-6 w-full',
          isV2 ? 'max-w-[20rem]' : 'px-[3.75rem]',
          className,
        )}
        ref={formRef}
        onSubmit={onSubmit}
        data-testid="registration_form"
      >
        <ImageInput
          className="mb-4"
          initialValue={user?.image}
          size="large"
          viewOnly
        />
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
          leftIcon={<UserIcon />}
          name="name"
          inputId="name"
          label="Full name"
          value={user?.name}
          valid={!nameHint && !hints?.name}
          hint={hints?.name || nameHint}
          valueChanged={() => {
            if (hints?.name) {
              onUpdateHints?.({ ...hints, name: '' });
            }
            if (nameHint) {
              setNameHint('');
            }
          }}
        />
        <TextField
          saveHintSpace
          className="w-full"
          leftIcon={<AtIcon secondary />}
          name="username"
          inputId="username"
          label="Enter a username"
          value={user?.username}
          minLength={1}
          valid={!usernameHint && !hints?.username}
          hint={hints?.username || usernameHint}
          valueChanged={() => {
            if (hints?.username) {
              onUpdateHints?.({ ...hints, username: '' });
            }
            if (usernameHint) {
              setUsernameHint('');
            }
          }}
        />
        <Button className="mt-2 w-full bg-theme-color-cabbage">Sign up</Button>
      </AuthForm>
    </>
  );
};
