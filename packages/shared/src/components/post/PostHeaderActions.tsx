import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import { OpenLinkIcon, TwitterIcon } from '../icons';
import {
  getReadPostButtonText,
  isSocialTwitterPost,
  isInternalReadType,
  PostType,
} from '../../graphql/posts';
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
import { IconSize } from '../Icon';

const Container = classed('div', 'flex flex-row items-center');

export function PostHeaderActions({
  onReadArticle,
  post,
  onClose,
  inlineActions,
  className,
  notificationClassName,
  isFixedNavigation,
  buttonSize,
  ...props
}: PostHeaderActionsProps): ReactElement {
  const { openNewTab } = useContext(SettingsContext);
  const isMobile = useViewSizeClient(ViewSize.MobileXL);
  const isSocialTwitter =
    isSocialTwitterPost(post) ||
    post.sharedPost?.type === PostType.SocialTwitter;
  const readButtonText = isSocialTwitter
    ? 'Read on'
    : getReadPostButtonText(post);
  const readButtonHref = isSocialTwitter
    ? post.commentsPermalink
    : post.sharedPost?.permalink ?? post.permalink;
  const readButtonIcon = isSocialTwitter ? (
    <TwitterIcon size={IconSize.Size16} />
  ) : (
    <OpenLinkIcon />
  );
  const isCollection = post?.type === PostType.Collection;
  const isInternalReadTyped = isInternalReadType(post);
  const isBoostButtonVisible = useShowBoostButton({ post });
  const isPoll = post?.type === PostType.Poll;

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
            href={readButtonHref}
            target={openNewTab ? '_blank' : '_self'}
            icon={readButtonIcon}
            iconPosition={
              isSocialTwitter ? ButtonIconPosition.Right : undefined
            }
            onClick={onReadArticle}
            data-testid="postActionsRead"
            size={buttonSize}
          >
            {!inlineActions ? readButtonText : null}
          </Button>
        </Tooltip>
      )}
      {isBoostButtonVisible && (
        <BoostPostButton post={post} buttonProps={{ size: buttonSize }} />
      )}
      {isCollection && <CollectionSubscribeButton post={post} />}
      <PostMenuOptions
        post={post}
        origin={Origin.ArticleModal}
        buttonSize={buttonSize}
      />
    </Container>
  );
}
