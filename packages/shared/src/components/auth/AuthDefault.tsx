import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import CloseIcon from '../icons/Close';
import MailIcon from '../icons/Mail';
import { ClickableText } from '../buttons/ClickableText';
import ArrowIcon from '../icons/Arrow';
import { ColumnContainer, providers } from './common';
import { RegistrationForm } from './RegistrationForm';
import OrDivider from './OrDivider';
import ProviderButton from './ProviderButton';

interface AuthDefaultProps {
  className?: string;
}

export const AuthDefault = ({ className }: AuthDefaultProps): ReactElement => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [email, setEmail] = useState('');
  const [shouldLogin, setShouldLogin] = useState(false);

  const onLogin = () => {};

  const onEmailCheck = () => {
    setShouldLogin(true);
    setShowRegistrationForm(true);
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
      {showRegistrationForm ? (
        <RegistrationForm email={email} />
      ) : (
        <ColumnContainer>
          {providers.map(({ provider, ...props }) => (
            <ProviderButton
              key={provider}
              provider={provider}
              label="Connect with"
              {...props}
            />
          ))}
          <OrDivider />
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-2">
            <TextField
              leftIcon={<MailIcon />}
              inputId="email"
              label="Email"
              type="email"
              actionButtonProps={{ type: 'submit' }}
              actionIcon={!shouldLogin && <ArrowIcon className="rotate-90" />}
              onInput={(e) => setEmail(e.currentTarget.value)}
              value={email}
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
      )}
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
