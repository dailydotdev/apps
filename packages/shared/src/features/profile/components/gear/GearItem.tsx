import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Gear } from '../../../../graphql/user/gear';
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
import { TrashIcon } from '../../../../components/icons';

interface GearItemProps {
  item: Gear;
  isOwner: boolean;
  onDelete?: (item: Gear) => void;
}

export function GearItem({
  item,
  isOwner,
  onDelete,
}: GearItemProps): ReactElement {
  const { gear } = item;

  return (
    <div
      className={classNames(
        'group relative flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary p-3',
        'hover:border-border-subtlest-secondary',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
          truncate
        >
          {gear.name}
        </Typography>
      </div>
      {isOwner && onDelete && (
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            icon={<TrashIcon />}
            onClick={() => onDelete(item)}
            aria-label="Delete gear"
          />
        </div>
      )}
    </div>
  );
}

interface SortableGearItemProps extends GearItemProps {
  isDraggable?: boolean;
}

export function SortableGearItem({
  item,
  isDraggable = true,
  ...props
}: SortableGearItemProps): ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames(
        'relative touch-none',
        isDragging && 'z-10 opacity-70',
        isDraggable && 'cursor-grab active:cursor-grabbing',
      )}
      {...attributes}
      {...listeners}
    >
      <GearItem item={item} {...props} />
    </div>
  );
}
