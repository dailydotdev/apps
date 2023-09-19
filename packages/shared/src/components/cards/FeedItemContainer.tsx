import React, {
  forwardRef,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import { Post } from '../../graphql/posts';
import { Card, ListCard } from './Card';
import {
  RaisedLabel,
  RaisedLabelContainer,
  RaisedLabelType,
} from './RaisedLabel';
import ConditionalWrapper from '../ConditionalWrapper';

interface FlagProps extends Pick<Post, 'trending' | 'pinnedAt'> {
  listMode?: boolean;
}

interface FeedItemContainerProps {
  flagProps: FlagProps;
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

  return (
    <ConditionalWrapper
      condition={!!pinnedAt || !!trending}
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
      <Component {...domProps} data-testid="postItem" ref={ref}>
        {children}
      </Component>
    </ConditionalWrapper>
  );
}

export default forwardRef(FeedItemContainer);
