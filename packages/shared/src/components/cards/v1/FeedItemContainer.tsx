import React, {
  forwardRef,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import { Post } from '../../../graphql/posts';
import { Card } from './Card';
import { RaisedLabel, RaisedLabelType } from './RaisedLabel';
import { useFeedPreviewMode } from '../../../hooks';
import { TypeLabel } from './TypeLabel';

interface FeedItemContainerProps {
  flagProps?: FlagProps;
  children: ReactNode;
  domProps: HTMLAttributes<HTMLDivElement>;
  link?: ReactElement;
}

interface FlagProps extends Pick<Post, 'pinnedAt' | 'trending' | 'type'> {
  adAttribution?: ReactElement | string;
}

function FeedItemContainer(
  { flagProps, children, domProps, link }: FeedItemContainerProps,
  ref?: Ref<HTMLElement>,
): ReactElement {
  const { adAttribution, pinnedAt, trending, type } = flagProps;

  const raisedLabelType = pinnedAt
    ? RaisedLabelType.Pinned
    : RaisedLabelType.Hot;
  const description =
    raisedLabelType === RaisedLabelType.Hot && trending > 0
      ? `${trending} devs read it last hour`
      : undefined;
  const isFeedPreview = useFeedPreviewMode();
  const showFlag = (!!pinnedAt || !!trending) && !isFeedPreview && description;
  const showTypeLabel = !!adAttribution || !!type;

  return (
    <Card
      {...domProps}
      data-testid="postItem"
      ref={ref}
      className={domProps?.className}
    >
      {link}
      <fieldset>
        {showTypeLabel && (
          <TypeLabel
            type={adAttribution ?? type}
            className="absolute -top-2 left-2"
          />
        )}
        {showFlag && (
          <RaisedLabel type={raisedLabelType} description={description} />
        )}
      </fieldset>
      {children}
    </Card>
  );
}

export default forwardRef(FeedItemContainer);
