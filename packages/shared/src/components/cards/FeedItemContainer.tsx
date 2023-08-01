import React, { forwardRef, HTMLAttributes, ReactElement, Ref } from 'react';
import { Post } from '../../graphql/posts';
import { Card, ListCard } from './Card';
import { RaisedLabel, RaisedLabelType } from './RaisedLabel';
import ConditionalWrapper from '../ConditionalWrapper';
import styles from './RaisedLabel.module.css';

interface FlagProps extends Pick<Post, 'trending' | 'pinnedAt'> {
  listMode?: boolean;
}

interface FeedItemContainerProps extends HTMLAttributes<HTMLDivElement> {
  flagProps: FlagProps;
}

function FeedItemContainer(
  { flagProps, ...props }: FeedItemContainerProps,
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
      wrapper={(children) => (
        <div className={`relative ${styles.raiseLabelContainer}`}>
          {children}
          <RaisedLabel
            type={type}
            listMode={listMode}
            description={description}
          />
        </div>
      )}
    >
      <Component {...props} ref={ref} />
    </ConditionalWrapper>
  );
}

export default forwardRef(FeedItemContainer);
