import React, {
  forwardRef,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import { Post } from '../../graphql/posts';
import { Card, ListCard } from './Card';
import { RaisedLabel, RaisedLabelProps, RaisedLabelType } from './RaisedLabel';
import ConditionalWrapper from '../ConditionalWrapper';
import styles from './Card.module.css';

interface FlagProps extends Pick<Post, 'trending' | 'pinnedAt'> {
  listMode?: boolean;
}

const getFlaggedContainer = (
  children: ReactNode,
  props: Partial<RaisedLabelProps> = {},
): ReactElement => (
  <div className={`relative ${styles.cardContainer}`}>
    {children}
    <RaisedLabel type={RaisedLabelType.Pinned} {...props} />
  </div>
);

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
      wrapper={(children) =>
        getFlaggedContainer(children, { listMode, type, description })
      }
    >
      <Component {...props} ref={ref} />
    </ConditionalWrapper>
  );
}

export default forwardRef(FeedItemContainer);
