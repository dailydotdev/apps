import classNames from 'classnames';
import React, {
  MutableRefObject,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  AuthEventNames,
  AuthTriggers,
  AuthTriggersOrString,
  SocialRegistrationParameters,
} from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { Button } from '../buttons/Button';
import ImageInput from '../fields/ImageInput';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import UserIcon from '../icons/User';
import AuthModalHeader from './AuthModalHeader';
import { providerMap } from './common';
import LockIcon from '../icons/Lock';
import AtIcon from '../icons/At';
import AuthContext from '../../contexts/AuthContext';
import { ProfileFormHint } from '../../hooks/useProfileForm';
import { Checkbox } from '../fields/Checkbox';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import AuthForm from './AuthForm';
import TwitterIcon from '../icons/Twitter';
import { Modal } from '../modals/common/Modal';

export interface SocialRegistrationFormProps {
  className?: string;
  provider?: string;
  formRef?: MutableRefObject<HTMLFormElement>;
  title?: string;
  trigger: AuthTriggersOrString;
  hints?: ProfileFormHint;
  onUpdateHints?: (errors: ProfileFormHint) => void;
  onSignup?: (params: SocialRegistrationParameters) => void;
  isLoading?: boolean;
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
  trigger,
  onUpdateHints,
  onSignup,
  isLoading,
}: SocialRegistrationFormProps): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { user } = useContext(AuthContext);
  const [nameHint, setNameHint] = useState<string>(null);
  const [usernameHint, setUsernameHint] = useState<string>(null);
  const [twitterHint, setTwitterHint] = useState<string>(null);
  const isAuthorOnboarding = trigger === AuthTriggers.Author;

  useEffect(() => {
    trackEvent({
      event_name: AuthEventNames.StartSignUpForm,
    });
  }, []);

  const trackError = (error) => {
    trackEvent({
      event_name: AuthEventNames.SubmitSignUpFormError,
      extra: JSON.stringify({ error }),
    });
  };

  useEffect(() => {
    if (Object.keys(hints).length) {
      trackError(hints);
    }
  }, [hints]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    trackEvent({
      event_name: AuthEventNames.SubmitSignUpForm,
    });

    const form = e.target as HTMLFormElement;
    const values = formToJson<SocialRegistrationFormValues>(
      formRef?.current ?? form,
    );

    if (!values.name) {
      trackError('Name not provided');
      setNameHint('Please prove your name');
      return;
    }

    if (!values.username) {
      trackError('Username not provided');
      setUsernameHint('Please choose a username');
      return;
    }

    if (isAuthorOnboarding && !values.twitter) {
      trackError('Twitter not provider');
      setTwitterHint('Please add your twitter handle');
    }

    const { file, optOutMarketing, ...rest } = values;
    onSignup({ ...rest, acceptedMarketing: !optOutMarketing });
  };

  const emailFieldIcon = (providerI: string) => {
    if (providerMap[providerI]) {
      return React.cloneElement(providerMap[providerI].icon, {
        secondary: false,
        size: 'medium',
      });
    }

    return <MailIcon size="medium" />;
  };

  if (!user?.email) {
    return <></>;
  }

  return (
    <>
      <AuthModalHeader title={title} />
      <AuthForm
        className={classNames(
          'gap-2 self-center place-items-center mt-6 w-full overflow-y-auto flex-1 pb-6 px-6 tablet:px-[3.75rem]',
          className,
        )}
        ref={formRef}
        onSubmit={onSubmit}
        id="auth-form"
        data-testid="registration_form"
      >
        <ImageInput
          className={{ container: 'mb-4' }}
          initialValue={user?.image}
          size="medium"
          viewOnly
        />
        <TextField
          saveHintSpace
          className={{ container: 'w-full' }}
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
          className={{ container: 'w-full' }}
          leftIcon={<UserIcon size="medium" />}
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
          className={{ container: 'w-full' }}
          leftIcon={<AtIcon size="medium" secondary />}
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
        {isAuthorOnboarding && (
          <TextField
            saveHintSpace
            className={{ container: 'w-full' }}
            leftIcon={<TwitterIcon />}
            name="twitter"
            inputId="twitter"
            label="Twitter"
            type="text"
            valid={!twitterHint}
            hint={twitterHint}
            valueChanged={() => {
              if (twitterHint) {
                setTwitterHint('');
              }
            }}
          />
        )}
        <span className="pb-4 border-b border-theme-divider-tertiary typo-subhead text-theme-label-secondary">
          Your email will be used to send you product and community updates
        </span>
        <Checkbox name="optOutMarketing" className="font-normal">
          I don’t want to receive updates and promotions via email
        </Checkbox>
      </AuthForm>
      <Modal.Footer>
        <Button
          form="auth-form"
          type="submit"
          className={classNames(
            'w-full btn-primary',
            !isLoading && 'bg-theme-color-cabbage',
          )}
          disabled={isLoading}
        >
          Sign up
        </Button>
      </Modal.Footer>
    </>
  );
};
