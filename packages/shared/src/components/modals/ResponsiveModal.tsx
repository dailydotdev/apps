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

interface ResponsiveModalProps extends ModalProps {
  noPadding?: boolean;
}

export function ResponsiveModal({
  className,
  noPadding,
  ...props
}: ResponsiveModalProps): ReactElement {
  useResetScrollForResponsiveModal();
  useHideOnModal(props.isOpen);

  return (
    <StyledModal
      {...props}
      className={classNames(
        className,
        styles.responsiveModal,
        noPadding && styles.noPadding,
      )}
    />
  );
}
