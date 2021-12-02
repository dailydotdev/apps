import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { StyledModal, ModalProps } from './StyledModal';
import { useHideOnModal } from '../../hooks/useHideOnModal';
import {
  useResetScrollForResponsiveModal,
  responsiveModalBreakpoint as breakpoint,
} from '../../hooks/useResetScrollForResponsiveModal';
import styles from './ResponsiveModal.module.css';

export const responsiveModalBreakpoint = breakpoint;

export function ResponsiveModal({
  className,
  padding = true,
  ...props
}: ModalProps): ReactElement {
  useResetScrollForResponsiveModal();
  useHideOnModal(props.isOpen);

  return (
    <StyledModal
      {...props}
      className={classNames(
        className,
        styles.responsiveModal,
        padding && styles.addPadding,
      )}
    />
  );
}
