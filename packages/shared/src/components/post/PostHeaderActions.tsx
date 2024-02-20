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

const Container = classed('div', 'flex flex-row items-center');

export function PostHeaderActions({
  onReadArticle,
  onShare,
  post,
  onClose,
  inlineActions,
  className,
  notificationClassName,
  contextMenuId,
  onRemovePost,
  ...props
}: PostHeaderActionsProps): ReactElement {
  const { openNewTab } = useContext(SettingsContext);

  const readButtonText = getReadPostButtonText(post);
  const isCollection = post?.type === PostType.Collection;

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      {!isInternalReadType(post) && !!onReadArticle && (
        <SimpleTooltip
          placement="bottom"
          content={readButtonText}
          disabled={!inlineActions}
        >
          <Button
            variant={
              inlineActions ? ButtonVariant.Tertiary : ButtonVariant.Secondary
            }
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
      )}
      {isCollection && <CollectionSubscribeButton post={post} isCondensed />}
      <PostMenuOptions
        onShare={onShare}
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
