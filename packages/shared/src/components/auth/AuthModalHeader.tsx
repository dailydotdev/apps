import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import ArrowIcon from '../icons/Arrow';
import { CloseModalFunc } from '../modals/common';
import { ModalCloseButton } from '../modals/ModalCloseButton';

export interface AuthModalHeaderProps {
  title: string;
  className?: string;
  onBack?: CloseModalFunc;
  onClose?: CloseModalFunc;
}

function AuthModalHeader({
  title,
  className,
  onBack,
  onClose,
}: AuthModalHeaderProps): ReactElement {
  return (
    <header
      className={classNames(
        'flex relative flex-row items-center w-full border-b border-theme-divider-tertiary',
        onBack ? 'p-2' : 'py-4 px-6',
        className,
      )}
    >
      {onBack && (
        <Button
          icon={<ArrowIcon className="-rotate-90" />}
          className="mr-2 btn-tertiary"
          onClick={onBack}
        />
      )}
      <h3 className="font-bold typo-body">{title}</h3>
      {onClose && <ModalCloseButton onClick={onClose} />}
    </header>
  );
}

export default AuthModalHeader;
