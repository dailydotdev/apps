import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { UserStack } from '../../../../graphql/user/userStack';
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
import { EditIcon, PlusIcon, TrashIcon } from '../../../../components/icons';
import { formatMonthYearOnly } from '../../../../lib/dateFormat';

interface UserStackItemProps {
  item: UserStack;
  isOwner: boolean;
  onEdit?: (item: UserStack) => void;
  onDelete?: (item: UserStack) => void;
}

export function UserStackItem({
  item,
  isOwner,
  onEdit,
  onDelete,
}: UserStackItemProps): ReactElement {
  const { tool, startedAt } = item;
  const title = item.title ?? tool.title;

  const usingSince = startedAt
    ? `Since ${formatMonthYearOnly(new Date(startedAt))}`
    : null;

  return (
    <div
      className={classNames(
        'group relative flex items-center justify-between gap-3 rounded-12 border border-border-subtlest-tertiary px-3 pb-2.5 pt-2',
        'hover:border-border-subtlest-secondary',
      )}
    >
      <div className="flex items-center gap-2">
        {tool.faviconUrl ? (
          <img
            src={tool.faviconUrl}
            alt=""
            className="rounded size-6 flex-shrink-0"
          />
        ) : (
          <PlusIcon className="size-6 flex-shrink-0 text-text-tertiary" />
        )}
        {!!title && (
          <div className="flex min-w-0 flex-1 flex-col">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              bold
              truncate
            >
              {title}
            </Typography>
            {!!usingSince && (
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {usingSince}
              </Typography>
            )}
          </div>
        )}
      </div>
      {isOwner && (
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<EditIcon />}
              onClick={() => onEdit(item)}
              aria-label="Edit stack item"
            />
          )}
          {onDelete && (
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<TrashIcon />}
              onClick={() => onDelete(item)}
              aria-label="Delete stack item"
            />
          )}
        </div>
      )}
    </div>
  );
}
