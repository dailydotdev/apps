import React, { ReactElement, ReactNode } from 'react';
import ReactModal, { Props } from 'react-modal';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import modalStyles from './Modal.module.css';
import responsiveModalStyles from './ResponsiveModal.module.css';

type Size = 'xsmall' | 'small' | 'medium' | 'large';

export enum ModalVariant {
  ResponsiveCenter = 'responsive-center',
  ResponsiveTop = 'responsive-top',
  FixedCenter = 'fixed-center',
}

interface BasicModalProps extends Props {
  padding?: boolean;
  contentClassName?: string;
  children?: ReactNode;
}

const BasicModal = ({
  className,
  overlayClassName,
  contentClassName,
  ...props
}: BasicModalProps): ReactElement => {
  return (
    <ReactModal
      portalClassName={className.toString()}
      overlayClassName={classNames('overlay', overlayClassName)}
      className={classNames('focus:outline-none modal', contentClassName)}
      {...props}
    />
  );
};

const StyledModal = classed(BasicModal, modalStyles.modal);

const ResponsiveModal = classed(
  StyledModal,
  responsiveModalStyles.responsiveModal,
);

interface ModalProps extends BasicModalProps {
  variant?: ModalVariant;
  size?: Size;
}

const Modal = ({
  variant = ModalVariant.ResponsiveCenter,
  size,
  ...props
}: ModalProps): ReactElement => {
  switch (variant) {
    case ModalVariant.ResponsiveCenter:
      return <ResponsiveModal {...props} />;
    case ModalVariant.ResponsiveTop:
      return <ResponsiveModal {...props} />;
    case ModalVariant.FixedCenter:
      return <StyledModal {...props} />;
    default:
      return <StyledModal {...props} />;
  }
};

export default Modal;
