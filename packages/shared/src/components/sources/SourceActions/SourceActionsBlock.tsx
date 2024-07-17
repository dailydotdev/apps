import React, { ReactElement } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { BlockIcon } from '../../icons';

interface SourceActionBlockProps {
  isBlocking: boolean;
  onClick: () => void;
}

const SourceActionsBlock = ({
  isBlocking,
  onClick,
}: SourceActionBlockProps): ReactElement => {
  return (
    <Button
      aria-label={isBlocking ? 'Follow' : 'Block'}
      icon={<BlockIcon />}
      onClick={onClick}
      size={ButtonSize.Small}
      variant={ButtonVariant.Float}
    >
      Block
    </Button>
  );
};

export default SourceActionsBlock;
