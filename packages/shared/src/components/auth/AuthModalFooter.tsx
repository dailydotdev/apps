import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { ClickableText } from '../buttons/ClickableText';

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
    <div
      className={classNames(
        'flex justify-center py-3 border-t border-theme-divider-tertiary typo-callout text-theme-label-tertiary',
        className,
      )}
    >
      {isLogin ? 'Don’t have an account?' : 'Already have an account?'}
      <ClickableText
        className="ml-1 underline text-theme-label-primary"
        onClick={() => onIsLogin(!isLogin)}
      >
        {isLogin ? 'Sign up' : 'Log in'}
      </ClickableText>
    </div>
  );
}

export default AuthModalFooter;
