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
import { Card, CardLink } from './Card';
import { RaisedLabel, RaisedLabelType } from './RaisedLabel';
import { useFeedPreviewMode } from '../../../hooks';
import { TypeLabel } from './TypeLabel';
import ConditionalWrapper from '../../ConditionalWrapper';

interface FeedItemContainerProps {
  flagProps?: FlagProps;
  children: ReactNode;
  domProps: HTMLAttributes<HTMLDivElement>;
  linkProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
}

interface FlagProps extends Pick<Post, 'pinnedAt' | 'trending' | 'type'> {
  adAttribution?: ReactElement | string;
}

function FeedItemContainer(
  { flagProps, children, domProps, linkProps }: FeedItemContainerProps,
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
  const [focus, setFocus] = useState(false);

  return (
    <Card
      {...domProps}
      data-testid="postItem"
      ref={ref}
      className={classNames(domProps?.className, focus && 'bg-theme-float')}
    >
      {linkProps && (
        <ConditionalWrapper
          condition={!linkProps.href.startsWith('https://')}
          wrapper={(child) => <Link href={linkProps.href}>{child}</Link>}
        >
          <CardLink
            {...linkProps}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </ConditionalWrapper>
      )}
      <fieldset>
        {showTypeLabel && (
          <TypeLabel
            type={adAttribution ?? type}
            className={classNames(
              'absolute -top-2 left-2',
              focus && 'bg-theme-bg-secondary',
            )}
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
    </Card>
  );
}

export default forwardRef(FeedItemContainer);
