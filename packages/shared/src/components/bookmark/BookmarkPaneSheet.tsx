import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../graphql/posts';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { BookmarkIcon, EditIcon } from '../icons';
import { IconSize } from '../Icon';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { DevPlusIcon } from '../icons/DevPlus';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import type { BookmarkAction } from './useBookmarkActions';
import { useBookmarkActions } from './useBookmarkActions';

interface BookmarkPaneSheetProps {
  post: Post;
  onRemove: () => Promise<unknown>;
}

const IconAction = ({
  action: { label, Icon, active, action },
  className,
}: {
  action: BookmarkAction;
  className?: string;
}): ReactElement => (
  <SimpleTooltip content={label}>
    <Button
      type="button"
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      icon={<Icon secondary={active} />}
      aria-label={label}
      pressed={active}
      onClick={action}
      className={className}
    />
  </SimpleTooltip>
);

/**
 * Docked above the post in the pane: the reader's note and the bookmark's
 * own actions, so finishing a read, filing it or jotting something down
 * never means going back to the list.
 */
export function BookmarkPaneSheet({
  post,
  onRemove,
}: BookmarkPaneSheetProps): ReactElement {
  const actions = useBookmarkActions({ post });
  const { isPlus } = usePlusSubscription();
  const note = post.bookmark?.note;

  return (
    <div
      role="region"
      aria-label="Bookmark"
      className="z-1 flex shrink-0 flex-col gap-2 border-b border-border-subtlest-tertiary bg-background-default px-4 py-3 tablet:flex-row tablet:items-center tablet:gap-3"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {note ? (
          <>
            <EditIcon
              size={IconSize.Small}
              className="shrink-0 text-action-plus-default"
              aria-hidden
            />
            <p
              className="line-clamp-2 min-w-0 flex-1 break-words text-text-primary typo-callout"
              title={note}
            >
              {note}
            </p>
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              onClick={actions.note.action}
              className="shrink-0"
            >
              Edit
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<EditIcon />}
            onClick={actions.note.action}
            className={classNames(!isPlus && 'pr-2')}
          >
            Add a note
            {!isPlus && (
              <DevPlusIcon
                size={IconSize.XSmall}
                className="ml-1 text-action-plus-default"
                aria-hidden
              />
            )}
          </Button>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<actions.read.Icon secondary={actions.read.active} />}
          pressed={actions.read.active}
          onClick={actions.read.action}
        >
          {actions.read.label}
        </Button>
        <IconAction action={actions.archive} />
        <IconAction action={actions.reminder} />
        <IconAction action={actions.folder} />
        <SimpleTooltip content="Remove bookmark">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={
              <BookmarkIcon secondary className="text-accent-bun-default" />
            }
            aria-label="Remove bookmark"
            onClick={onRemove}
          />
        </SimpleTooltip>
      </div>
    </div>
  );
}
