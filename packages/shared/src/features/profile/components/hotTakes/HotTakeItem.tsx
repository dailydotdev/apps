import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { UserHotTake } from '../../../../graphql/user/userHotTake';
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

interface HotTakeItemProps {
  item: UserHotTake;
  isOwner: boolean;
  onEdit?: (item: UserHotTake) => void;
  onDelete?: (item: UserHotTake) => void;
}

export function HotTakeItem({
  item,
  isOwner,
  onEdit,
  onDelete,
}: HotTakeItemProps): ReactElement {
  const { emoji, title, subtitle } = item;

  return (
    <div
      className={classNames(
        'group relative flex items-start gap-4 rounded-16 p-4',
        'bg-surface-float',
        'transition-all duration-200',
        'hover:bg-surface-hover',
      )}
    >
      <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-14 bg-overlay-quaternary-cabbage">
        <span className="text-2xl">{emoji}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          &ldquo;{title}&rdquo;
        </Typography>
        {subtitle && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {subtitle}
          </Typography>
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
              aria-label="Edit hot take"
            />
          )}
          {onDelete && (
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<TrashIcon />}
              onClick={() => onDelete(item)}
              aria-label="Delete hot take"
            />
          )}
        </div>
      )}
    </div>
  );
}
