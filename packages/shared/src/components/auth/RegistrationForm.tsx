import classNames from 'classnames';
import type { MutableRefObject, ReactElement } from 'react';
import React, { useContext, useEffect, useId, useRef, useState } from 'react';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { Turnstile } from '@marsidev/react-turnstile';
import type {
  AuthTriggersType,
  RegistrationError,
  RegistrationParameters,
} from '../../lib/auth';
import { AuthEventNames, AuthTriggers } from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { Button, ButtonVariant } from '../buttons/Button';
import { PasswordField } from '../fields/PasswordField';
import { TextField } from '../fields/TextField';
import { MailIcon, UserIcon, VIcon, AtIcon, TwitterIcon } from '../icons';
import type { CloseModalFunc } from '../modals/common';
import AuthHeader from './AuthHeader';
import TokenInput from './TokenField';
import AuthForm from './AuthForm';
import { Checkbox } from '../fields/Checkbox';
import LogContext from '../../contexts/LogContext';
import { useGenerateUsername, useToastNotification } from '../../hooks';
import type { AuthFormProps } from './common';
import ConditionalWrapper from '../ConditionalWrapper';
import AuthContainer from './AuthContainer';
import { onValidateHandles } from '../../hooks/useProfileForm';
import ExperienceLevelDropdown from '../profile/ExperienceLevelDropdown';
import { LanguageDropdown } from '../profile/LanguageDropdown';
import Alert, { AlertType } from '../widgets/Alert';

export interface RegistrationFormProps extends AuthFormProps {
  email: string;
  formRef?: MutableRefObject<HTMLFormElement>;
  onBack?: CloseModalFunc;
  hints?: RegistrationError;
  onUpdateHints?: (errors: RegistrationError) => void;
  onSignup?: (params: RegistrationFormValues) => void;
  token: string;
  trigger: AuthTriggersType;
}

export type RegistrationFormValues = Omit<
  RegistrationParameters,
  'method' | 'provider'
> & {
  headers?: Record<string, string>;
};

const RegistrationForm = ({
  email,
  formRef,
  onBack,
  onSignup,
  token,
  hints,
  trigger,
  onUpdateHints,
  simplified,
}: RegistrationFormProps): ReactElement => {
  console.log(hints);
  const { logEvent } = useContext(LogContext);
  const [turnstileError, setTurnstileError] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [name, setName] = useState('');
  const isAuthorOnboarding = trigger === AuthTriggers.Author;
  const { username, setUsername } = useGenerateUsername(name);
  const { displayToast } = useToastNotification();
  const ref = useRef<TurnstileInstance>(null);

  useEffect(() => {
    logEvent({
      event_name: AuthEventNames.StartSignUpForm,
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Object.keys(hints).length) {
      logEvent({
        event_name: AuthEventNames.SubmitSignUpFormError,
        extra: JSON.stringify({ error: hints }),
      });
      if (hints?.csrf_token) {
        setTurnstileError(true);
      }
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hints]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTurnstileError(false);
    logEvent({
      event_name: AuthEventNames.SubmitSignUpForm,
    });

    setIsSubmitted(true);
    const form = e.target as HTMLFormElement;
    const { optOutMarketing, ...values } = formToJson<RegistrationFormValues>(
      formRef?.current ?? form,
    );

    if (
      !values['traits.name']?.length ||
      !values['traits.username']?.length ||
      !values['traits.experienceLevel']?.length
    ) {
      const setHints = { ...hints };

      if (!values['traits.name']?.length) {
        setHints['traits.name'] = 'Please provide name.';
      }
      if (!values['traits.username']?.length) {
        setHints['traits.username'] = 'Please provide username.';
      }
      if (!values['traits.experienceLevel']?.length) {
        setHints['traits.experienceLevel'] = 'Please provide experience level.';
      }

      onUpdateHints(setHints);
      return;
    }

    if (!ref?.current?.getResponse()) {
      logEvent({
        event_name: AuthEventNames.SubmitSignUpFormError,
        extra: JSON.stringify({
          error: 'Turnstile not valid',
        }),
      });
      setTurnstileError(true);
      return;
    }

    const error = onValidateHandles(
      {},
      {
        username: values['traits.username'],
        twitter: values['traits.twitter'],
      },
    );

    if (error.username || error.twitter) {
      const updatedHints = { ...hints };

      if (error.username) {
        updatedHints['traits.username'] = error.username;
      }

      if (error.twitter) {
        updatedHints['traits.twitter'] = error.twitter;
      }

      onUpdateHints(updatedHints);
      return;
    }

    onSignup({
      ...values,
      'traits.acceptedMarketing': !optOutMarketing,
      headers: {
        'True-Client-Ip': ref?.current?.getResponse(),
      },
    });
  };

  const isNameValid = !hints?.['traits.name'] && isSubmitted;
  const isUsernameValid = !hints?.['traits.username'] && isSubmitted;
  const isExperienceLevelValid =
    !isSubmitted || !hints?.['traits.experienceLevel'];

  const headingId = useId();

  return (
    <>
      <AuthHeader
        id={headingId}
        simplified={simplified}
        title="Sign up"
        onBack={onBack}
      />
      <AuthForm
        aria-labelledby={headingId}
        className={classNames(
          'mt-6 w-full flex-1 place-items-center gap-2 self-center overflow-y-auto px-6 pb-2 tablet:px-[3.75rem]',
        )}
        data-testid="registration_form"
        id="auth-form"
        onSubmit={onSubmit}
        ref={formRef}
      >
        <TokenInput token={token} />
        <TextField
          autoComplete="email"
          saveHintSpace
          className={{ container: 'w-full' }}
          leftIcon={<MailIcon aria-hidden role="presentation" />}
          name="traits.email"
          inputId="email"
          label="Email"
          type="email"
          value={email}
          readOnly
          rightIcon={
            <VIcon
              aria-hidden
              role="presentation"
              className="text-accent-avocado-default"
            />
          }
        />
        <TextField
          autoFocus
          autoComplete="name"
          saveHintSpace
          className={{ container: 'w-full' }}
          valid={isNameValid}
          leftIcon={<UserIcon aria-hidden role="presentation" />}
          name="traits.name"
          inputId="traits.name"
          label="Name"
          hint={hints?.['traits.name']}
          value={name}
          onBlur={(e) => setName(e.target.value)}
          valueChanged={() =>
            hints?.['traits.name'] &&
            onUpdateHints({ ...hints, 'traits.name': '' })
          }
          rightIcon={
            isNameValid && (
              <VIcon
                aria-hidden
                role="presentation"
                className="text-accent-avocado-default"
              />
            )
          }
        />
        <PasswordField
          required
          minLength={6}
          maxLength={72}
          saveHintSpace
          className={{ container: 'w-full' }}
          name="password"
          inputId="password"
          label="Create a password"
          autoComplete="new-password"
        />
        <TextField
          autoComplete="user"
          saveHintSpace
          className={{ container: 'w-full' }}
          valid={isUsernameValid}
          leftIcon={<AtIcon aria-hidden role="presentation" secondary />}
          name="traits.username"
          inputId="traits.username"
          label="Enter a username"
          value={username}
          onBlur={(e) => setUsername(e.target.value)}
          hint={hints?.['traits.username']}
          valueChanged={() =>
            hints?.['traits.username'] &&
            onUpdateHints({ ...hints, 'traits.username': '' })
          }
          rightIcon={
            isUsernameValid && <VIcon className="text-accent-avocado-default" />
          }
        />
        {isAuthorOnboarding && (
          <TextField
            saveHintSpace
            className={{ container: 'w-full' }}
            leftIcon={<TwitterIcon aria-hidden role="presentation" />}
            name="traits.twitter"
            inputId="traits.twitter"
            label="X"
            type="text"
            required
          />
        )}
        <ExperienceLevelDropdown
          className={{ container: 'w-full' }}
          name="traits.experienceLevel"
          valid={isExperienceLevelValid}
          hint={hints?.['traits.experienceLevel']}
          onChange={() =>
            hints?.['traits.experienceLevel'] &&
            onUpdateHints({ ...hints, 'traits.experienceLevel': '' })
          }
          saveHintSpace
        />
        <LanguageDropdown
          className={{ container: 'w-full' }}
          name="traits.language"
        />
        <span className="border-b border-border-subtlest-tertiary pb-4 text-text-secondary typo-subhead">
          Your email will be used to send you product and community updates
        </span>
        <Checkbox name="optOutMarketing">
          I don’t want to receive updates and promotions via email
        </Checkbox>
        <ConditionalWrapper
          condition={simplified}
          wrapper={(component) => (
            <AuthContainer className="!mt-0 border-t border-border-subtlest-tertiary p-3 !px-3 pb-1">
              {component}
            </AuthContainer>
          )}
        >
          <Turnstile
            ref={ref}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_KEY}
            className="mx-auto"
          />
          {turnstileError ? (
            <Alert
              type={AlertType.Error}
              title="Please complete the security check."
            />
          ) : undefined}
          <Button
            form="auth-form"
            type="submit"
            className="w-full"
            variant={ButtonVariant.Primary}
          >
            Sign up
          </Button>
        </ConditionalWrapper>
      </AuthForm>
    </>
  );
};

export default RegistrationForm;
