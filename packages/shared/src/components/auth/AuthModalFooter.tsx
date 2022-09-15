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
      {isLogin ? 'Not yet a member?' : 'Already a member?'}
      <ClickableText
        className="ml-1 text-theme-label-primary"
        onClick={() => onIsLogin(!isLogin)}
      >
        {isLogin ? 'Register' : 'Log in'}
      </ClickableText>
    </div>
  );
}

export default AuthModalFooter;
