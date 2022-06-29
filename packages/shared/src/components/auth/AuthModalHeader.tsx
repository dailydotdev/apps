import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import ArrowIcon from '../icons/Arrow';
import { ModalCloseButton } from '../modals/ModalCloseButton';

interface AuthModalHeaderProps {
  title: string;
  className?: string;
  onBack?: () => unknown;
  onClose?: (e: React.MouseEvent | React.KeyboardEvent) => unknown;
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
        'flex flex-row items-center p-2 w-full border-b border-theme-divider-tertiary',
        className,
      )}
    >
      {onBack && (
        <Button icon={<ArrowIcon />} className="mr-2" onClick={onBack} />
      )}
      <h3 className="font-bold typo-body">{title}</h3>
      {onClose && <ModalCloseButton onClick={onClose} />}
    </header>
  );
}

export default AuthModalHeader;
