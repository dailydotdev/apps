import React, { ReactElement } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { BlockIcon } from '../../icons';
import { useFeature } from '../../GrowthBookProvider';
import { feature } from '../../../lib/featureManagement';

interface SourceActionBlockProps {
  isBlocked: boolean;
  onClick: () => void;
}

const SourceActionsBlock = ({
  isBlocked,
  onClick,
}: SourceActionBlockProps): ReactElement => {
  const isNotifyExperiment = useFeature(feature.sourceNotifyButton);
  const unblockLabel = isNotifyExperiment ? 'Unblock' : 'Follow';

  return (
    <Button
      aria-label={isBlocked ? unblockLabel : 'Block'}
      data-testid="blockButton"
      icon={<BlockIcon />}
      onClick={onClick}
      size={ButtonSize.Small}
      variant={ButtonVariant.Float}
    >
      {isBlocked ? unblockLabel : 'Block'}
    </Button>
  );
};

export default SourceActionsBlock;
