import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import {
  getPostReadTarget,
  getReadPostButtonText,
  isInternalReadType,
  isPostOrSharedPostTwitter,
  PostType,
} from '../../graphql/posts';
import { getReadPostButtonIcon } from '../cards/common/ReadArticleButton';
import classed from '../../lib/classed';
import { Button, ButtonIconPosition, ButtonVariant } from '../buttons/Button';
import SettingsContext from '../../contexts/SettingsContext';
import type { PostHeaderActionsProps } from './common';
import { PostMenuOptions } from './PostMenuOptions';
import { Origin } from '../../lib/log';
import { CollectionSubscribeButton } from './collection/CollectionSubscribeButton';
import { useViewSizeClient, ViewSize } from '../../hooks';
import { BoostPostButton } from '../../features/boost/BoostButton';
import { Tooltip } from '../tooltip/Tooltip';
import { useShowBoostButton } from '../../features/boost/useShowBoostButton';

const Container = classed('div', 'flex flex-row items-center');

export function PostHeaderActions({
  onReadArticle,
  post,
  onClose,
  inlineActions,
  className,
  notificationClassName,
  contextMenuId: _contextMenuId,
  isFixedNavigation,
  buttonSize,
  hideSubscribeAction,
  ...props
}: PostHeaderActionsProps): ReactElement {
  const { openNewTab } = useContext(SettingsContext);
  const isMobile = useViewSizeClient(ViewSize.MobileXL);
  const readButtonText = getReadPostButtonText(post);
  const isCollection = post?.type === PostType.Collection;
  const isInternalReadTyped = isInternalReadType(post);
  const isTwitter = isPostOrSharedPostTwitter(post);
  const isBoostButtonVisible = useShowBoostButton({ post });
  const isPoll = post?.type === PostType.Poll;
  const { target: readTarget } = getPostReadTarget(post);
  const readHref = readTarget?.permalink ?? post.permalink;

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      {!isPoll && !isInternalReadTyped && !!onReadArticle && (
        <Tooltip
          side="bottom"
          content={readButtonText}
          visible={!inlineActions}
        >
          <Button
            variant={
              isFixedNavigation || isMobile
                ? ButtonVariant.Tertiary
                : ButtonVariant.Secondary
            }
            tag="a"
            href={readHref}
            target={openNewTab ? '_blank' : '_self'}
            icon={getReadPostButtonIcon(post)}
            iconPosition={
              isTwitter ? ButtonIconPosition.Right : (undefined as never)
            }
            onClick={onReadArticle}
            data-testid="postActionsRead"
            size={buttonSize}
          >
            {!inlineActions ? readButtonText : undefined}
          </Button>
        </Tooltip>
      )}
      {isBoostButtonVisible && (
        <BoostPostButton post={post} buttonProps={{ size: buttonSize }} />
      )}
      {isCollection && !hideSubscribeAction && (
        <CollectionSubscribeButton post={post} />
      )}
      <PostMenuOptions
        post={post}
        origin={Origin.ArticleModal}
        buttonSize={buttonSize}
      />
    </Container>
  );
}
