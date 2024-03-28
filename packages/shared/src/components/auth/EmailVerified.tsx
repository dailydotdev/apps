import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import EmailVerifiedIcon from '../../../icons/mail_verified.svg';
import AuthHeader from './AuthHeader';
import { AuthFormProps } from './common';

interface EmailVerifiedProps extends AuthFormProps {
  children?: ReactNode;
  hasUser: boolean;
}

function EmailVerified({
  hasUser,
  children,
  simplified,
}: EmailVerifiedProps): ReactElement {
  return (
    <>
      <AuthHeader
        simplified={simplified}
        title={hasUser ? 'Email address verified' : 'Log in to daily.dev'}
      />
      <EmailVerifiedIcon
        className={classNames(
          'w-full text-white',
          children ? 'h-44' : 'mt-12 h-60',
        )}
      />
      <p className="px-8 text-center text-text-secondary typo-body tablet:px-12">
        Your email address is now verified.
      </p>
      {children}
    </>
  );
}

export default EmailVerified;
