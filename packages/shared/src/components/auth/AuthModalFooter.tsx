import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { ClickableText } from '../buttons/ClickableText';
import { AuthModalFooterWrapper } from './common';

interface AuthModalFooterProps {
  className?: string;
  isLogin: boolean;
  onIsLogin: (value: boolean) => void;
}

function AuthModalFooter({
  className,
  isLogin,
  onIsLogin,
}: AuthModalFooterProps): ReactElement {
  return (
    <AuthModalFooterWrapper className={className}>
      {isLogin ? 'Don’t have an account?' : 'Already have an account?'}
      <ClickableText
        className="ml-1 underline text-theme-label-primary"
        onClick={() => onIsLogin(!isLogin)}
      >
        {isLogin ? 'Sign up' : 'Log in'}
      </ClickableText>
    </AuthModalFooterWrapper>
  );
}

export default AuthModalFooter;
