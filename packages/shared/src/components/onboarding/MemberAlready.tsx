import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ClickableText } from '../buttons/ClickableText';

interface ClassName {
  container?: string;
  login?: string;
}

interface MemberAlreadyProps {
  className?: ClassName;
  onLogin(): void;
}

export function MemberAlready({
  className = {},
  onLogin,
}: MemberAlreadyProps): ReactElement {
  return (
    <span className={classNames('flex', className?.container)}>
      Already a member?
      <ClickableText
        className={classNames('ml-1', className?.login)}
        onClick={onLogin}
        inverseUnderline
      >
        Log in
      </ClickableText>
    </span>
  );
}
