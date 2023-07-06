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
}

export function MemberAlready({
  className = {},
}: MemberAlreadyProps): ReactElement {
  const { showLogin } = useAuthContext();

  return (
    <span className={classNames('flex', className?.container)}>
      Already a member?
      <ClickableText
        className={classNames('ml-1.5 font-bold', className?.login)}
        onClick={() => showLogin(AuthTriggers.Onboarding, { isLogin: true })}
        inverseUnderline
      >
        Log in
      </ClickableText>
    </span>
  );
}
