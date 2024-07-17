import React, { ReactElement } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { BlockIcon } from '../../icons';

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
      icon={<BlockIcon />}
      onClick={onClick}
      size={ButtonSize.Small}
      variant={ButtonVariant.Float}
    >
      {isBlocked ? 'Unblock' : 'Block'}
    </Button>
  );
};

export default SourceActionsBlock;
