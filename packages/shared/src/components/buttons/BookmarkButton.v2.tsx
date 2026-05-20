import type { MouseEventHandler, ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import type { CardActionDensity } from './CardAction';
import { CardAction } from './CardAction';
import { BookmarkIcon } from '../icons';
import { BookmarkReminderIcon } from '../icons/Bookmark/Reminder';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useBookmarkReminder } from '../../hooks/notifications';
import type { ColorName } from '../../styles/colors';
import { ColorName as ButtonColor } from '../../styles/colors';
import type { TooltipProps } from '../tooltip/Tooltip';
import { Tooltip } from '../tooltip/Tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import type { MenuItemProps } from '../dropdown/common';

export interface BookmarkButtonProps {
  post: Post;
  density?: CardActionDensity;
  labelVisible?: boolean;
  label?: string;
  count?: number | null;
  color?: ColorName;
  pressed?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  buttonClassName?: string;
  id?: string;
  tooltipSide?: TooltipProps['side'];
}

export function BookmarkButton({
  post,
  density,
  labelVisible,
  label,
  count,
  color = ButtonColor.Bun,
  pressed,
  onClick,
  className,
  buttonClassName,
  id,
  tooltipSide,
}: BookmarkButtonProps): ReactElement {
  const isBookmarked = pressed ?? post.bookmarked;
  const hasReminder = !!post.bookmark?.remindAt;
  const { openModal } = useLazyModal();
  const { onRemoveReminder } = useBookmarkReminder({ post });

  const baseIcon = hasReminder ? <BookmarkReminderIcon /> : <BookmarkIcon />;
  const pressedIcon = hasReminder ? (
    <BookmarkReminderIcon secondary />
  ) : (
    <BookmarkIcon secondary />
  );

  const resolvedLabel =
    label ?? (isBookmarked ? 'Remove bookmark' : 'Bookmark');

  const cardAction = (
    <CardAction
      id={id}
      icon={baseIcon}
      iconPressed={pressedIcon}
      label={resolvedLabel}
      count={count}
      color={color}
      pressed={isBookmarked}
      density={density}
      labelVisible={labelVisible}
      className={className}
      buttonClassName={buttonClassName}
      onClick={onClick}
    />
  );

  if (!hasReminder) {
    return (
      <Tooltip
        content={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        side={tooltipSide}
      >
        {cardAction}
      </Tooltip>
    );
  }

  const dropdownOptions: MenuItemProps[] = [
    {
      label: 'Edit reminder',
      action: () =>
        openModal({ type: LazyModal.BookmarkReminder, props: { post } }),
    },
    {
      label: 'Remove reminder',
      action: () => onRemoveReminder(post.id),
    },
    {
      label: 'Remove bookmark',
      action: (...args: unknown[]) =>
        onClick?.(args[0] as React.MouseEvent<HTMLButtonElement>),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        tooltip={{
          content: isBookmarked ? 'Remove bookmark' : 'Bookmark',
        }}
      >
        <CardAction
          id={id}
          icon={baseIcon}
          iconPressed={pressedIcon}
          label={resolvedLabel}
          count={count}
          color={color}
          pressed={isBookmarked}
          density={density}
          labelVisible={labelVisible}
          className={className}
          buttonClassName={buttonClassName}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuOptions options={dropdownOptions} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
