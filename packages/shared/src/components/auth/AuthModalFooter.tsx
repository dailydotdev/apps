import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { ClickableText } from '../buttons/ClickableText';
import { Modal } from '../modals/common/Modal';
import { Justify } from '../utilities';
import ConditionalWrapper from '../ConditionalWrapper';

interface AuthModalFooterProps {
  className?: string;
  isLogin: boolean;
  onIsLogin: (value: boolean) => void;
  children?: ReactNode;
}

function AuthModalFooter({
  className,
  isLogin,
  onIsLogin,
  children,
}: AuthModalFooterProps): ReactElement {
  return (
    <Modal.Footer
      className={classNames(className, 'gap-unset')}
      justify={Justify.Center}
    >
      <ConditionalWrapper
        condition={!!children}
        wrapper={(component) => (
          <>
            {children}
            <span className="flex flex-row">{component}</span>
          </>
        )}
      >
        <Modal.Text>
          {isLogin ? 'Don’t have an account?' : 'Already have an account?'}
        </Modal.Text>
        <ClickableText
          className="ml-1 !text-theme-label-primary"
          onClick={() => onIsLogin(!isLogin)}
          inverseUnderline
        >
          {isLogin ? 'Sign up' : 'Log in'}
        </ClickableText>
      </ConditionalWrapper>
    </Modal.Footer>
  );
}

export default AuthModalFooter;
