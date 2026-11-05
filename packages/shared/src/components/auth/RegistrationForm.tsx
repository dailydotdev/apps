import classNames from 'classnames';
import type { MutableRefObject, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { Turnstile } from '@marsidev/react-turnstile';
import { useAtomValue } from 'jotai';
import type {
  AuthTriggersType,
  RegistrationError,
  RegistrationParameters,
} from '../../lib/auth';
import { AuthEventNames, AuthTriggers } from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { Button, ButtonVariant, ButtonSize } from '../buttons/Button';
import { PasswordField } from '../fields/PasswordField';
import { TextField } from '../fields/TextField';
import {
  MailIcon,
  UserIcon,
  VIcon,
  AtIcon,
  ArrowIcon,
  BriefIcon,
  JobIcon,
} from '../icons';
import type { CloseModalFunc } from '../modals/common';
import TokenInput from './TokenField';
import AuthForm from './AuthForm';
import AuthHeader from './AuthHeader';
import { AuthScreenTitle } from './AuthScreenTitle';
import SignupDisclaimer from './SignupDisclaimer';
import { generateUsername } from '../../graphql/users';
import { AuthActionBar } from './AuthActionBar';
import { useTurnstileTheme } from '../../hooks/auth/useTurnstileTheme';
import { MemberAlready } from '../onboarding/MemberAlready';
import { Checkbox } from '../fields/Checkbox';
import { useLogContext } from '../../contexts/LogContext';
import { useGenerateUsername, useCheckExistingEmail } from '../../hooks';
import {
  getTurnstileWaitExtra,
  TURNSTILE_WAIT_LOG_THRESHOLD_MS,
  waitForTurnstileToken,
} from '../../lib/turnstile';
import type { AuthFormProps } from './common';
import ConditionalWrapper from '../ConditionalWrapper';
import AuthContainer from './AuthContainer';
import { onValidateHandles } from '../../hooks/useProfileForm';
import ExperienceLevelDropdown from '../profile/ExperienceLevelDropdown';
import CloudProviderDropdown from '../profile/CloudProviderDropdown';
import type { ProfileExtraField } from '../../lib/user';
import Alert, { AlertType, AlertParagraph } from '../widgets/Alert';
import { isDevelopment, isProductionAPI } from '../../lib/constants';
import { onboardingGradientClasses } from '../onboarding/common';
import { useAuthData } from '../../contexts/AuthDataContext';
import { authAtom } from '../../features/onboarding/store/onboarding.store';
import { FunnelTargetId } from '../../features/onboarding/types/funnelEvents';
import {
  FunnelGlassBar,
  funnelGlassBarCta,
} from '../../features/onboarding/shared/FunnelGlassBar';
import { Loader } from '../Loader';
import { labels } from '../../lib';

export interface RegistrationFormProps extends AuthFormProps {
  formRef?: MutableRefObject<HTMLFormElement>;
  onBack?: CloseModalFunc;
  hints?: RegistrationError;
  onUpdateHints?: (errors: RegistrationError) => void;
  onSignup?: (params: RegistrationFormValues) => void;
  token?: string;
  trigger: AuthTriggersType;
  onExistingEmailLoginClick?: (existingEmail?: string) => void;
  onBackToIntro?: () => void;
  targetId?: string;
  // Header title above the form. Defaults to "Sign up" because this form is
  // exclusively reached via the signup flow; left overridable so the same
  // component can reflect a login-style title if a flow ever needs it.
  headerTitle?: string;
  // Optional extra profile fields to collect at signup, driven by the
  // onboarding funnel (campaign cohorts). Empty/undefined = default fields.
  extraFields?: ProfileExtraField[];
  // Whether to render the "The homepage developers deserve" headline above the
  // form. The onboarding funnel already shows this copy on the signup wall, so
  // it hides it here to avoid duplicating the message on the email step.
  showHeadline?: boolean;
  // Post-signup onboarding only: the funnel's headline scale, and the glass bar
  // around Sign up, so this screen matches the steps after it.
  isOnboardingFunnel?: boolean;
  /**
   * The daily.dev for Startups page: its own full-page layout, and only email,
   * name and password. The username is generated, as it is for a social signup
   * there, and only shown if it needs fixing.
   */
  isStartups?: boolean;
}

export type RegistrationFormValues = Omit<
  RegistrationParameters,
  'method' | 'provider'
> & {
  'cf-turnstile-response'?: string;
  turnstileToken?: string;
};

const getStartupsFieldErrors = (form: FormData): RegistrationError => {
  const errors: RegistrationError = {};
  const email = String(form.get('traits.email') ?? '').trim();
  const password = String(form.get('password') ?? '');

  if (!email) {
    errors['traits.email'] = 'Enter your email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors['traits.email'] = 'Enter a valid email address';
  }
  if (!String(form.get('traits.name') ?? '').trim()) {
    errors['traits.name'] = 'Add your name so your team recognises you.';
  }
  if (password.length < 8) {
    errors.password = 'Use at least 8 characters.';
  }

  return errors;
};

const RegistrationForm = ({
  formRef,
  onBack,
  onBackToIntro,
  onExistingEmailLoginClick,
  onSignup = () => undefined,
  token,
  hints = {},
  trigger,
  onUpdateHints = () => undefined,
  simplified,
  targetId,
  headerTitle = 'Sign up',
  extraFields = [],
  showHeadline = true,
  isOnboardingFunnel,
  isStartups,
}: RegistrationFormProps): ReactElement => {
  const { email } = useAuthData();
  const { logEvent } = useLogContext();
  const [turnstileError, setTurnstileError] = useState<boolean>(false);
  const [turnstileLoaded, setTurnstileLoaded] = useState<boolean>(false);
  const [turnstileErrorLoading, setTurnstileErrorLoading] =
    useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [name, setName] = useState('');
  const [isEmailFilled, setIsEmailFilled] = useState(!!email?.length);
  const isRecruiterOnboarding = trigger === AuthTriggers.RecruiterSelfServe;
  const hideExperienceLevel =
    isRecruiterOnboarding || trigger === AuthTriggers.StartupsCheckout;
  const {
    username,
    setUsername,
    isLoading: isLoadingUsername,
  } = useGenerateUsername(name);
  const [isUsernameVisible, setIsUsernameVisible] = useState(!isStartups);
  const turnstileRef = useRef<TurnstileInstance>(null);
  // The ref guards against double submits synchronously; the state drives the
  // button's loading spinner while we wait for the Turnstile token.
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_KEY ?? '';
  // With no key there's nothing to wait for, as on the log-in form
  const isTurnstilePending =
    !turnstileLoaded && (!isStartups || !!turnstileSiteKey);
  const isVerifyingTurnstileRef = useRef(false);
  const [isVerifyingTurnstile, setIsVerifyingTurnstile] = useState(false);
  const isTurnstileInteractiveRef = useRef(false);
  const turnstileTheme = useTurnstileTheme();

  const logRef = useRef(logEvent);
  logRef.current = logEvent;

  useEffect(() => {
    logRef.current({
      event_name: AuthEventNames.StartSignUpForm,
    });
  }, []);

  useEffect(() => {
    if (Object.values(hints).some(Boolean)) {
      logRef.current({
        event_name: AuthEventNames.SubmitSignUpFormError,
        extra: JSON.stringify({ error: hints }),
      });
      if (hints?.csrf_token) {
        setTurnstileError(true);
      }
      if (hints?.['traits.username']) {
        setIsUsernameVisible(true);
      }
      turnstileRef?.current?.reset();
    }
  }, [hints]);

  useEffect(() => {
    if (!isTurnstilePending) {
      return () => {};
    }

    const turnstileLoadTimeout = setTimeout(() => {
      if (!turnstileLoaded) {
        logRef.current({
          event_name: AuthEventNames.TurnstileLoadError,
        });
        setTurnstileErrorLoading(true);
      }
    }, 5000);

    return () => clearTimeout(turnstileLoadTimeout);
  }, [isTurnstilePending, turnstileLoaded]);

  const {
    email: { isCheckPending, alreadyExists },
    onEmailCheck,
  } = useCheckExistingEmail({
    onValidEmail: () => null,
    onAfterEmailCheck: (emailExists) => {
      if (emailExists) {
        logRef.current({
          event_name: AuthEventNames.OpenLogin,
          extra: JSON.stringify({ trigger }),
          target_id: targetId,
        });
      }
    },
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCheckPending || alreadyExists) {
      return;
    }

    setTurnstileError(false);
    logRef.current({
      event_name: AuthEventNames.SubmitSignUpForm,
    });

    setIsSubmitted(true);
    const form = e.target as HTMLFormElement;
    const { optOutMarketing, ...values } = formToJson<RegistrationFormValues>(
      formRef?.current ?? form,
    );
    delete values['cf-turnstile-response'];

    // Pressing Enter in the name field submits before its blur asks for one
    if (
      !isUsernameVisible &&
      !values['traits.username']?.length &&
      values['traits.name']?.length
    ) {
      values['traits.username'] = await generateUsername(
        values['traits.name'],
      ).catch(() => '');
    }

    const requiresExperienceLevel = !hideExperienceLevel;
    // Cloud provider is mandatory only when the funnel requests it (the
    // campaign flow); company/job title stay optional.
    const requiresCloudProvider = extraFields.includes('cloudProvider');
    if (
      !values['traits.name']?.length ||
      !values['traits.username']?.length ||
      (requiresExperienceLevel && !values['traits.experienceLevel']?.length) ||
      (requiresCloudProvider && !values['traits.cloudProvider']?.length)
    ) {
      const setHints = { ...hints };

      if (!values['traits.name']?.length) {
        setHints['traits.name'] = isStartups
          ? 'Add your name so your team recognises you.'
          : 'Please provide name.';
      }
      if (!values['traits.username']?.length) {
        setHints['traits.username'] = 'Please provide username.';
      }
      if (
        requiresExperienceLevel &&
        !values['traits.experienceLevel']?.length
      ) {
        setHints['traits.experienceLevel'] = 'Please provide experience level.';
      }
      if (requiresCloudProvider && !values['traits.cloudProvider']?.length) {
        setHints['traits.cloudProvider'] =
          'Please provide your cloud provider.';
      }

      onUpdateHints(setHints);
      return;
    }

    if (isVerifyingTurnstileRef.current) {
      return;
    }
    isVerifyingTurnstileRef.current = true;
    setIsVerifyingTurnstile(true);
    const turnstileStartedAt = Date.now();
    const turnstileResponse = await waitForTurnstileToken(
      turnstileRef?.current,
      { shouldStop: () => isTurnstileInteractiveRef.current },
    ).finally(() => {
      isVerifyingTurnstileRef.current = false;
      setIsVerifyingTurnstile(false);
    });
    const turnstileWaitExtra = getTurnstileWaitExtra({
      form: 'signup',
      startedAt: turnstileStartedAt,
      token: turnstileResponse,
      isInteractive: isTurnstileInteractiveRef.current,
    });
    if (turnstileWaitExtra.waited_ms >= TURNSTILE_WAIT_LOG_THRESHOLD_MS) {
      logRef.current({
        event_name: AuthEventNames.TurnstileTokenWait,
        extra: JSON.stringify(turnstileWaitExtra),
      });
    }
    if (!turnstileResponse) {
      logRef.current({
        event_name: AuthEventNames.SubmitSignUpFormError,
        extra: JSON.stringify({
          error: 'Turnstile not valid',
          waited_ms: turnstileWaitExtra.waited_ms,
          outcome: turnstileWaitExtra.outcome,
        }),
      });
      setTurnstileError(true);
      return;
    }

    const error = onValidateHandles(
      {},
      {
        username: values['traits.username'],
      },
    );

    if (error.username) {
      const updatedHints = { ...hints };

      if (error.username) {
        updatedHints['traits.username'] = error.username;
      }

      onUpdateHints(updatedHints);
      return;
    }

    const shouldSendTurnstileToken = !(isDevelopment && !isProductionAPI);

    onSignup({
      ...values,
      // No opt-out on this form, so nobody is signed up to marketing by it
      'traits.acceptedMarketing': isStartups ? false : !optOutMarketing,
      // Set experience level to "not an engineer" for recruiters
      ...(isRecruiterOnboarding && {
        'traits.experienceLevel': 'NOT_ENGINEER',
      }),
      ...(shouldSendTurnstileToken && { turnstileToken: turnstileResponse }),
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    if (isStartups) {
      e.preventDefault();
      const errors = getStartupsFieldErrors(
        new FormData(e.target as HTMLFormElement),
      );
      if (Object.keys(errors).length) {
        setIsSubmitted(true);
        onUpdateHints({ ...hints, ...errors });
        return;
      }
    }

    const emailCheck = await onEmailCheck(e);
    if (!!emailCheck && emailCheck.emailValue && !emailCheck.emailExists) {
      await onSubmit(e);
    }
  };

  const isNameValid = !hints?.['traits.name'];
  const isUsernameValid = !hints?.['traits.username'];
  const isExperienceLevelValid =
    !isSubmitted || !hints?.['traits.experienceLevel'];
  const isCloudProviderValid = !isSubmitted || !hints?.['traits.cloudProvider'];
  const { isAuthenticating = false } = useAtomValue(authAtom);

  // Only show the valid-state checkmark once the user has actually typed
  // a non-empty value; an untouched field shouldn't look like it passed
  // validation.
  const isNameFilled = !!name?.length;
  const isUsernameFilled = !!username?.length;
  const successIcon = (
    <VIcon
      aria-hidden
      role="presentation"
      className="text-accent-avocado-default"
    />
  );

  const usernameIcon = (() => {
    if (isLoadingUsername) {
      return <Loader />;
    }

    if (isUsernameFilled && isUsernameValid) {
      return successIcon;
    }

    return undefined;
  })();

  const hasGlassBar = !!isOnboardingFunnel || !!isStartups;

  return (
    <div className={classNames('flex flex-1 flex-col', isStartups && 'gap-6')}>
      {isStartups ? (
        <AuthScreenTitle title="Create your account" />
      ) : (
        <AuthHeader
          simplified={simplified}
          onboardingHeadline={isOnboardingFunnel}
          title={headerTitle}
          onBack={simplified ? undefined : onBack}
        />
      )}
      <div
        className={classNames(
          // `simplified` is set by `/onboarding`, where the outer page already
          // applies horizontal padding. Anywhere else (e.g. the inline AuthModal)
          // the form would otherwise hug the container edge, so add it here.
          !simplified && 'flex flex-1 flex-col px-6',
        )}
      >
        {!isAuthenticating && (onBackToIntro || showHeadline) && (
          <div className="flex items-start gap-4 pt-2">
            {onBackToIntro && (
              <Button
                className="border-border-subtlest-tertiary text-text-secondary"
                data-funnel-track={FunnelTargetId.StepBack}
                icon={<ArrowIcon className="-rotate-90" />}
                onClick={onBackToIntro}
                size={ButtonSize.Medium}
                type="button"
                variant={ButtonVariant.Secondary}
              />
            )}
            {showHeadline && (
              <h1 className="mx-auto mt-4 flex-1 font-bold leading-[1.3] tracking-tight typo-title1 tablet:leading-[1.22] tablet:typo-large-title">
                <span
                  className={classNames(
                    onboardingGradientClasses,
                    'text-text-primary',
                  )}
                >
                  Where developers discover what&apos;s next
                </span>
              </h1>
            )}
          </div>
        )}
        <AuthForm
          className={
            isStartups
              ? 'w-full gap-1'
              : classNames(
                  'w-full flex-1 place-items-center self-center',
                  simplified ? 'gap-2' : 'gap-1',
                  simplified ? 'mt-10 overflow-y-auto pb-2' : 'mt-6',
                )
          }
          data-testid="registration_form"
          id="auth-form"
          noValidate={isStartups}
          onSubmit={handleFormSubmit}
          ref={formRef}
        >
          {token && <TokenInput token={token} />}
          <TextField
            autoFocus={!isStartups}
            autoComplete="email"
            saveHintSpace
            valid={isStartups && hints?.['traits.email'] ? false : undefined}
            hint={isStartups ? hints?.['traits.email'] : undefined}
            className={{ container: 'w-full' }}
            leftIcon={<MailIcon aria-hidden role="presentation" />}
            name="traits.email"
            inputId="email"
            label={isStartups ? 'Work email' : 'Email'}
            type="email"
            value={email}
            onChange={(e) => {
              if (!e.target.value || !e.target.validity.valid) {
                setIsEmailFilled(false);
              }
              if (isStartups && hints?.['traits.email']) {
                onUpdateHints({ ...hints, 'traits.email': '' });
              }
            }}
            onBlur={(e) =>
              setIsEmailFilled(!!e.target.value && e.target.validity.valid)
            }
            rightIcon={isEmailFilled && !isStartups ? successIcon : undefined}
          />
          {!isStartups && hints?.['traits.email'] && !alreadyExists && (
            <Alert
              className="-mt-4 mb-3 min-w-full"
              type={AlertType.Error}
              title={hints['traits.email']}
            />
          )}
          {!isStartups && alreadyExists && (
            <Alert
              className="-mt-4 mb-3 min-w-full"
              type={AlertType.Error}
              flexDirection="flex-row"
            >
              <AlertParagraph className="!mt-0 flex-1">
                Email is taken. Existing user?{' '}
                <button
                  type="button"
                  onClick={(e) =>
                    onExistingEmailLoginClick?.(
                      (
                        e.currentTarget.form?.elements.namedItem(
                          'traits.email',
                        ) as HTMLInputElement | null
                      )?.value,
                    )
                  }
                  className="font-bold underline"
                >
                  Log in.
                </button>
              </AlertParagraph>
            </Alert>
          )}
          <TextField
            autoComplete="name"
            saveHintSpace
            className={{ container: 'w-full' }}
            valid={isNameValid}
            leftIcon={<UserIcon aria-hidden role="presentation" />}
            name="traits.name"
            inputId="traits.name"
            label={isStartups ? 'Your name' : 'Name'}
            hint={hints?.['traits.name']}
            value={name}
            onBlur={(e) => setName(e.target.value)}
            valueChanged={() =>
              hints?.['traits.name'] &&
              onUpdateHints({ ...hints, 'traits.name': '' })
            }
            rightIcon={
              isNameFilled && isNameValid && !isStartups
                ? successIcon
                : undefined
            }
          />
          <PasswordField
            required
            minLength={8}
            maxLength={72}
            showMaxLength={!isStartups}
            saveHintSpace
            className={{ container: 'w-full' }}
            name="password"
            inputId="password"
            label="Create a password"
            autoComplete="new-password"
            hint={hints?.password}
            valueChanged={() =>
              hints?.password && onUpdateHints({ ...hints, password: '' })
            }
          />
          {!isUsernameVisible && (
            <input type="hidden" name="traits.username" value={username} />
          )}
          {isUsernameVisible && (
            <TextField
              autoComplete="user"
              saveHintSpace
              className={{ container: 'w-full' }}
              valid={isLoadingUsername || isUsernameValid}
              leftIcon={<AtIcon aria-hidden role="presentation" />}
              name="traits.username"
              inputId="traits.username"
              label="Enter a username"
              value={username}
              onBlur={(e) => setUsername(e.target.value)}
              hint={
                isLoadingUsername
                  ? labels.generatingUsername
                  : hints?.['traits.username']
              }
              valueChanged={() =>
                hints?.['traits.username'] &&
                onUpdateHints({ ...hints, 'traits.username': '' })
              }
              rightIcon={usernameIcon}
            />
          )}
          {!hideExperienceLevel && (
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
          )}
          {extraFields.includes('company') && (
            <TextField
              autoComplete="organization"
              saveHintSpace
              className={{ container: 'w-full' }}
              leftIcon={<BriefIcon aria-hidden role="presentation" />}
              name="traits.company"
              inputId="traits.company"
              label="Company name"
            />
          )}
          {extraFields.includes('jobTitle') && (
            <TextField
              autoComplete="organization-title"
              saveHintSpace
              className={{ container: 'w-full' }}
              leftIcon={<JobIcon aria-hidden role="presentation" />}
              name="traits.title"
              inputId="traits.title"
              label="Job title"
            />
          )}
          {extraFields.includes('cloudProvider') && (
            <CloudProviderDropdown
              className={{ container: 'w-full' }}
              name="traits.cloudProvider"
              valid={isCloudProviderValid}
              hint={hints?.['traits.cloudProvider']}
              onChange={() =>
                hints?.['traits.cloudProvider'] &&
                onUpdateHints({ ...hints, 'traits.cloudProvider': '' })
              }
              saveHintSpace
            />
          )}
          {!isStartups && (
            <Checkbox className="w-full" name="optOutMarketing">
              I don&apos;t want to receive updates and promotions via email
            </Checkbox>
          )}
          <ConditionalWrapper
            condition={simplified ?? false}
            wrapper={(component) =>
              isStartups ? (
                <div className="mt-2 flex flex-col">{component}</div>
              ) : (
                <AuthContainer className="!mt-0 !px-0 pb-1 pt-1">
                  {component}
                </AuthContainer>
              )
            }
          >
            <Turnstile
              ref={turnstileRef}
              siteKey={turnstileSiteKey}
              options={{
                theme: turnstileTheme,
                // Run the challenge silently and only surface the widget when a
                // human interaction is actually required, so the branded box
                // doesn't clash with the form for the common (passing) case.
                appearance: 'interaction-only',
              }}
              className="mx-auto"
              onWidgetLoad={() => {
                setTurnstileLoaded(true);
                setTurnstileErrorLoading(false);
              }}
              onBeforeInteractive={() => {
                isTurnstileInteractiveRef.current = true;
              }}
              onAfterInteractive={() => {
                isTurnstileInteractiveRef.current = false;
              }}
            />
            {turnstileError && (
              <Alert
                type={AlertType.Error}
                title="Please complete the security check."
              />
            )}
            {turnstileErrorLoading && (
              <Alert
                type={AlertType.Error}
                title="The security check didn’t load. Refresh the page and try again."
              />
            )}
            {/* The funnel's primary action always sits inside the glass bar, so
                account details matches the seven steps behind it rather than
                ending on a bare button. Medium + flex-1 keeps the nested radii
                concentric; every other surface keeps the full-width Large. */}
            {!simplified ? (
              <AuthActionBar
                data-funnel-track={FunnelTargetId.StepCta}
                disabled={isCheckPending || isTurnstilePending}
                form="auth-form"
                loading={isVerifyingTurnstile}
                type="submit"
              >
                Sign up
              </AuthActionBar>
            ) : (
              <ConditionalWrapper
                condition={hasGlassBar}
                wrapper={(component) => (
                  <FunnelGlassBar>{component}</FunnelGlassBar>
                )}
              >
                <Button
                  className={hasGlassBar ? funnelGlassBarCta : 'w-full'}
                  data-funnel-track={FunnelTargetId.StepCta}
                  disabled={isCheckPending || isTurnstilePending}
                  form="auth-form"
                  loading={isVerifyingTurnstile}
                  size={hasGlassBar ? ButtonSize.Medium : ButtonSize.Large}
                  type="submit"
                  variant={ButtonVariant.Primary}
                >
                  {isStartups ? 'Continue' : 'Sign up'}
                </Button>
              </ConditionalWrapper>
            )}
            {isOnboardingFunnel && onExistingEmailLoginClick && (
              <MemberAlready
                onLogin={() => onExistingEmailLoginClick()}
                className={{
                  container:
                    'mt-7 justify-center text-text-tertiary typo-callout',
                  login: '!text-text-primary',
                }}
              />
            )}
          </ConditionalWrapper>
        </AuthForm>
      </div>
      {isStartups && (
        <SignupDisclaimer className="!text-left !text-text-tertiary" />
      )}
    </div>
  );
};

export default RegistrationForm;
