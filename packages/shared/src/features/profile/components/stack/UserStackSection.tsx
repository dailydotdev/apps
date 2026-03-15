import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useDroppable } from '@dnd-kit/core';
import {
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import type { UserStack } from '../../../../graphql/user/userStack';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { Pill, PillSize } from '../../../../components/Pill';
import { SortableUserStackItem, UserStackItem } from './UserStackItem';
import { getSectionContainerId } from './dnd';

interface UserStackSectionProps {
  section: string;
  items: UserStack[];
  isOwner: boolean;
  onEdit?: (item: UserStack) => void;
  onDelete?: (item: UserStack) => void;
}

export function UserStackSection({
  section,
  items,
  isOwner,
  onEdit,
  onDelete,
}: UserStackSectionProps): ReactElement {
  const { isOver, setNodeRef } = useDroppable({
    id: getSectionContainerId(section),
    data: {
      type: 'section',
      section,
    },
    disabled: !isOwner,
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          bold
        >
          {section}
        </Typography>
        <Pill
          label={String(items.length)}
          size={PillSize.Small}
          className="border border-border-subtlest-tertiary text-text-quaternary"
        />
      </div>
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={classNames(
            'flex min-h-16 flex-wrap gap-2 rounded-16 transition-colors',
            isOwner && 'p-2',
            isOwner &&
              items.length === 0 &&
              'border border-dashed border-border-subtlest-tertiary',
            isOwner && isOver && 'bg-surface-secondary',
          )}
        >
          {items.map((item) =>
            isOwner ? (
              <SortableUserStackItem
                key={item.id}
                item={item}
                isOwner={isOwner}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ) : (
              <UserStackItem
                key={item.id}
                item={item}
                isOwner={isOwner}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ),
          )}
          {isOwner && items.length === 0 && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="self-center px-2 py-3"
            >
              Drop items here
            </Typography>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
