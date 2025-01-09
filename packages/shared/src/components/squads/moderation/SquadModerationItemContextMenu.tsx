import type { ReactElement } from 'react';
import React, { useId } from 'react';
import { useRouter } from 'next/router';
import OptionsButton from '../../buttons/OptionsButton';
import ContextMenu from '../../fields/ContextMenu';
import { EditIcon, TrashIcon } from '../../icons';
import useContextMenu from '../../../hooks/useContextMenu';
import { usePrompt } from '../../../hooks/usePrompt';
import { ButtonSize } from '../../buttons/common';
import type { SourcePostModeration } from '../../../graphql/squads';

interface SquadModerationItemContextMenuProps
  extends Pick<SourcePostModeration, 'id'> {
  onDelete: (id: string) => void;
}

export const SquadModerationItemContextMenu = ({
  id,
  onDelete,
}: SquadModerationItemContextMenuProps): ReactElement => {
  const contextMenuId = useId();
  const { isOpen, onMenuClick } = useContextMenu({ id: contextMenuId });
  const { showPrompt } = usePrompt();
  const router = useRouter();

  const handleDelete = async () => {
    const confirm = await showPrompt({
      title: 'Delete post',
      description: 'Are you sure you want to delete this post?',
    });

    if (confirm) {
      onDelete(id);
    }
  };

  return (
    <>
      <OptionsButton
        onClick={onMenuClick}
        className="z-1 !my-0"
        tooltipPlacement="right"
        size={ButtonSize.Medium}
      />
      <ContextMenu
        options={[
          {
            label: 'Edit post',
            action: () => router.push(`/posts/${id}/edit?moderation=true`),
            icon: <EditIcon aria-hidden />,
          },
          {
            label: 'Delete post',
            action: handleDelete,
            icon: <TrashIcon aria-hidden />,
          },
        ]}
        id={contextMenuId}
        isOpen={isOpen}
      />
    </>
  );
};
