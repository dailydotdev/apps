import React, { ReactElement, useId } from 'react';
import { SourcePostModeration } from '../../../graphql/posts';
import OptionsButton from '../../buttons/OptionsButton';
import ContextMenu from '../../fields/ContextMenu';
import { TrashIcon } from '../../icons';
import useContextMenu from '../../../hooks/useContextMenu';
import { usePrompt } from '../../../hooks/usePrompt';

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
  const { showPrompt, prompt } = usePrompt();

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
      />
      <ContextMenu
        options={[
          // {
          //   label: 'Edit post',
          //   action: () => console.log('Edit'), // todo: implement after SourcePostModeration edit page is created
          //   icon: <EditIcon aria-hidden />,
          // },
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
