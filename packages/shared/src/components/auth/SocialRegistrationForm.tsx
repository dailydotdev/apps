import classNames from 'classnames';
import type { MutableRefObject, ReactElement } from 'react';
import React, { useContext, useEffect, useState } from 'react';
import type { SocialRegistrationParameters } from '../../lib/auth';
import { AuthEventNames } from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import ImageInput from '../fields/ImageInput';
import { TextField } from '../fields/TextField';
import { MailIcon, UserIcon, LockIcon, AtIcon } from '../icons';
import AuthHeader from './AuthHeader';
import type { AuthFormProps } from './common';
import { providerMap, SocialProvider } from './common';
import AuthContext from '../../contexts/AuthContext';
import type { ProfileFormHint } from '../../hooks/useProfileForm';
import { Checkbox } from '../fields/Checkbox';
import { useLogContext } from '../../contexts/LogContext';
import AuthForm from './AuthForm';
import { Modal } from '../modals/common/Modal';
import { IconSize } from '../Icon';
import { useGenerateUsername } from '../../hooks';
import AuthContainer from './AuthContainer';
import ConditionalWrapper from '../ConditionalWrapper';
import type { SignBackProvider } from '../../hooks/auth/useSignBack';
import { useSignBack } from '../../hooks/auth/useSignBack';
import ExperienceLevelDropdown from '../profile/ExperienceLevelDropdown';
import { Loader } from '../Loader';
import { labels } from '../../lib';
import { generateNameFromEmail } from '../../lib/strings';
import SignupDisclaimer from './SignupDisclaimer';
import {
  FunnelGlassBar,
  funnelGlassBarCta,
} from '../../features/onboarding/shared/FunnelGlassBar';

export interface SocialRegistrationFormProps extends AuthFormProps {
  className?: string;
  provider?: string;
  formRef?: MutableRefObject<HTMLFormElement>;
  title?: string;
  hints?: ProfileFormHint;
  onUpdateHints?: (errors: ProfileFormHint) => void;
  onSignup?: (params: SocialRegistrationParameters) => void;
  isLoading?: boolean;
  /**
   * Post-signup onboarding only: the same chrome the email signup takes, so the
   * two account-details screens are one screen with one extra field. Everywhere
   * else — the auth modal, the recruiter flows — keeps the modal footer.
   */
  isOnboardingFunnel?: boolean;
}

export type SocialRegistrationFormValues = Omit<
  SocialRegistrationParameters,
  'method' | 'provider'
>;

export const SocialRegistrationForm = ({
  className,
  provider,
  formRef,
  title = 'Sign up',
  hints,
  onUpdateHints,
  onSignup,
  isLoading,
  simplified,
  isOnboardingFunnel,
}: SocialRegistrationFormProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { user } = useContext(AuthContext);
  const isAppleRegistration = provider === SocialProvider.Apple;
  const shouldShowAppleEmail = isAppleRegistration && !user?.email;
  const [nameHint, setNameHint] = useState<string>(null);
  const [usernameHint, setUsernameHint] = useState<string>(null);
  const [experienceLevelHint, setExperienceLevelHint] = useState<string>(null);
  const [name, setName] = useState(user?.name);
  const [email, setEmail] = useState(user?.email);
  const currentName = name || user?.name;
  const currentEmail = email || user?.email;
  const usernameSeed = isAppleRegistration
    ? currentName || currentEmail
    : currentName;
  const {
    username,
    setUsername,
    isLoading: isLoadingUsername,
  } = useGenerateUsername(usernameSeed);
  const { onUpdateSignBack } = useSignBack();

  useEffect(() => {
    logEvent({
      event_name: AuthEventNames.StartSignUpForm,
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logError = (error: unknown) => {
    logEvent({
      event_name: AuthEventNames.SubmitSignUpFormError,
      extra: JSON.stringify({ error }),
    });
  };

  useEffect(() => {
    if (Object.keys(hints).length) {
      logError(hints);
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hints]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    logEvent({
      event_name: AuthEventNames.SubmitSignUpForm,
    });

    const form = e.target as HTMLFormElement;
    const values = formToJson<SocialRegistrationFormValues>(
      formRef?.current ?? form,
    );
    const submittedEmail = values.email || currentEmail;
    const submittedName =
      values.name ||
      currentName ||
      (isAppleRegistration && submittedEmail
        ? generateNameFromEmail(submittedEmail, 'User')
        : undefined);

    if (!submittedEmail) {
      logError('Email not provided');
      return;
    }

    if (!submittedName) {
      logError('Name not provided');
      setNameHint('Please prove your name');
      return;
    }

    if (!values.username) {
      logError('Username not provided');
      setUsernameHint('Please choose a username');
      return;
    }

    if (!values.experienceLevel?.length) {
      logError('Experience level not provided');
      setExperienceLevelHint('Please select your experience level');
      return;
    }

    logEvent({
      event_name: AuthEventNames.SubmitSignupFormExtra,
      extra: JSON.stringify({
        username: values?.username,
        acceptedMarketing: !values?.optOutMarketing,
        experienceLevel: values?.experienceLevel,
        language: values?.language,
      }),
    });

    onUpdateSignBack(
      { name: submittedName, email: submittedEmail, image: user.image },
      provider as SignBackProvider,
    );
    const { file, optOutMarketing, ...rest } = values;
    onSignup({
      ...rest,
      email: submittedEmail,
      name: submittedName,
      acceptedMarketing: !optOutMarketing,
    });
  };

  const emailFieldIcon = (providerI: string) => {
    if (providerMap[providerI]) {
      return React.cloneElement(providerMap[providerI].icon, {
        secondary: false,
        size: 'medium',
      });
    }

    return <MailIcon size={IconSize.Small} />;
  };

  if (!user) {
    return <></>;
  }

  const submitButton = (
    <Button
      form="auth-form"
      type="submit"
      className={isOnboardingFunnel ? funnelGlassBarCta : 'w-full'}
      size={isOnboardingFunnel ? ButtonSize.Medium : undefined}
      variant={ButtonVariant.Primary}
      disabled={isLoading}
    >
      {user?.isPlus ? 'Continue' : 'Sign up'}
    </Button>
  );

  const fields = (
    <>
      {isAppleRegistration && currentName && (
        <input name="name" type="hidden" value={currentName} readOnly />
      )}
      {isAppleRegistration && !shouldShowAppleEmail && (
        <input name="email" type="hidden" value={currentEmail} readOnly />
      )}
      {!isAppleRegistration && (
        <ImageInput
          className={{ container: 'mb-4' }}
          initialValue={user?.image}
          size="medium"
          viewOnly
        />
      )}
      {(!isAppleRegistration || shouldShowAppleEmail) && (
        <TextField
          saveHintSpace
          className={{ container: 'w-full' }}
          leftIcon={emailFieldIcon(provider)}
          name="email"
          inputId="email"
          label="Email"
          type="email"
          value={currentEmail}
          readOnly={!isAppleRegistration}
          rightIcon={!isAppleRegistration ? <LockIcon /> : undefined}
          onBlur={(e) => setEmail(e.target.value)}
        />
      )}
      {!isAppleRegistration && (
        <TextField
          saveHintSpace
          className={{ container: 'w-full' }}
          leftIcon={<UserIcon size={IconSize.Small} />}
          name="name"
          inputId="name"
          label="Name"
          value={currentName}
          valid={!nameHint && !hints?.name}
          hint={hints?.name || nameHint}
          onBlur={(e) => setName(e.target.value)}
          valueChanged={() => {
            if (hints?.name) {
              onUpdateHints?.({ ...hints, name: '' });
            }
            if (nameHint) {
              setNameHint('');
            }
          }}
        />
      )}
      <TextField
        saveHintSpace
        className={{ container: 'w-full' }}
        leftIcon={<AtIcon size={IconSize.Small} secondary />}
        name="username"
        inputId="username"
        label="Enter a username"
        value={username}
        minLength={1}
        valid={isLoadingUsername || (!usernameHint && !hints?.username)}
        hint={
          isLoadingUsername
            ? labels.generatingUsername
            : hints?.username || usernameHint
        }
        onBlur={(e) => setUsername(e.target.value)}
        valueChanged={() =>
          hints?.[username] && onUpdateHints({ ...hints, username: '' })
        }
        rightIcon={isLoadingUsername ? <Loader /> : null}
      />
      <ExperienceLevelDropdown
        className={{ container: 'w-full' }}
        name="experienceLevel"
        onChange={() => {
          if (experienceLevelHint) {
            setExperienceLevelHint(null);
          }
        }}
        valid={experienceLevelHint === null}
        hint={experienceLevelHint}
        saveHintSpace
      />
      <Checkbox name="optOutMarketing" className="font-normal">
        I don’t want to receive updates and promotions via email
      </Checkbox>
    </>
  );

  // Same shell, spacing and docked CTA as the email signup, so the two
  // account-details screens differ only by the avatar above the fields.
  if (isOnboardingFunnel) {
    return (
      <div className="flex flex-col">
        <AuthHeader simplified={simplified} onboardingHeadline title={title} />
        <div className={classNames(!simplified && 'px-4 pb-4 tablet:px-6')}>
          <AuthForm
            className={classNames(
              'mt-10 w-full flex-1 place-items-center gap-2 self-center overflow-y-auto pb-2',
              className,
            )}
            ref={formRef}
            onSubmit={onSubmit}
            id="auth-form"
            data-testid="registration_form"
          >
            {fields}
            <ConditionalWrapper
              condition={simplified ?? false}
              wrapper={(component) => (
                <AuthContainer className="!mt-0 !px-0 pb-1 pt-3">
                  {component}
                </AuthContainer>
              )}
            >
              <FunnelGlassBar>{submitButton}</FunnelGlassBar>
              <SignupDisclaimer className="!text-text-tertiary typo-caption1" />
            </ConditionalWrapper>
          </AuthForm>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthHeader simplified={simplified} title={title} />
      <AuthForm
        className={classNames(
          'mt-6 w-full flex-1 place-items-center gap-2 self-center overflow-y-auto px-6 pb-2 tablet:px-[3.75rem]',
          className,
        )}
        ref={formRef}
        onSubmit={onSubmit}
        id="auth-form"
        data-testid="registration_form"
      >
        {fields}
      </AuthForm>
      <ConditionalWrapper
        condition={simplified ?? false}
        wrapper={(component) => (
          <AuthContainer className="!mt-0">{component}</AuthContainer>
        )}
      >
        <Modal.Footer>{submitButton}</Modal.Footer>
      </ConditionalWrapper>
    </>
  );
};
