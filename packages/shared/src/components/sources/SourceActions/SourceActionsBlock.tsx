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
  const label = isBlocked ? 'Unblock' : 'Block';

  return (
    <Button
      aria-label={label}
      data-testid="blockButton"
      icon={<BlockIcon />}
      onClick={onClick}
      size={ButtonSize.Small}
      variant={ButtonVariant.Float}
    >
      {label}
    </Button>
  );
};

export default SourceActionsBlock;
