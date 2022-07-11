import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { ClickableText } from '../buttons/ClickableText';

interface AuthModalFooterProps {
  className?: string;
  shouldLogin: boolean;
  onShouldLogin: (value: boolean) => void;
}

function AuthModalFooter({
  className,
  shouldLogin,
  onShouldLogin,
}: AuthModalFooterProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex justify-center py-3 border-t border-theme-divider-tertiary typo-callout text-theme-label-tertiary',
        className,
      )}
    >
      {shouldLogin ? 'Not yet a member?' : 'Already a member?'}
      <ClickableText
        className="ml-1 text-theme-label-primary"
        onClick={() => onShouldLogin(!shouldLogin)}
      >
        {shouldLogin ? 'Register' : 'Login'}
      </ClickableText>
    </div>
  );
}

export default AuthModalFooter;
