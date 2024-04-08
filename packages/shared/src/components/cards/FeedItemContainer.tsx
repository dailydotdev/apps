import React, {
  forwardRef,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import classNames from 'classnames';
import { Post } from '../../graphql/posts';
import { Card, ListCard } from './Card';
import {
  RaisedLabel,
  RaisedLabelContainer,
  RaisedLabelType,
} from './RaisedLabel';
import ConditionalWrapper from '../ConditionalWrapper';
import { useFeedPreviewMode } from '../../hooks';

export interface FlagProps extends Pick<Post, 'trending' | 'pinnedAt'> {
  listMode?: boolean;
}

interface FeedItemContainerProps {
  flagProps?: FlagProps;
  children: ReactNode;
  domProps: HTMLAttributes<HTMLDivElement>;
}

function FeedItemContainer(
  { flagProps, children, domProps }: FeedItemContainerProps,
  ref?: Ref<HTMLElement>,
): ReactElement {
  const { listMode, pinnedAt, trending } = flagProps;
  const Component = listMode ? ListCard : Card;
  const type = pinnedAt ? RaisedLabelType.Pinned : RaisedLabelType.Hot;
  const description =
    type === RaisedLabelType.Hot
      ? `${trending} devs read it last hour`
      : undefined;
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
      <Component
        {...domProps}
        data-testid="postItem"
        ref={ref}
        className={classNames(
          domProps.className,
          !listMode && isFeedPreview && 'hover:border-border-subtlest-tertiary',
        )}
      >
        {children}
      </Component>
    </ConditionalWrapper>
  );
}

export default forwardRef(FeedItemContainer);
