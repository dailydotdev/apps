import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { UserHotTake } from '../../../../graphql/user/userHotTake';
import {
  Typography,
  TypographyType,
  TypographyColor,
  TypographyTag,
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
        'group relative flex items-start gap-3 rounded-12 border border-border-subtlest-tertiary p-3',
        'hover:border-border-subtlest-secondary',
      )}
    >
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Title2}
        className="flex-shrink-0"
      >
        {emoji}
      </Typography>
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            type={TypographyType.Caption1}
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
