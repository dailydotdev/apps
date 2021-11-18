import React, { ReactElement, useEffect } from 'react';
import classNames from 'classnames';
import DailyDevLogo from '../../svg/DailyDevLogo';
import { StyledModal, ModalProps } from './StyledModal';
import { ModalCloseButton } from './ModalCloseButton';
import LoginButtons from '../LoginButtons';
import { LoginModalMode } from '../../types/LoginModalMode';
import styles from './LoginModal.module.css';
import { logSignupStart } from '../../lib/analytics';

export type LoginModalProps = {
  mode: LoginModalMode;
  trigger: string;
} & ModalProps;

export default function LoginModal({
  trigger,
  mode = LoginModalMode.Default,
  className,
  onRequestClose,
  children,
  ...props
}: LoginModalProps): ReactElement {
  useEffect(() => {
    if (props.isOpen) {
      logSignupStart(trigger);
    }
  }, [props.isOpen]);

  return (
    <StyledModal
      {...props}
      onRequestClose={onRequestClose}
      className={classNames(styles.loginModal, className)}
    >
      <ModalCloseButton onClick={onRequestClose} />
      <DailyDevLogo />
      <div className="mt-6 mb-8 text-center text-theme-label-secondary typo-callout">
        {mode === LoginModalMode.ContentQuality
          ? `Our community cares about content quality. We require social authentication to prevent abuse.`
          : `Unlock useful features by signing in. A bunch of cool stuff like content filters and bookmarks are waiting just for you.`}
      </div>
      <LoginButtons />
      {children}
    </StyledModal>
  );
}
