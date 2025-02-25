import type { ReactElement } from 'react';
import React, { useCallback, useContext } from 'react';
import classNames from 'classnames';
import { OpenLinkIcon } from '../icons';
import { isInternalReadType, PostType } from '../../graphql/posts';
import classed from '../../lib/classed';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import SettingsContext from '../../contexts/SettingsContext';
import type { PostHeaderActionsProps } from './common';
import { PostMenuOptions } from './PostMenuOptions';
import { Origin } from '../../lib/log';
import { CollectionSubscribeButton } from './collection/CollectionSubscribeButton';
import { useViewSizeClient, ViewSize } from '../../hooks';
import { useVisitLink } from '../cards/common/list/hooks';

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
  const visitLinkCopy = useVisitLink({ post });
  const isCollection = post?.type === PostType.Collection;
  const isEnlarged = isFixedNavigation || isLaptop;
  const ButtonWithExperiment = useCallback(() => {
    return (
      <SimpleTooltip
        placement="bottom"
        content={visitLinkCopy}
        disabled={!inlineActions}
      >
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
          {!inlineActions ? visitLinkCopy : null}
        </Button>
      </SimpleTooltip>
    );
  }, [
    inlineActions,
    isEnlarged,
    onReadArticle,
    openNewTab,
    post.permalink,
    post.sharedPost?.permalink,
    visitLinkCopy,
  ]);

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
        isEnlarged={isEnlarged}
      />
    </Container>
  );
}
