import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import ArrowIcon from '../icons/Arrow';
import { ModalCloseButton } from '../modals/ModalCloseButton';

interface AuthModalHeaderProps {
  title: string;
  onBack?: () => unknown;
  onClose?: () => unknown;
}

function AuthModalHeader({
  title,
  onBack,
  onClose,
}: AuthModalHeaderProps): ReactElement {
  return (
    <header className="flex flex-row p-2 w-full">
      {onBack && (
        <Button icon={<ArrowIcon />} className="mr-2" onClick={onBack} />
      )}
      <h3 className="font-bold typo-body">{title}</h3>
      {onClose && <ModalCloseButton onClick={onClose} />}
    </header>
  );
}

export default AuthModalHeader;
