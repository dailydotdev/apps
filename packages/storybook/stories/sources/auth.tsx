import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import OrDivider from '@dailydotdev/shared/src/components/auth/OrDivider';
import SignupDisclaimer from '@dailydotdev/shared/src/components/auth/SignupDisclaimer';
import {
  AppleIcon,
  ArrowIcon,
  FacebookIcon,
  GitHubIcon,
  GoogleIcon,
  LockIcon,
  MailIcon,
  MiniCloseIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { useSources } from './kit';

// Production's AuthModal as a signed-out Follow, Join or Log in opens it:
// full screen on phones, a 420px card 40rem tall from tablet up. Sign up
// leads with the four providers, "or", the email field and the terms;
// Log in with email and password. The footer flips between them. The
// phone-only context line names the trigger, as authContextLines does.

export interface AuthPrompt {
  view: 'signup' | 'login';
  /** authContextLines: shown on phones, on the sign-up view only. */
  line?: string;
}

export const authLines = {
  joinSquad: 'Sign up to join this Squad.',
  follow: 'Sign up to follow and get their posts in your feed.',
  mainButton: 'Sign up to get a feed built for you.',
};

const providers = [
  {
    label: 'Google',
    icon: <GoogleIcon className="socialIcon" secondary />,
  },
  { label: 'GitHub', icon: <GitHubIcon className="socialIcon" /> },
  { label: 'Apple', icon: <AppleIcon className="socialIcon" secondary /> },
  {
    label: 'Facebook',
    icon: <FacebookIcon className="socialIcon" secondary />,
  },
];

export const AuthPromptHost = (): ReactElement | null => {
  const { authPrompt, dismissAuthPrompt, openAuth, goTo } = useSources();
  if (!authPrompt) {
    return null;
  }
  const isLogin = authPrompt.view === 'login';
  const title = isLogin ? 'Log in' : 'Sign up';
  const leave = () => {
    dismissAuthPrompt();
    goTo('/onboarding');
  };

  return (
    <div
      role="presentation"
      onClick={(event) =>
        event.target === event.currentTarget && dismissAuthPrompt()
      }
      className="fixed inset-0 z-modal flex flex-col items-center bg-overlay-quaternary-onion tablet:justify-center"
    >
      <div
        role="dialog"
        aria-label="Login Modal"
        className="relative flex h-full w-full max-w-full flex-col items-center border-border-subtlest-secondary bg-background-default shadow-2 tablet:h-[40rem] tablet:max-h-[calc(100vh-5rem)] tablet:w-[26.25rem] tablet:rounded-16 tablet:border tablet:bg-accent-pepper-subtlest"
      >
        <div className="z-1 flex h-full w-full max-w-[26.25rem] flex-col overflow-y-auto rounded-16 bg-accent-pepper-subtlest">
          <header className="relative flex h-14 w-full items-center border-b border-border-subtlest-tertiary px-4 py-4 tablet:px-6">
            <Button
              type="button"
              aria-label="Close"
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              icon={<MiniCloseIcon />}
              className="mr-2 flex tablet:hidden"
              onClick={dismissAuthPrompt}
            />
            <h3 className="font-bold typo-body">{title}</h3>
            <CloseButton
              size={ButtonSize.Small}
              className="absolute right-2 z-1 !hidden tablet:!flex"
              onClick={dismissAuthPrompt}
            />
          </header>
          {!isLogin && authPrompt.line && (
            <p className="px-6 pt-3 text-center text-text-secondary typo-callout tablet:hidden">
              {authPrompt.line}
            </p>
          )}
          <div className="mt-6 flex w-full flex-col gap-3 self-center px-6 tablet:px-[3.75rem]">
            {isLogin ? (
              <form
                className="flex flex-col gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  leave();
                }}
              >
                <TextField
                  inputId="auth-login-email"
                  label="Email"
                  name="email"
                  type="email"
                  leftIcon={<MailIcon size={IconSize.Small} />}
                />
                <TextField
                  inputId="auth-login-password"
                  label="Password"
                  name="password"
                  type="password"
                  leftIcon={<LockIcon size={IconSize.Small} />}
                />
                <button
                  type="button"
                  onClick={leave}
                  className="self-start text-text-secondary underline typo-callout"
                >
                  Forgot password?
                </button>
                <Button
                  type="submit"
                  size={ButtonSize.Large}
                  variant={ButtonVariant.Primary}
                >
                  Log in
                </Button>
              </form>
            ) : (
              <>
                <div
                  aria-label="Social login buttons"
                  role="list"
                  className="flex flex-col gap-4"
                >
                  {providers.map(({ label, icon }) => (
                    <Button
                      key={label}
                      type="button"
                      aria-label={`Continue with ${label}`}
                      icon={icon}
                      size={ButtonSize.Large}
                      variant={ButtonVariant.Primary}
                      onClick={leave}
                    >
                      Continue with {label}
                    </Button>
                  ))}
                </div>
                <OrDivider />
                <form
                  aria-label="Signup using email"
                  className="flex flex-col gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    leave();
                  }}
                >
                  <TextField
                    inputId="auth-signup-email"
                    label="Email"
                    name="email"
                    type="email"
                    leftIcon={<MailIcon size={IconSize.Small} />}
                    actionButton={
                      <Button
                        type="submit"
                        aria-label="Submit and sign me up, accepting terms and conditions"
                        size={ButtonSize.Small}
                        variant={ButtonVariant.Primary}
                        icon={<ArrowIcon className="rotate-90" />}
                      />
                    }
                  />
                  <SignupDisclaimer />
                </form>
              </>
            )}
          </div>
          <div className="flex flex-1" />
          <footer className="mt-4 flex h-16 w-full items-center justify-center border-t border-border-subtlest-tertiary p-3">
            <span className="text-text-tertiary typo-callout">
              {isLogin ? 'Not a member yet?' : 'Already using daily.dev?'}
            </span>
            <button
              type="button"
              className="ml-1 text-text-primary underline typo-callout hover:no-underline"
              onClick={() => openAuth({ view: isLogin ? 'signup' : 'login' })}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};
