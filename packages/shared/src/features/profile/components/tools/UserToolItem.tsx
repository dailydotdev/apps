import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { UserTool } from '../../../../graphql/user/userTool';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { EditIcon, TrashIcon } from '../../../../components/icons';

interface UserToolItemProps {
  item: UserTool;
  isOwner: boolean;
  onEdit?: (item: UserTool) => void;
  onDelete?: (item: UserTool) => void;
}

export function UserToolItem({
  item,
  isOwner,
  onEdit,
  onDelete,
}: UserToolItemProps): ReactElement {
  const { tool } = item;

  return (
    <div
      className={classNames(
        'group relative flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary p-3',
        'hover:border-border-subtlest-secondary',
      )}
    >
      {tool.faviconUrl && (
        <img
          src={tool.faviconUrl}
          alt=""
          className="rounded size-6 flex-shrink-0"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
          truncate
        >
          {tool.title}
        </Typography>
      </div>
      {isOwner && (
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<EditIcon />}
              onClick={() => onEdit(item)}
              aria-label="Edit tool"
            />
          )}
          {onDelete && (
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<TrashIcon />}
              onClick={() => onDelete(item)}
              aria-label="Delete tool"
            />
          )}
        </div>
      )}
    </div>
  );
}
