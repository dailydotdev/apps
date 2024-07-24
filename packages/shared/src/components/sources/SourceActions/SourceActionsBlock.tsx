import React, { ReactElement } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { BlockIcon, PlusIcon } from '../../icons';

interface SourceActionBlockProps {
  isBlocked: boolean;
  onClick: () => void;
}

const SourceActionsBlock = ({
  isBlocked,
  onClick,
}: SourceActionBlockProps): ReactElement => {
  return (
    <Button
      aria-label={isBlocked ? 'Follow' : 'Block'}
      data-testid="blockButton"
      icon={isBlocked ? <PlusIcon /> : <BlockIcon />}
      onClick={onClick}
      size={ButtonSize.Small}
      variant={ButtonVariant.Float}
    >
      {isBlocked ? 'Follow' : 'Block'}
    </Button>
  );
};

export default SourceActionsBlock;
