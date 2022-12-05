import React, { ReactElement } from 'react';
import { ClickableText } from '../buttons/ClickableText';
import { Modal } from '../modals/common/Modal';
import { Justify } from '../utilities';

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
    <Modal.Footer className={className} justify={Justify.Center}>
      <Modal.Text>
        {isLogin ? 'Don’t have an account?' : 'Already have an account?'}
      </Modal.Text>
      <ClickableText
        className="ml-1 underline text-theme-label-primary"
        onClick={() => onIsLogin(!isLogin)}
      >
        {isLogin ? 'Sign up' : 'Log in'}
      </ClickableText>
    </Modal.Footer>
  );
}

export default AuthModalFooter;
