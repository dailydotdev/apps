import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import React, { forwardRef, useState } from 'react';
import classNames from 'classnames';
import Link from '../../../utilities/Link';
import type { Post } from '../../../../graphql/posts';
import { ListCard, CardLink } from './ListCard';
import { RaisedLabel } from '../RaisedLabel';
import { getRaisedLabel } from '../FeedItemContainer';
import { useLiveChatRoomOf } from '../../../../features/liveChat/hooks/useLiveChatRooms';
import { useFeedPreviewMode, useBookmarkProvider } from '../../../../hooks';
import { TypeLabel } from './TypeLabel';
import { bookmarkProviderListBg } from '../../../../styles/custom';
import { BookmarkNoteStrip } from '../../../bookmark/BookmarkNoteStrip';

interface FeedItemContainerProps {
  flagProps?: FlagProps;
  children: ReactNode;
  domProps: HTMLAttributes<HTMLDivElement>;
  linkProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
  bookmarked?: boolean;
  // The user's own note on the bookmark, shown as the last row
  bookmarkNote?: string | null;
}

interface FlagProps
  extends Omit<Pick<Post, 'pinnedAt' | 'trending' | 'type'>, 'type'> {
  postId?: string;
  type?: Post['type'] | ReactElement | string;
  adAttribution?: ReactElement | string;
}

function FeedItemContainer(
  {
    flagProps,
    children,
    domProps,
    linkProps,
    bookmarked,
    bookmarkNote,
  }: FeedItemContainerProps,
  ref?: Ref<HTMLElement>,
): ReactElement {
  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked: bookmarked ?? false,
  });
  const { adAttribution, pinnedAt, trending, postId, type } = flagProps ?? {};
  const chatRoom = useLiveChatRoomOf(postId);
  const { type: raisedLabelType, description } = getRaisedLabel({
    pinnedAt,
    trending,
    chatRoom,
  });
  const isFeedPreview = useFeedPreviewMode();
  const showFlag = (!!pinnedAt || !!trending || !!chatRoom) && !isFeedPreview;
  const typeLabelValue = adAttribution ?? type;
  const showTypeLabel = !!typeLabelValue;
  const [focus, setFocus] = useState(false);

  return (
    <ListCard
      {...domProps}
      data-testid="postItem"
      data-feed-item
      ref={ref}
      className={classNames(
        domProps?.className,
        focus && 'bg-surface-float',
        highlightBookmarkedPost &&
          '!border-action-bookmark-active hover:!border-action-bookmark-default',
      )}
      style={{
        ...(highlightBookmarkedPost && { background: bookmarkProviderListBg }),
      }}
    >
      {linkProps?.href && (
        <Link href={linkProps.href}>
          <CardLink
            {...linkProps}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </Link>
      )}
      {(showTypeLabel || showFlag) && (
        <fieldset>
          {typeLabelValue && (
            <TypeLabel
              focus={focus}
              type={typeLabelValue}
              className="absolute left-3"
            />
          )}
          {showFlag && (
            <RaisedLabel
              type={raisedLabelType}
              description={description}
              listMode
              focus={focus}
            />
          )}
        </fieldset>
      )}
      {children}
      {!!bookmarkNote && (
        <BookmarkNoteStrip note={bookmarkNote} className="mt-3" />
      )}
    </ListCard>
  );
}

export default forwardRef(FeedItemContainer);
