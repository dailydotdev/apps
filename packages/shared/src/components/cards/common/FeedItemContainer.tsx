import type { HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { Card } from './Card';
import {
  RaisedLabel,
  RaisedLabelContainer,
  RaisedLabelType,
} from './RaisedLabel';
import ConditionalWrapper from '../../ConditionalWrapper';
import { useBookmarkProvider, useFeedPreviewMode } from '../../../hooks';
import { getTrendingDescription } from './getTrendingDescription';
import { BookmarkNoteStrip } from '../../bookmark/BookmarkNoteStrip';

export interface FlagProps extends Pick<Post, 'trending' | 'pinnedAt'> {
  listMode?: boolean;
}

interface FeedItemContainerProps {
  flagProps?: FlagProps;
  children: ReactNode;
  domProps: HTMLAttributes<HTMLDivElement>;
  bookmarked?: boolean;
  // The user's own note on the bookmark, laid over the bottom of the cover so
  // the fixed-height card keeps its size
  bookmarkNote?: string | null;
}

function FeedItemContainer(
  {
    flagProps = {},
    children,
    domProps,
    bookmarked,
    bookmarkNote,
  }: FeedItemContainerProps,
  ref?: Ref<HTMLElement>,
): ReactElement {
  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked: bookmarked ?? false,
  });
  const { listMode, pinnedAt, trending } = flagProps;
  const type = pinnedAt ? RaisedLabelType.Pinned : RaisedLabelType.Hot;
  const description =
    type === RaisedLabelType.Hot ? getTrendingDescription(trending) : undefined;
  const isFeedPreview = useFeedPreviewMode();

  return (
    <ConditionalWrapper
      condition={(!!pinnedAt || !!trending) && !isFeedPreview}
      wrapper={(component) => (
        <RaisedLabelContainer>
          {component}
          <RaisedLabel
            type={type}
            listMode={listMode}
            description={description}
          />
        </RaisedLabelContainer>
      )}
    >
      <Card
        {...domProps}
        data-testid="postItem"
        ref={ref}
        className={classNames(
          domProps.className,
          !listMode && isFeedPreview && 'hover:border-border-subtlest-tertiary',
          highlightBookmarkedPost &&
            '!border-action-bookmark-active !bg-action-bookmark-float hover:!border-action-bookmark-default',
        )}
      >
        {children}
        {!!bookmarkNote && (
          <BookmarkNoteStrip
            note={bookmarkNote}
            className="absolute inset-x-2 bottom-12 z-1 bg-background-subtle"
          />
        )}
      </Card>
    </ConditionalWrapper>
  );
}

export default forwardRef(FeedItemContainer);
