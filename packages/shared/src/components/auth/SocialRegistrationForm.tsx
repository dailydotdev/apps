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
  AuthTriggersType,
  SocialRegistrationParameters,
} from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { Button } from '../buttons/Button';
import ImageInput from '../fields/ImageInput';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import { UserIcon } from '../icons';
import AuthHeader from './AuthHeader';
import { AuthFormProps, providerMap } from './common';
import LockIcon from '../icons/Lock';
import AtIcon from '../icons/At';
import AuthContext from '../../contexts/AuthContext';
import { ProfileFormHint } from '../../hooks/useProfileForm';
import { Checkbox } from '../fields/Checkbox';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import AuthForm from './AuthForm';
import TwitterIcon from '../icons/Twitter';
import { Modal } from '../modals/common/Modal';
import { IconSize } from '../Icon';
import { useGenerateUsername } from '../../hooks';
import AuthContainer from './AuthContainer';
import ConditionalWrapper from '../ConditionalWrapper';
import { SignBackProvider, useSignBack } from '../../hooks/auth/useSignBack';

export interface SocialRegistrationFormProps extends AuthFormProps {
  className?: string;
  provider?: string;
  formRef?: MutableRefObject<HTMLFormElement>;
  title?: string;
  trigger: AuthTriggersType;
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
  title = 'Sign up',
  hints,
  trigger,
  onUpdateHints,
  onSignup,
  isLoading,
  simplified,
}: SocialRegistrationFormProps): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { user } = useContext(AuthContext);
  const [nameHint, setNameHint] = useState<string>(null);
  const [usernameHint, setUsernameHint] = useState<string>(null);
  const [twitterHint, setTwitterHint] = useState<string>(null);
  const [name, setName] = useState(user?.name);
  const isAuthorOnboarding = trigger === AuthTriggers.Author;
  const { username, setUsername } = useGenerateUsername(name);
  const { onUpdateSignBack } = useSignBack();

  useEffect(() => {
    trackEvent({
      event_name: AuthEventNames.StartSignUpForm,
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    onUpdateSignBack(
      { name: values.name, email: user.email, image: user.image },
      provider as SignBackProvider,
    );
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

    return <MailIcon size={IconSize.Small} />;
  };

  if (!user?.email) {
    return <></>;
  }

  return (
    <>
      <AuthHeader simplified={simplified} title={title} />
      <AuthForm
        className={classNames(
          'gap-2 self-center place-items-center mt-6 w-full overflow-y-auto flex-1 pb-2 px-6 tablet:px-[3.75rem]',
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
          leftIcon={<UserIcon size={IconSize.Small} />}
          name="name"
          inputId="name"
          label="Full name"
          value={name}
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
        <TextField
          saveHintSpace
          className={{ container: 'w-full' }}
          leftIcon={<AtIcon size={IconSize.Small} secondary />}
          name="username"
          inputId="username"
          label="Enter a username"
          value={username}
          minLength={1}
          valid={!usernameHint && !hints?.username}
          hint={hints?.username || usernameHint}
          onBlur={(e) => setUsername(e.target.value)}
          valueChanged={() =>
            hints?.[username] && onUpdateHints({ ...hints, username: '' })
          }
        />
        {isAuthorOnboarding && (
          <TextField
            saveHintSpace
            className={{ container: 'w-full' }}
            leftIcon={<TwitterIcon />}
            name="twitter"
            inputId="twitter"
            label="X"
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
      <ConditionalWrapper
        condition={simplified}
        wrapper={(component) => (
          <AuthContainer className="!mt-0">{component}</AuthContainer>
        )}
      >
        <Modal.Footer>
          <Button
            form="auth-form"
            type="submit"
            className="w-full btn-primary"
            disabled={isLoading}
          >
            Sign up
          </Button>
        </Modal.Footer>
      </ConditionalWrapper>
    </>
  );
};
