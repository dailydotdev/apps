import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import ArrowIcon from '../icons/Arrow';
import { CloseModalFunc } from '../modals/common';
import { Modal } from '../modals/common/Modal';
import { ModalHeaderKind } from '../modals/common/types';

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
    <Modal.Header
      className={className}
      kind={ModalHeaderKind.Secondary}
      title={title}
    >
      {onBack && (
        <Button
          icon={<ArrowIcon className="-rotate-90" />}
          className="mr-2 btn-tertiary"
          onClick={onBack}
        />
      )}
    </Modal.Header>
  );
}

export default AuthModalHeader;
