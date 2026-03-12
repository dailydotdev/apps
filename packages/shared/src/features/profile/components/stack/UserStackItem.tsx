import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import {
  EditIcon,
  MenuIcon,
  PlusIcon,
  TrashIcon,
} from '../../../../components/icons';
import { formatMonthYearOnly } from '../../../../lib/dateFormat';
import { Tooltip } from '../../../../components/tooltip/Tooltip';
import { useToolTopSquads } from '../../hooks/useToolTopSquads';
import { UserStackTopSquadsTooltip } from './UserStackTopSquadsTooltip';

interface UserStackItemProps {
  item: UserStack;
  isOwner: boolean;
  isDraggable?: boolean;
  onEdit?: (item: UserStack) => void;
  onDelete?: (item: UserStack) => void;
}

export function UserStackItem({
  item,
  isOwner,
  isDraggable = false,
  onEdit,
  onDelete,
}: UserStackItemProps): ReactElement {
  const [shouldFetchTooltipData, setShouldFetchTooltipData] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: !isDraggable,
    data: {
      type: 'stack-item',
      section: item.section,
    },
  });
  const { tool, startedAt } = item;
  const title = item.title ?? tool.title;
  const { topSquads, isPending, isError } = useToolTopSquads({
    toolId: tool.id,
    enabled: shouldFetchTooltipData,
  });

  const usingSince = startedAt
    ? `Since ${formatMonthYearOnly(new Date(startedAt))}`
    : null;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Tooltip
      content={
        <UserStackTopSquadsTooltip
          toolTitle={title}
          toolFaviconUrl={tool.faviconUrl}
          topSquads={topSquads}
          isPending={isPending}
          hasError={isError}
        />
      }
      side="top"
      align="start"
      sideOffset={8}
      collisionPadding={12}
      className="!max-w-none !rounded-14 !border !border-border-subtlest-secondary !bg-background-popover !p-0 !text-text-primary !shadow-2 [&>.TooltipArrow]:!fill-background-popover"
    >
      <div
        ref={setNodeRef}
        style={style}
        className={classNames(
          'group relative flex touch-none items-center justify-between gap-3 rounded-12 border border-border-subtlest-tertiary px-3 pb-2.5 pt-2',
          'hover:border-border-subtlest-secondary',
          isDragging && 'z-10 opacity-70',
        )}
        onMouseEnter={() => setShouldFetchTooltipData(true)}
        onFocusCapture={() => setShouldFetchTooltipData(true)}
      >
        <div className="flex items-center gap-2">
          {isOwner && isDraggable && (
            <Button
              ref={setActivatorNodeRef}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<MenuIcon className="rotate-90 text-text-tertiary" />}
              aria-label={`Drag ${title}`}
              className="cursor-grab opacity-0 active:cursor-grabbing group-hover:opacity-100"
              {...attributes}
              {...listeners}
            />
          )}
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
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                aria-label="Edit stack item"
              />
            )}
            {onDelete && (
              <Button
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.XSmall}
                icon={<TrashIcon />}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
                aria-label="Delete stack item"
              />
            )}
          </div>
        )}
      </div>
    </Tooltip>
  );
}
