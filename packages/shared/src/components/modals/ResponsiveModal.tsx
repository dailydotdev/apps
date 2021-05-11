import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { StyledModal, ModalProps } from './StyledModal';
import { mobileL } from '../../styles/media';
import { useHideOnModal } from '../../hooks/useHideOnModal';
import { useResetScrollForResponsiveModal } from '../../hooks/useResetScrollForResponsiveModal';
import styles from './ResponsiveModal.module.css';

export const responsiveModalBreakpoint = mobileL;

export function ResponsiveModal({
  className,
  ...props
}: ModalProps): ReactElement {
  useResetScrollForResponsiveModal();
  useHideOnModal(props.isOpen);
  return (
    <StyledModal
      {...props}
      className={classNames(className, styles.responsiveModal)}
    />
  );
}
