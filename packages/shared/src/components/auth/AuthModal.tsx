import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { StyledModal, ModalProps } from '../modals/StyledModal';
import styles from '../modals/LoginModal.module.css';
import { AuthDefault } from '../auth/AuthDefault';
import { Button } from '../buttons/Button';
import CloseIcon from '../icons/Close';
import { RegistrationForm } from '../auth/RegistrationForm';
import { ClickableText } from '../buttons/ClickableText';
import LoginForm from '../auth/LoginForm';
import EmailSignupForm from '../auth/EmailSignupForm';
import OrDivider from '../auth/OrDivider';

export type AuthModalProps = ModalProps;

export default function AuthModal({
  className,
  onRequestClose,
  children,
  ...props
}: AuthModalProps): ReactElement {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [email, setEmail] = useState('');
  const [shouldLogin, setShouldLogin] = useState(false);

  const onLogin = () => {};

  const onEmailCheck = () => {
    setShowRegistrationForm(true);
  };

  const onEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    return onEmailCheck();
  };
  return (
    <StyledModal
      {...props}
      onRequestClose={onRequestClose}
      className={classNames(styles.loginModal, className)}
      style={{
        content: {
          padding: 0,
          maxHeight: '40rem',
          height: '100%',
          width: '100%',
          maxWidth: '1020px',
          alignItems: 'flex-end',
          backgroundImage: `url('./auth_bg.png')`,
          objectFit: 'cover',
          overflow: 'hidden',
        },
      }}
    >
      <div className="flex flex-col w-full overflow-y-auto h-full rounded-16 max-w-[25.75rem] bg-theme-bg-tertiary">
        <header className="flex flex-row justify-between items-center py-4 px-6 border-b border-theme-divider-tertiary">
          <h3>Sign up to daily.dev</h3>
          <Button icon={<CloseIcon />} buttonSize="small" />
        </header>
        {showRegistrationForm ? (
          <RegistrationForm email={email} />
        ) : (
          <AuthDefault>
            <OrDivider />
            {shouldLogin ? (
              <LoginForm onSubmit={onLogin} />
            ) : (
              <EmailSignupForm onSubmit={onEmailSignup} />
            )}
          </AuthDefault>
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
    </StyledModal>
  );
}
