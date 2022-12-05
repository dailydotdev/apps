import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import EmailVerifiedIcon from '../../../icons/mail_verified.svg';
import AuthModalHeader from './AuthModalHeader';

interface EmailVerifiedProps {
  children?: ReactNode;
  hasUser: boolean;
}

function EmailVerified({
  hasUser,
  children,
}: EmailVerifiedProps): ReactElement {
  return (
    <>
      <AuthModalHeader
        title={hasUser ? 'Email address verified' : 'Log in to daily.dev'}
      />
      <EmailVerifiedIcon
        className={classNames('w-full', children ? 'h-44' : 'h-60 mt-12')}
      />
      <p className="px-8 tablet:px-12 text-center typo-body text-theme-label-secondary">
        Your email address is now verified.
      </p>
      {children}
    </>
  );
}

export default EmailVerified;
