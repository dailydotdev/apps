import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import DailyDevLogo from '../../svg/DailyDevLogo';
import { StyledModal, ModalProps } from './StyledModal';
import { ModalCloseButton } from './ModalCloseButton';
import LoginButtons from '../LoginButtons';
import styles from './LoginModal.module.css';
import { useTrackModal } from '../../hooks/useTrackModal';
import FeaturesContext from '../../contexts/FeaturesContext';
import { Features, getFeatureValue } from '../../lib/featureManagement';

export type LoginModalProps = {
  trigger: string;
} & ModalProps;

export default function LoginModal({
  trigger,
  className,
  onRequestClose,
  children,
  ...props
}: LoginModalProps): ReactElement {
  const { flags } = useContext(FeaturesContext);
  const loginModalDescriptionCopy = getFeatureValue(
    Features.LoginModalDescriptionCopy,
    flags,
  );
  useTrackModal({ isOpen: props.isOpen, title: 'signup', trigger });

  return (
    <StyledModal
      {...props}
      onRequestClose={onRequestClose}
      className={classNames(styles.loginModal, className)}
    >
      <ModalCloseButton onClick={onRequestClose} />
      <DailyDevLogo />
      <div className="mt-6 mb-8 text-center text-theme-label-secondary typo-callout">
        {loginModalDescriptionCopy}
      </div>
      <LoginButtons />
      {children}
    </StyledModal>
  );
}
