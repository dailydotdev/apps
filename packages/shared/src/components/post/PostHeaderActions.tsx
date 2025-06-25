import type { ReactElement } from 'react';
import React, { useCallback, useContext } from 'react';
import classNames from 'classnames';
import { OpenLinkIcon } from '../icons';
import {
  getReadPostButtonText,
  isInternalReadType,
  PostType,
  useCanBoostPost,
} from '../../graphql/posts';
import classed from '../../lib/classed';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import SettingsContext from '../../contexts/SettingsContext';
import type { PostHeaderActionsProps } from './common';
import { PostMenuOptions } from './PostMenuOptions';
import { Origin } from '../../lib/log';
import { CollectionSubscribeButton } from './collection/CollectionSubscribeButton';
import { useViewSizeClient, ViewSize } from '../../hooks';
import { BoostPostButton } from '../../features/boost/BoostPostButton';
import { Tooltip } from '../tooltip/Tooltip';

const Container = classed('div', 'flex flex-row items-center');

interface GetButtonVariantProps {
  inlineActions: boolean;
}

const getButtonVariant = ({
  inlineActions,
}: GetButtonVariantProps): ButtonVariant => {
  if (inlineActions) {
    return ButtonVariant.Tertiary;
  }

  return ButtonVariant.Primary;
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
  isFixedNavigation,
  ...props
}: PostHeaderActionsProps): ReactElement {
  const { openNewTab } = useContext(SettingsContext);
  const isLaptop = useViewSizeClient(ViewSize.Laptop);
  const readButtonText = getReadPostButtonText(post);
  const isCollection = post?.type === PostType.Collection;
  const isEnlarged = isFixedNavigation || isLaptop;
  const { canBoost } = useCanBoostPost(post);
  const ButtonWithExperiment = useCallback(() => {
    return (
      <Tooltip side="bottom" content={readButtonText} visible={!inlineActions}>
        <Button
          variant={
            isEnlarged
              ? getButtonVariant({ inlineActions })
              : ButtonVariant.Float
          }
          tag="a"
          href={post.sharedPost?.permalink ?? post.permalink}
          target={openNewTab ? '_blank' : '_self'}
          icon={<OpenLinkIcon />}
          onClick={onReadArticle}
          data-testid="postActionsRead"
          size={isEnlarged ? ButtonSize.Medium : ButtonSize.Small}
        >
          {!inlineActions ? readButtonText : null}
        </Button>
      </Tooltip>
    );
  }, [
    inlineActions,
    isEnlarged,
    onReadArticle,
    openNewTab,
    post.permalink,
    post.sharedPost?.permalink,
    readButtonText,
  ]);

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      {!isInternalReadType(post) && !!onReadArticle && <ButtonWithExperiment />}
      {!post.flags?.campaignId && canBoost && <BoostPostButton post={post} />}
      {isCollection && <CollectionSubscribeButton post={post} isCondensed />}
      <PostMenuOptions
        post={post}
        onClose={onClose}
        inlineActions={inlineActions}
        contextMenuId={contextMenuId}
        onRemovePost={onRemovePost}
        origin={Origin.ArticleModal}
        isEnlarged={isEnlarged}
      />
    </Container>
  );
}
