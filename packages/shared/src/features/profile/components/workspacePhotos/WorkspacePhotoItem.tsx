import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { UserWorkspacePhoto } from '../../../../graphql/user/userWorkspacePhoto';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { TrashIcon } from '../../../../components/icons';

interface WorkspacePhotoItemProps {
  photo: UserWorkspacePhoto;
  isOwner: boolean;
  onDelete?: (photo: UserWorkspacePhoto) => void;
  onClick?: (photo: UserWorkspacePhoto) => void;
}

export function WorkspacePhotoItem({
  photo,
  isOwner,
  onDelete,
  onClick,
}: WorkspacePhotoItemProps): ReactElement {
  return (
    <div
      className={classNames(
        'group relative aspect-square overflow-hidden rounded-16',
        'bg-surface-float',
        'transition-all duration-200',
      )}
    >
      <button
        type="button"
        className="size-full"
        onClick={onClick ? () => onClick(photo) : undefined}
        aria-label="View workspace photo"
      >
        <img
          src={photo.image}
          alt="Workspace"
          className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </button>
      {isOwner && onDelete && (
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.XSmall}
            icon={<TrashIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(photo);
            }}
            aria-label="Delete photo"
            className="bg-overlay-float-pepper"
          />
        </div>
      )}
    </div>
  );
}
