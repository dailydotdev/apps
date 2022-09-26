import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import EmailVerifiedIcon from '../../../icons/mail_verified.svg';
import { CloseAuthModalFunc } from '../../hooks/useAuthForms';
import AuthModalHeader from './AuthModalHeader';

interface EmailVerifiedProps {
  children?: ReactNode;
  hasUser: boolean;
  onClose?: CloseAuthModalFunc;
}

function EmailVerified({
  hasUser,
  children,
  onClose,
}: EmailVerifiedProps): ReactElement {
  return (
    <>
      <AuthModalHeader
        title={hasUser ? 'Email address verified' : 'Log in to daily.dev'}
        onClose={onClose}
      />
      <EmailVerifiedIcon
        className={classNames('w-full', children ? 'h-44' : 'h-60 mt-12')}
      />
      <p className="px-8 tablet:px-12 text-center typo-body text-theme-label-secondary">
        Your email address is now verified. Please log in with your new email
        address and password.
      </p>
      {children}
    </>
  );
}

export default EmailVerified;
