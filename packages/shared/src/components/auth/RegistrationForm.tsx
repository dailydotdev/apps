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
  RegistrationError,
  RegistrationParameters,
} from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { Button } from '../buttons/Button';
import { PasswordField } from '../fields/PasswordField';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import UserIcon from '../icons/User';
import VIcon from '../icons/V';
import { CloseModalFunc } from '../modals/common';
import AuthModalHeader from './AuthModalHeader';
import TokenInput from './TokenField';
import AuthForm from './AuthForm';
import AtIcon from '../icons/At';
import { Checkbox } from '../fields/Checkbox';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import TwitterIcon from '../icons/Twitter';
import { Modal } from '../modals/common/Modal';

export interface RegistrationFormProps {
  email: string;
  formRef?: MutableRefObject<HTMLFormElement>;
  onBack?: CloseModalFunc;
  hints?: RegistrationError;
  onUpdateHints?: (errors: RegistrationError) => void;
  onSignup?: (params: RegistrationFormValues) => void;
  token: string;
  trigger: AuthTriggersOrString;
}

export type RegistrationFormValues = Omit<
  RegistrationParameters,
  'method' | 'provider'
>;

export const RegistrationForm = ({
  email,
  formRef,
  onBack,
  onSignup,
  token,
  hints,
  trigger,
  onUpdateHints,
}: RegistrationFormProps): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const isAuthorOnboarding = trigger === AuthTriggers.Author;

  useEffect(() => {
    trackEvent({
      event_name: AuthEventNames.StartSignUpForm,
    });
  }, []);

  useEffect(() => {
    if (Object.keys(hints).length) {
      trackEvent({
        event_name: AuthEventNames.SubmitSignUpFormError,
        extra: JSON.stringify({ error: hints }),
      });
    }
  }, [hints]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    trackEvent({
      event_name: AuthEventNames.SubmitSignUpForm,
    });

    setIsSubmitted(true);
    const form = e.target as HTMLFormElement;
    const { optOutMarketing, ...values } = formToJson<RegistrationFormValues>(
      formRef?.current ?? form,
    );

    if (!values['traits.name']?.length || !values['traits.username']?.length) {
      const setHints = { ...hints };

      if (!values['traits.name']?.length) {
        setHints['traits.name'] = 'Please provide name.';
      }
      if (!values['traits.username']?.length) {
        setHints['traits.username'] = 'Please provide username.';
      }

      onUpdateHints(setHints);
      return;
    }

    onSignup({
      ...values,
      'traits.acceptedMarketing': !optOutMarketing,
    });
  };

  const isNameValid = !hints?.['traits.name'] && isSubmitted;
  const isUsernameValid = !hints?.['traits.username'] && isSubmitted;

  return (
    <>
      <AuthModalHeader title="Sign up to daily.dev" onBack={onBack} />
      <AuthForm
        className={classNames(
          'gap-2 self-center place-items-center mt-6 w-full overflow-y-auto flex-1 pb-6 px-6 tablet:px-[3.75rem]',
        )}
        ref={formRef}
        onSubmit={onSubmit}
        id="auth-form"
        data-testid="registration_form"
      >
        <TokenInput token={token} />
        <TextField
          saveHintSpace
          className={{ container: 'w-full' }}
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
          className={{ container: 'w-full' }}
          valid={isNameValid}
          leftIcon={<UserIcon />}
          name="traits.name"
          inputId="traits.name"
          label="Full name"
          hint={hints?.['traits.name']}
          valueChanged={() =>
            hints?.['traits.name'] &&
            onUpdateHints({ ...hints, 'traits.name': '' })
          }
          rightIcon={
            isNameValid && <VIcon className="text-theme-color-avocado" />
          }
        />
        <PasswordField
          required
          minLength={6}
          saveHintSpace
          className={{ container: 'w-full' }}
          name="password"
          inputId="password"
          label="Create a password"
        />
        <TextField
          saveHintSpace
          className={{ container: 'w-full' }}
          valid={isUsernameValid}
          leftIcon={<AtIcon secondary />}
          name="traits.username"
          inputId="traits.username"
          label="Enter a username"
          hint={hints?.['traits.username']}
          valueChanged={() =>
            hints?.['traits.username'] &&
            onUpdateHints({ ...hints, 'traits.username': '' })
          }
          rightIcon={
            isUsernameValid && <VIcon className="text-theme-color-avocado" />
          }
        />
        {isAuthorOnboarding && (
          <TextField
            saveHintSpace
            className={{ container: 'w-full' }}
            leftIcon={<TwitterIcon />}
            name="traits.twitter"
            inputId="traits.twitter"
            label="Twitter"
            type="text"
            required
          />
        )}
        <span className="pb-4 border-b border-theme-divider-tertiary typo-subhead text-theme-label-secondary">
          Your email will be used to send you product and community updates
        </span>
        <Checkbox name="optOutMarketing">
          I don’t want to receive updates and promotions via email
        </Checkbox>
      </AuthForm>
      <Modal.Footer>
        <Button
          form="auth-form"
          type="submit"
          className="w-full bg-theme-color-cabbage"
        >
          Sign up
        </Button>
      </Modal.Footer>
    </>
  );
};
