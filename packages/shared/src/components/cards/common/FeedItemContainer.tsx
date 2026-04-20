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

export interface FlagProps extends Pick<Post, 'trending' | 'pinnedAt'> {
  listMode?: boolean;
  highlighted?: boolean;
}

interface FeedItemContainerProps {
  flagProps?: FlagProps;
  children: ReactNode;
  domProps: HTMLAttributes<HTMLDivElement>;
  bookmarked?: boolean;
}

const getRaisedLabelType = ({
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

const getRaisedLabelDescription = ({
  type,
  trending,
}: {
  type: RaisedLabelType;
  trending?: number;
}): string | undefined => {
  if (type === RaisedLabelType.Hot) {
    return `${trending} devs read it last hour`;
  }
  if (type === RaisedLabelType.Highlight) {
    return 'Featured in Happening Now';
  }
  return undefined;
};

function FeedItemContainer(
  { flagProps = {}, children, domProps, bookmarked }: FeedItemContainerProps,
  ref?: Ref<HTMLElement>,
): ReactElement {
  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked: bookmarked ?? false,
  });
  const { listMode, pinnedAt, trending, highlighted } = flagProps;
  const type = getRaisedLabelType({ pinnedAt, highlighted });
  const description = getRaisedLabelDescription({ type, trending });
  const isFeedPreview = useFeedPreviewMode();

  return (
    <ConditionalWrapper
      condition={(!!pinnedAt || !!highlighted || !!trending) && !isFeedPreview}
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
      </Card>
    </ConditionalWrapper>
  );
}

export default forwardRef(FeedItemContainer);
