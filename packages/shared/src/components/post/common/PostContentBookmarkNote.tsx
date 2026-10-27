import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { PostContentWidget } from './PostContentWidget';
import type { Post } from '../../../graphql/posts';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { EditIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { Typography, TypographyType } from '../../typography/Typography';
import { usePostPaneContext } from '../PostPane';

interface PostContentBookmarkNoteProps {
  post: Post;
  className?: string;
}

/** The reader's own note on this bookmark, with a way to change it. */
export function PostContentBookmarkNote({
  post,
  className,
}: PostContentBookmarkNoteProps): ReactElement | null {
  const { openModal } = useLazyModal();
  const { hasSheet } = usePostPaneContext();
  const note = post.bookmark?.note;

  if (!note || !post.bookmarked || hasSheet) {
    return null;
  }

  return (
    <PostContentWidget
      className={classNames('mt-6 w-full', className)}
      icon={<EditIcon size={IconSize.Small} aria-hidden />}
      title="Your note"
    >
      <Typography
        type={TypographyType.Callout}
        className="min-w-0 flex-1 whitespace-pre-line break-words"
      >
        {note}
      </Typography>
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        className="laptop:ml-auto"
        onClick={() =>
          openModal({ type: LazyModal.BookmarkNote, props: { post } })
        }
      >
        Edit note
      </Button>
    </PostContentWidget>
  );
}
