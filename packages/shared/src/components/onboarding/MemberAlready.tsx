import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ClickableText } from '../buttons/ClickableText';
import { AuthTriggers } from '../../lib/auth';
import { useAuthContext } from '../../contexts/AuthContext';

interface ClassName {
  container?: string;
  login?: string;
}

interface MemberAlreadyProps {
  className?: ClassName;
  onLogin?(): void;
}

export function MemberAlready({
  className = {},
  onLogin,
}: MemberAlreadyProps): ReactElement {
  const { showLogin } = useAuthContext();
  const onClick =
    onLogin ?? (() => showLogin(AuthTriggers.Onboarding, { isLogin: true }));

  return (
    <span className={classNames('flex', className?.container)}>
      Already a member?
      <ClickableText
        className={classNames('ml-1.5 font-bold', className?.login)}
        onClick={onClick}
        inverseUnderline
      >
        Log in
      </ClickableText>
    </span>
  );
}
