import React, { ReactElement } from 'react';
import classNames from 'classnames';
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
    <Modal.Footer
      className={classNames(className, 'gap-unset')}
      justify={Justify.Center}
    >
      <Modal.Text>
        {isLogin ? 'Not a member yet?' : 'Already a daily.dev member?'}
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
