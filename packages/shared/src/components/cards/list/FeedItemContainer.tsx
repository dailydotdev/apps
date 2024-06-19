import React, {
  AnchorHTMLAttributes,
  forwardRef,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
  useState,
} from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { Post } from '../../../graphql/posts';
import { ListCard, CardLink } from './ListCard';
import { RaisedLabel, RaisedLabelType } from './RaisedLabel';
import { useFeedPreviewMode } from '../../../hooks';
import { TypeLabel } from './TypeLabel';
import { bookmarkProviderListBg } from '../../../styles/custom';
import useBookmarkProvider from '../../../hooks/useBookmarkProvider';

interface FeedItemContainerProps {
  flagProps?: FlagProps;
  children: ReactNode;
  domProps: HTMLAttributes<HTMLDivElement>;
  linkProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
  bookmarked?: boolean;
}

interface FlagProps extends Pick<Post, 'pinnedAt' | 'trending' | 'type'> {
  adAttribution?: ReactElement | string;
}

function FeedItemContainer(
  {
    flagProps,
    children,
    domProps,
    linkProps,
    bookmarked,
  }: FeedItemContainerProps,
  ref?: Ref<HTMLElement>,
): ReactElement {
  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked,
  });
  const { adAttribution, pinnedAt, trending, type } = flagProps;
  const raisedLabelType = pinnedAt
    ? RaisedLabelType.Pinned
    : RaisedLabelType.Hot;
  const description =
    [RaisedLabelType.Hot].includes(raisedLabelType) && trending > 0
      ? `${trending} devs read it last hour`
      : undefined;
  const isFeedPreview = useFeedPreviewMode();
  const showFlag = (!!pinnedAt || !!trending) && !isFeedPreview && description;
  const showTypeLabel = !!adAttribution || !!type;
  const [focus, setFocus] = useState(false);

  return (
    <ListCard
      {...domProps}
      data-testid="postItem"
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
      {linkProps && (
        <Link href={linkProps.href}>
          <CardLink
            {...linkProps}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </Link>
      )}
      <fieldset>
        {showTypeLabel && (
          <TypeLabel
            focus={focus}
            type={adAttribution ?? type}
            className="absolute left-3"
          />
        )}
        {showFlag && (
          <RaisedLabel
            type={raisedLabelType}
            description={description}
            focus={focus}
          />
        )}
      </fieldset>
      {children}
    </ListCard>
  );
}

export default forwardRef(FeedItemContainer);
