import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import ArrowIcon from '../icons/Arrow';
import { CloseModalFunc } from '../modals/common';
import { Modal } from '../modals/common/Modal';

export interface AuthModalHeaderProps {
  title: string;
  className?: string;
  onBack?: CloseModalFunc;
}

function AuthModalHeader({
  title,
  className,
  onBack,
}: AuthModalHeaderProps): ReactElement {
  return (
    <Modal.Header className={className}>
      {onBack && (
        <Button
          icon={<ArrowIcon className="-rotate-90" />}
          className="mr-2 btn-tertiary"
          onClick={onBack}
        />
      )}
      <Modal.Header.Title>{title}</Modal.Header.Title>
    </Modal.Header>
  );
}

export default AuthModalHeader;
