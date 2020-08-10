import React, { ReactElement } from 'react';
import Modal from 'react-modal';

export function ReactModalAdapter({
  className,
  ...props
}: Modal.Props): ReactElement {
  return (
    <Modal
      portalClassName={className.toString()}
      overlayClassName="Overlay"
      className="Modal"
      {...props}
    />
  );
}
