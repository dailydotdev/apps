import type { ReactElement } from 'react';
import React from 'react';
import { ButtonV2, ButtonSize, ButtonVariant } from '../../buttons/ButtonV2';
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
    <ButtonV2
      aria-label={label}
      data-testid="blockButton"
      icon={<BlockIcon />}
      onClick={onClick}
      size={ButtonSize.Small}
      variant={ButtonVariant.Float}
    >
      {label}
    </ButtonV2>
  );
};

export default SourceActionsBlock;
