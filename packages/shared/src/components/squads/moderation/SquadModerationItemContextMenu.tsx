import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { MenuItemProps } from '../../fields/ContextMenu';
import { EditIcon, MenuIcon, TrashIcon } from '../../icons';
import { usePrompt } from '../../../hooks/usePrompt';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import type { SourcePostModeration } from '../../../graphql/squads';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../dropdown/DropdownMenu';
import { Button } from '../../buttons/Button';

interface SquadModerationItemContextMenuProps
  extends Pick<SourcePostModeration, 'id'> {
  onDelete: (id: string) => void;
}

export const SquadModerationItemContextMenu = ({
  id,
  onDelete,
}: SquadModerationItemContextMenuProps): ReactElement => {
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

  const options: MenuItemProps[] = [
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
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={ButtonVariant.Tertiary}
          className="z-1 my-0"
          icon={<MenuIcon />}
          size={ButtonSize.Small}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuOptions options={options} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
