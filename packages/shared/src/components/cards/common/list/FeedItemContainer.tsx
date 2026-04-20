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
import { RaisedLabel, RaisedLabelType } from '../RaisedLabel';
import { useFeedPreviewMode, useBookmarkProvider } from '../../../../hooks';
import { TypeLabel } from './TypeLabel';
import { bookmarkProviderListBg } from '../../../../styles/custom';

interface FeedItemContainerProps {
  flagProps?: FlagProps;
  children: ReactNode;
  domProps: HTMLAttributes<HTMLDivElement>;
  linkProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
  bookmarked?: boolean;
}

interface FlagProps
  extends Omit<Pick<Post, 'pinnedAt' | 'trending' | 'type'>, 'type'> {
  type?: Post['type'] | ReactElement | string;
  adAttribution?: ReactElement | string;
  highlighted?: boolean;
}

const getListRaisedLabelType = ({
  pinnedAt,
  highlighted,
}: Pick<FlagProps, 'pinnedAt' | 'highlighted'>): RaisedLabelType => {
  if (pinnedAt) {
    return RaisedLabelType.Pinned;
  }
  if (highlighted) {
    return RaisedLabelType.Highlight;
  }
  return RaisedLabelType.Hot;
};

const getListRaisedLabelDescription = ({
  type,
  trending,
}: {
  type: RaisedLabelType;
  trending?: number;
}): string | undefined => {
  if (type === RaisedLabelType.Hot && trending && trending > 0) {
    return `${trending} devs read it last hour`;
  }
  if (type === RaisedLabelType.Highlight) {
    return 'Featured in Happening Now';
  }
  return undefined;
};

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
    bookmarked: bookmarked ?? false,
  });
  const { adAttribution, pinnedAt, trending, type, highlighted } =
    flagProps ?? {};
  const raisedLabelType = getListRaisedLabelType({ pinnedAt, highlighted });
  const description = getListRaisedLabelDescription({
    type: raisedLabelType,
    trending,
  });
  const isFeedPreview = useFeedPreviewMode();
  const showFlag =
    (!!pinnedAt || !!highlighted || !!trending) && !isFeedPreview;
  const typeLabelValue = adAttribution ?? type;
  const showTypeLabel = !!typeLabelValue;
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
    </ListCard>
  );
}

export default forwardRef(FeedItemContainer);
