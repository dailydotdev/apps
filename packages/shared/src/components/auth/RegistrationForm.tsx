import classNames from 'classnames';
import React, {
  MutableRefObject,
  ReactElement,
  useContext,
  useEffect,
  useId,
  useState,
} from 'react';
import {
  AuthEventNames,
  AuthTriggers,
  AuthTriggersType,
  RegistrationError,
  RegistrationParameters,
} from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { Button, ButtonVariant } from '../buttons/Button';
import { PasswordField } from '../fields/PasswordField';
import { TextField } from '../fields/TextField';
import { MailIcon, UserIcon, VIcon, AtIcon, TwitterIcon } from '../icons';
import { CloseModalFunc } from '../modals/common';
import AuthHeader from './AuthHeader';
import TokenInput from './TokenField';
import AuthForm from './AuthForm';
import { Checkbox } from '../fields/Checkbox';
import LogContext from '../../contexts/LogContext';
import { useGenerateUsername } from '../../hooks';
import { AuthFormProps } from './common';
import ConditionalWrapper from '../ConditionalWrapper';
import AuthContainer from './AuthContainer';
import { onValidateHandles } from '../../hooks/useProfileForm';
import ExperienceLevelDropdown from '../profile/ExperienceLevelDropdown';
import { LanguageDropdown } from '../profile/LanguageDropdown';

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
>;

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
  const { logEvent } = useContext(LogContext);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [name, setName] = useState('');
  const isAuthorOnboarding = trigger === AuthTriggers.Author;
  const { username, setUsername } = useGenerateUsername(name);

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
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hints]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
    });
  };

  const isNameValid = !hints?.['traits.name'] && isSubmitted;
  const isUsernameValid = !hints?.['traits.username'] && isSubmitted;
  const isExperienceLevelValid =
    !isSubmitted || !hints?.['traits.experienceLevel'];
  const isLanguageValid = !isSubmitted || !hints?.['traits.language'];

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
          valid={isLanguageValid}
          hint={hints?.['traits.language']}
          onChange={() =>
            hints?.['traits.language'] &&
            onUpdateHints({ ...hints, 'traits.language': '' })
          }
          saveHintSpace
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
