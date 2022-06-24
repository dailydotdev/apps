import React, { CSSProperties, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { Button, IconType } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import CloseIcon from '../icons/Close';
import MailIcon from '../icons/Mail';
import TwitterIcon from '../../../icons/twitter.svg';
import FacebookIcon from '../../../icons/facebook.svg';
import GoogleIcon from '../../../icons/google_color.svg';
import GitHubIcon from '../../../icons/github.svg';
import AppleIcon from '../../../icons/apple.svg';
import { ClickableText } from '../buttons/ClickableText';
import ArrowIcon from '../icons/Arrow';
import { ColumnContainer } from './common';

interface AuthProvidersProps {
  className?: string;
}

interface Provider {
  icon: IconType;
  title: string;
  action?: unknown;
  className?: string;
  style?: CSSProperties;
}

const providers: Provider[] = [
  {
    icon: <TwitterIcon />,
    title: 'Twitter',
    style: { backgroundColor: '#1D9BF0' },
  },
  {
    icon: <FacebookIcon />,
    title: 'Facebook',
    style: { backgroundColor: '#4363B6' },
  },
  {
    icon: <GoogleIcon />,
    title: 'Google',
    style: { backgroundColor: '#FFFFFF', color: '#0E1217' },
  },
  {
    icon: <GitHubIcon />,
    title: 'GitHub',
    style: { backgroundColor: '#2D313A' },
  },
  {
    icon: <AppleIcon />,
    title: 'Apple',
    style: { backgroundColor: '#0E1217' },
  },
];

export const AuthProviders = ({
  className,
}: AuthProvidersProps): ReactElement => {
  const [shouldLogin, setShouldLogin] = useState(false);

  const onLogin = () => {};

  const onEmailCheck = () => {
    setShouldLogin(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shouldLogin) {
      return onEmailCheck();
    }

    return onLogin();
  };

  return (
    <div className={classNames(className, 'flex flex-col w-full')}>
      <header className="flex flex-row justify-between items-center py-4 px-6 border-b border-theme-divider-tertiary">
        <h3>Sign up to daily.dev</h3>
        <Button icon={<CloseIcon />} buttonSize="small" />
      </header>
      <ColumnContainer>
        {providers.map(({ icon, title, style }) => (
          <Button
            key={title}
            icon={icon}
            className="btn-secondary"
            style={{
              justifyContent: 'flex-start',
              color: '#FFFFFF',
              border: 0,
              fontWeight: 'normal',
              ...style,
            }}
          >
            Connect with {title}
          </Button>
        ))}
        <div className="flex relative justify-center mt-3 w-full">
          <span className="absolute top-1/2 z-0 w-full h-px bg-theme-divider-tertiary" />
          <div className="z-1 px-3 bg-theme-bg-tertiary">or</div>
        </div>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-2">
          <TextField
            leftIcon={<MailIcon />}
            inputId="email"
            label="Email"
            type="email"
            actionButtonProps={{ type: 'submit' }}
            actionIcon={!shouldLogin && <ArrowIcon className="rotate-90" />}
          />
          <p className="ml-2 text-theme-label-quaternary typo-caption1">
            Enter your password to login
          </p>
          <TextField
            leftIcon={<MailIcon />}
            inputId="password"
            label="Password"
            type="password"
          />
          <span className="flex flex-row mt-5 w-full">
            <ClickableText className="flex-1 btn-primary">
              Forgot password?
            </ClickableText>
            <Button
              className="flex-1 btn-primary bg-theme-color-cabbage text-theme-label-primary"
              type="submit"
            >
              Login
            </Button>
          </span>
        </form>
        <p className="text-center text-theme-label-quaternary typo-caption1">
          By signing in I accept the Terms of Service and the Privacy Policy.
        </p>
      </ColumnContainer>
      <div className="flex justify-center py-3 mt-6 border-t border-theme-divider-tertiary typo-callout text-theme-label-tertiary">
        {shouldLogin ? 'Not yet a member?' : 'Already a member?'}
        <ClickableText
          className="ml-1 text-theme-label-primary"
          onClick={() => setShouldLogin(!shouldLogin)}
        >
          {shouldLogin ? 'Register' : 'Login'}
        </ClickableText>
      </div>
    </div>
  );
};
