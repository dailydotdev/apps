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
import { useFeature } from '../../GrowthBookProvider';
import { featureCardUiColors } from '../../../lib/featureManagement';
import style from './Card.module.css';

export interface FlagProps extends Pick<Post, 'trending' | 'pinnedAt'> {
  listMode?: boolean;
}

interface FeedItemContainerProps {
  flagProps?: FlagProps;
  children: ReactNode;
  domProps: HTMLAttributes<HTMLDivElement>;
  bookmarked?: boolean;
}

function FeedItemContainer(
  { flagProps = {}, children, domProps, bookmarked }: FeedItemContainerProps,
  ref?: Ref<HTMLElement>,
): ReactElement {
  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked,
  });
  const { listMode, pinnedAt, trending } = flagProps;
  const type = pinnedAt ? RaisedLabelType.Pinned : RaisedLabelType.Hot;
  const description =
    type === RaisedLabelType.Hot
      ? `${trending} devs read it last hour`
      : undefined;
  const isFeedPreview = useFeedPreviewMode();
  const colorExp = useFeature(featureCardUiColors);

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
      <Card
        {...domProps}
        data-testid="postItem"
        ref={ref}
        className={classNames(
          // todo: remove colorExperiment from ./Card.module.css class when cleaning the experiment
          colorExp && `${style.colorExperiment} !bg-background-default`,
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
