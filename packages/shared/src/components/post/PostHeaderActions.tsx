import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { OpenLinkIcon } from '../icons';
import {
  PostType,
  getReadPostButtonText,
  isInternalReadType,
} from '../../graphql/posts';
import classed from '../../lib/classed';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { Button, ButtonVariant } from '../buttons/Button';
import SettingsContext from '../../contexts/SettingsContext';
import { PostHeaderActionsProps } from './common';
import { PostMenuOptions } from './PostMenuOptions';
import { Origin } from '../../lib/analytics';
import { CollectionSubscribeButton } from './collection/CollectionSubscribeButton';
import { SourceSubscribeExperiment } from '../../lib/featureValues';
import { feature } from '../../lib/featureManagement';
import { useFeature } from '../GrowthBookProvider';

const Container = classed('div', 'flex flex-row items-center');

type PostHeaderActionsPropsNoShare = Omit<PostHeaderActionsProps, 'onShare'>;

const getButtonVariant = ({
  inlineActions,
  isSourceSubscribeV1,
}: {
  inlineActions: boolean;
  isSourceSubscribeV1: boolean;
}): ButtonVariant => {
  if (inlineActions) {
    return ButtonVariant.Tertiary;
  }

  if (isSourceSubscribeV1) {
    return ButtonVariant.Primary;
  }

  return ButtonVariant.Secondary;
};

export function PostHeaderActions({
  onReadArticle,
  post,
  onClose,
  inlineActions,
  className,
  notificationClassName,
  contextMenuId,
  onRemovePost,
  ...props
}: PostHeaderActionsPropsNoShare): ReactElement {
  const { openNewTab } = useContext(SettingsContext);

  const readButtonText = getReadPostButtonText(post);
  const isCollection = post?.type === PostType.Collection;

  const ButtonWithExperiment = () => {
    const isSourceSubscribeV1 =
      useFeature(feature.sourceSubscribe) === SourceSubscribeExperiment.V1;

    return (
      <SimpleTooltip
        placement="bottom"
        content={readButtonText}
        disabled={!inlineActions}
      >
        <Button
          variant={getButtonVariant({ inlineActions, isSourceSubscribeV1 })}
          tag="a"
          href={post.sharedPost?.permalink ?? post.permalink}
          target={openNewTab ? '_blank' : '_self'}
          icon={<OpenLinkIcon />}
          onClick={onReadArticle}
          data-testid="postActionsRead"
        >
          {!inlineActions && readButtonText}
        </Button>
      </SimpleTooltip>
    );
  };

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      {!isInternalReadType(post) && !!onReadArticle && <ButtonWithExperiment />}
      {isCollection && <CollectionSubscribeButton post={post} isCondensed />}
      <PostMenuOptions
        post={post}
        onClose={onClose}
        inlineActions={inlineActions}
        contextMenuId={contextMenuId}
        onRemovePost={onRemovePost}
        origin={Origin.ArticleModal}
      />
    </Container>
  );
}
