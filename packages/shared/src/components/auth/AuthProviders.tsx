import React, { CSSProperties, ReactElement } from 'react';
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
  return (
    <div className={classNames(className, 'flex flex-col w-full')}>
      <header className="flex flex-row justify-between items-center py-4 px-6 border-b border-theme-divider-tertiary">
        <h3>Sign up to daily.dev</h3>
        <Button icon={<CloseIcon />} buttonSize="small" />
      </header>
      <div className="grid grid-cols-1 gap-4 self-center px-12 mx-3 mt-6 w-full">
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
        <TextField
          leftIcon={<MailIcon />}
          inputId="email"
          label="Email"
          type="email"
        />
        <p className="text-center text-theme-label-quaternary typo-caption1">
          By signing in I accept the Terms of Service and the Privacy Policy.
        </p>
      </div>
      <div className="flex justify-center py-3 mt-auto border-t border-theme-divider-tertiary typo-callout text-theme-label-tertiary">
        Already a member?
        <ClickableText className="ml-1 text-theme-label-primary">
          Login
        </ClickableText>
      </div>
    </div>
  );
};
