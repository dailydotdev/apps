import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { PlusIcon } from '../../../components/icons';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import type { Squad } from '../../../graphql/sources';
import { useWatercoolerPosting } from '../hooks/useWatercoolerPosting';

interface WatercoolerPostButtonProps {
  squad: Squad;
  className?: string;
}

export const WatercoolerPostButton = ({
  squad,
  className,
}: WatercoolerPostButtonProps): ReactElement => {
  const { canPost, blockedReason, isJoining, onNewPost } =
    useWatercoolerPosting({ squad });

  return (
    <Tooltip content={blockedReason} visible={!!blockedReason}>
      <Button
        className={className}
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        icon={<PlusIcon />}
        // `inactive` rather than `disabled`: a disabled button swallows the
        // pointer events the tooltip needs to explain why it is blocked.
        inactive={!canPost}
        loading={isJoining}
        onClick={onNewPost}
      >
        New post
      </Button>
    </Tooltip>
  );
};
